// WorkSphere — New-User RBAC Final Verification Script
// Run: cd backend && node rbac_final_test.js

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

// ─── HTTP helper ────────────────────────────────────────────────────────────
function apiCall(method, path, body, token, wsId) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1' + path,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(wsId  ? { 'x-workspace-id': wsId } : {}),
        ...(data  ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

// ─── Assertion helpers ───────────────────────────────────────────────────────
const PASS = [];
const FAIL = [];

function assert(label, actual, expected) {
  const ok = Array.isArray(expected) ? expected.includes(actual) : actual === expected;
  const exp = Array.isArray(expected) ? expected.join(' | ') : String(expected);
  console.log('  ' + (ok ? '✅' : '❌') + ' ' + label + '  →  HTTP ' + actual + '  (expected ' + exp + ')');
  if (ok) { PASS.push(label); } else { FAIL.push({ label, actual, expected: exp }); }
  return ok;
}

function assertVal(label, actual, expected) {
  const ok = String(actual) === String(expected);
  console.log('  ' + (ok ? '✅' : '❌') + ' ' + label + '  →  "' + actual + '"  (expected "' + expected + '")');
  if (ok) { PASS.push(label); } else { FAIL.push({ label, actual: String(actual), expected: String(expected) }); }
  return ok;
}

function section(title) {
  console.log('');
  console.log('── ' + title + ' ' + '─'.repeat(Math.max(0, 54 - title.length)));
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const NEW_EMAIL = 'newuser_' + Date.now() + '@testrbac.com';
  const PASSWORD  = 'SecureTest123!';

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  WorkSphere — New-User RBAC Final Verification           ');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Test account : ' + NEW_EMAIL);
  console.log('  Timestamp    : ' + new Date().toISOString());

  // ─── STEP 1: Register ────────────────────────────────────────────
  section('STEP 1: Register Brand-New User');
  const regRes = await apiCall('POST', '/auth/register', {
    fullName: 'Test NewUser',
    email: NEW_EMAIL,
    password: PASSWORD,
  });
  console.log('  Registration HTTP   : ' + regRes.status);
  console.log('  Response message    : ' + (regRes.body?.message || JSON.stringify(regRes.body).slice(0, 120)));
  if (regRes.status !== 201) {
    console.log('  FATAL: Registration failed — aborting.');
    process.exit(1);
  }
  const newUserId = regRes.body?.data?.user?._id || regRes.body?.data?._id || 'unknown';
  console.log('  New user _id        : ' + newUserId);

  // ─── STEP 2: Login ───────────────────────────────────────────────
  section('STEP 2: Login as New User');
  const loginRes = await apiCall('POST', '/auth/login', { email: NEW_EMAIL, password: PASSWORD });
  if (loginRes.status !== 200) {
    console.log('  FATAL: Login failed — HTTP ' + loginRes.status);
    process.exit(1);
  }
  const newToken = loginRes.body?.data?.token;
  console.log('  Login status        : HTTP 200 — OK');
  console.log('  Token obtained      : ' + (newToken ? 'YES (' + newToken.slice(0, 24) + '...)' : 'NO — FATAL'));
  if (!newToken) { console.log('  FATAL: No token returned.'); process.exit(1); }

  // ─── STEP 3: MongoDB direct inspection ───────────────────────────
  section('STEP 3: MongoDB Direct Inspection (WorkspaceMember)');
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('  MongoDB connected   : ' + mongoose.connection.host);

  // Load ALL models so mongoose knows about them before populate
  const User            = require('./src/models/User');
  const WorkspaceMember = require('./src/models/WorkspaceMember');
  require('./src/models/Workspace'); // needed for populate('workspace')

  const dbUser = await User.findOne({ email: NEW_EMAIL }).select('fullName email createdAt');
  console.log('  DB User.email       : ' + dbUser?.email);
  console.log('  DB User.fullName    : ' + dbUser?.fullName);
  console.log('  DB User._id         : ' + dbUser?._id);

  const memberships = await WorkspaceMember.find({ user: dbUser?._id })
    .populate('workspace', 'name')
    .select('role status workspace joinedAt');

  console.log('  WorkspaceMember rows: ' + memberships.length);

  if (memberships.length === 0) {
    console.log('  ⚠️  No WorkspaceMember record — user has no workspace!');
    FAIL.push({ label: 'WorkspaceMember record exists', actual: '0', expected: '1+' });
  }

  memberships.forEach((m, i) => {
    const ws = m.workspace;
    console.log('  [' + (i + 1) + '] workspace="' + ws?.name + '"  role=' + m.role + '  status=' + m.status);
    assertVal('DB role for workspace "' + ws?.name + '" is Member', m.role, 'Member');
    assertVal('DB status for workspace "' + ws?.name + '" is Active', m.status, 'Active');
  });

  await mongoose.disconnect();
  console.log('  MongoDB disconnected.');

  // ─── STEP 4: Workspace lookup via API ────────────────────────────
  section('STEP 4: Workspace API — Frontend Role Detection');
  const wsListRes = await apiCall('GET', '/workspaces', null, newToken, '');
  const workspaces = wsListRes.body?.data || [];
  const ws = workspaces[0];
  const wsId = ws?._id;
  console.log('  GET /workspaces     : HTTP ' + wsListRes.status);
  console.log('  Workspaces found    : ' + workspaces.length);
  if (ws) {
    console.log('  Workspace name      : ' + ws.name);
    console.log('  Workspace _id       : ' + wsId);
    console.log('  memberRole in resp  : ' + ws.memberRole);
    assertVal('API response memberRole is Member', ws.memberRole, 'Member');
  }

  // ─── STEP 5: ALL FORBIDDEN OPERATIONS ────────────────────────────
  section('STEP 5: Forbidden Operations (all must return 403)');

  // 5a – Create workspace
  const r5a = await apiCall('POST', '/workspaces', { name: 'Hacked WS' }, newToken, wsId);
  assert('[Member] Create workspace  POST /workspaces', r5a.status, 403);

  // 5b – Invite member
  const r5b = await apiCall('POST', '/workspaces/' + wsId + '/invitations',
    { email: 'victim@hack.com', role: 'Owner' }, newToken, wsId);
  assert('[Member] Invite member     POST /invitations', r5b.status, 403);

  // 5c – Change role
  const r5c = await apiCall('PATCH', '/workspaces/' + wsId + '/members/000000000000000000000001/role',
    { role: 'Owner' }, newToken, wsId);
  assert('[Member] Change role       PATCH /members/:id/role', r5c.status, [403, 404]);

  // 5d – Remove member
  const r5d = await apiCall('DELETE', '/workspaces/' + wsId + '/members/000000000000000000000001',
    null, newToken, wsId);
  assert('[Member] Remove member     DELETE /members/:id', r5d.status, [403, 404]);

  // 5e – Create project
  const r5e = await apiCall('POST', '/projects',
    { name: 'Hacked Project', endDate: '2027-12-31' }, newToken, wsId);
  assert('[Member] Create project    POST /projects', r5e.status, 403);

  // Need a real project for the next tests
  const ownLogin = await apiCall('POST', '/auth/login', { email: 'admin@worksphere.com', password: 'Password123' });
  const ownerToken = ownLogin.body?.data?.token;
  const projList = await apiCall('GET', '/projects', null, ownerToken, wsId);
  const realProj = (projList.body?.data || []).find((p) => !p.isArchived);

  if (realProj) {
    // 5f – Delete project
    const r5f = await apiCall('DELETE', '/projects/' + realProj._id, null, newToken, wsId);
    assert('[Member] Delete project    DELETE /projects/:id', r5f.status, 403);

    // 5g – Archive project
    const r5g = await apiCall('PATCH', '/projects/' + realProj._id + '/archive', null, newToken, wsId);
    assert('[Member] Archive project   PATCH /projects/:id/archive', r5g.status, 403);

    // 5h – Create task
    const r5h = await apiCall('POST', '/tasks',
      { title: 'Hacked Task', project: realProj._id, dueDate: '2027-12-31' }, newToken, wsId);
    assert('[Member] Create task       POST /tasks', r5h.status, 403);

    // 5i – Create task with self-assign
    const r5i = await apiCall('POST', '/tasks',
      { title: 'Self-assign hack', project: realProj._id, dueDate: '2027-12-31', assignedTo: [newUserId] },
      newToken, wsId);
    assert('[Member] Assign task       POST /tasks (self-assign)', r5i.status, 403);

    // 5j – Update project (edit)
    const r5j = await apiCall('PATCH', '/projects/' + realProj._id,
      { name: 'Hacked Name' }, newToken, wsId);
    assert('[Member] Edit project      PATCH /projects/:id', r5j.status, 403);
  } else {
    console.log('  ⚠️  No real project found — skipping project-specific forbidden tests');
  }

  // 5k – Export CSV
  const r5k = await apiCall('GET', '/reports/export?type=tasks', null, newToken, wsId);
  assert('[Member] Export CSV        GET /reports/export', r5k.status, 403);

  // 5l – Update workspace settings
  const r5l = await apiCall('PATCH', '/workspaces/' + wsId, { name: 'Hacked Workspace' }, newToken, wsId);
  assert('[Member] Update workspace  PATCH /workspaces/:id', r5l.status, 403);

  // 5m – Delete workspace
  const r5m = await apiCall('DELETE', '/workspaces/' + wsId, null, newToken, wsId);
  assert('[Member] Delete workspace  DELETE /workspaces/:id', r5m.status, 403);

  // ─── STEP 6: ALL PERMITTED OPERATIONS ────────────────────────────
  section('STEP 6: Permitted Operations (all must return 200)');

  // 6a – Dashboard overview
  const r6a = await apiCall('GET', '/dashboard/overview', null, newToken, wsId);
  assert('[Member] Dashboard overview  GET /dashboard/overview', r6a.status, 200);
  if (r6a.status === 200) {
    console.log('    kpis.totalProjects  : ' + r6a.body?.data?.kpis?.totalProjects);
    console.log('    kpis.totalTasks     : ' + r6a.body?.data?.kpis?.totalTasks);
  }

  // 6b – List projects (scoped to member projects)
  const r6b = await apiCall('GET', '/projects', null, newToken, wsId);
  assert('[Member] List projects       GET /projects', r6b.status, 200);
  console.log('    Projects visible : ' + (r6b.body?.data?.length ?? 0));

  // 6c – List tasks
  const r6c = await apiCall('GET', '/tasks', null, newToken, wsId);
  assert('[Member] List tasks          GET /tasks', r6c.status, 200);
  console.log('    Tasks visible    : ' + (r6c.body?.data?.length ?? 0));

  // 6d – My tasks
  const r6d = await apiCall('GET', '/tasks/my-tasks', null, newToken, wsId);
  assert('[Member] My tasks            GET /tasks/my-tasks', r6d.status, 200);
  console.log('    My tasks count   : ' + (r6d.body?.data?.length ?? 0));

  // 6e – Activity logs
  const r6e = await apiCall('GET', '/activities', null, newToken, wsId);
  assert('[Member] Activity logs       GET /activities', r6e.status, 200);

  // 6f – Project report (read-only, scoped)
  const r6f = await apiCall('GET', '/reports/projects', null, newToken, wsId);
  assert('[Member] Project report      GET /reports/projects', r6f.status, 200);

  // 6g – Task report (read-only, scoped to assigned)
  const r6g = await apiCall('GET', '/reports/tasks', null, newToken, wsId);
  assert('[Member] Task report         GET /reports/tasks', r6g.status, 200);

  // 6h – Notifications
  const r6h = await apiCall('GET', '/notifications', null, newToken, wsId);
  assert('[Member] Notifications       GET /notifications', r6h.status, 200);

  // 6i – Update status on an ASSIGNED task
  const myTasks = r6d.body?.data || [];
  if (myTasks.length > 0) {
    const myTask = myTasks[0];
    const newStatus = myTask.status === 'Completed' ? 'In Progress' : myTask.status;
    const r6i = await apiCall('PATCH', '/tasks/' + myTask._id, { status: newStatus }, newToken, wsId);
    assert('[Member] Update assigned task status PATCH /tasks/:id', r6i.status, 200);
  } else {
    console.log('  ⏭️  No assigned tasks — task status update test skipped (new user has no tasks yet)');
  }

  // 6j – Add comment to a task they can see
  const visibleTasks = r6c.body?.data || [];
  if (visibleTasks.length > 0) {
    const r6j = await apiCall('POST', '/tasks/' + visibleTasks[0]._id + '/comments',
      { content: 'RBAC test comment from new Member' }, newToken, wsId);
    assert('[Member] Add comment         POST /tasks/:id/comments', r6j.status, [200, 201]);
  } else {
    console.log('  ⏭️  No visible tasks — comment test skipped');
  }

  // ─── FINAL REPORT ─────────────────────────────────────────────────
  const total  = PASS.length + FAIL.length;
  const pct    = Math.round((PASS.length / total) * 100);

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  FINAL TEST REPORT');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Test account     : ' + NEW_EMAIL);
  console.log('  User _id         : ' + newUserId);
  console.log('  Total tests      : ' + total);
  console.log('  PASSED           : ' + PASS.length + ' (' + pct + '%)');
  console.log('  FAILED           : ' + FAIL.length);
  console.log('');

  if (FAIL.length === 0) {
    console.log('  🎉 ALL TESTS PASSED');
    console.log('  New user is correctly scoped as Member across all');
    console.log('  backend APIs and MongoDB records.');
  } else {
    console.log('  FAILED TESTS:');
    FAIL.forEach((f) => {
      console.log('    ❌ ' + f.label);
      console.log('       got=' + f.actual + '  expected=' + f.expected);
    });
  }
  console.log('  Completed at     : ' + new Date().toISOString());
  console.log('══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('FATAL ERROR:', err.message);
  process.exit(1);
});
