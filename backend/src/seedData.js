// backend/src/seedData.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const WorkspaceMember = require('./models/WorkspaceMember');
const WorkspaceInvitation = require('./models/WorkspaceInvitation');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── FULL CLEAN WIPE ───────────────────────────────────────
    console.log('🧹 Clearing all existing data (users, workspaces, projects, tasks, logs, notifications)...');
    await Promise.all([
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
      Comment.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      WorkspaceInvitation.deleteMany({}),
      WorkspaceMember.deleteMany({}),
      Workspace.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('✅ Database wiped cleanly\n');

    // ── PAKISTANI TEAM USERS ──────────────────────────────────
    console.log('👤 Creating Pakistani team accounts...');
    const owner = await User.create({
      fullName: 'Adeeba Tariq',
      email: 'admin@worksphere.com',
      password: 'password123',
      title: 'Founder & Workspace Owner',
      phone: '+92 300 4128901',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AdeebaTariq&backgroundColor=ede9fe',
    });

    const manager = await User.create({
      fullName: 'Hamza Siddiqui',
      email: 'manager@worksphere.com',
      password: 'password123',
      title: 'Senior Project Manager',
      phone: '+92 321 5543210',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=HamzaSiddiqui&backgroundColor=ddd6fe',
    });

    const member1 = await User.create({
      fullName: 'Ayesha Khan',
      email: 'member@worksphere.com',
      password: 'password123',
      title: 'Full-Stack Software Engineer',
      phone: '+92 333 9876543',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AyeshaKhan&backgroundColor=fce7f3',
    });

    const member2 = await User.create({
      fullName: 'Bilal Ahmed',
      email: 'bilal.ahmed@worksphere.com',
      password: 'password123',
      title: 'Frontend & UI/UX Engineer',
      phone: '+92 345 7712345',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=BilalAhmed&backgroundColor=dbeafe',
    });

    const member3 = await User.create({
      fullName: 'Zainab Raza',
      email: 'zainab.raza@worksphere.com',
      password: 'password123',
      title: 'Quality Assurance Lead',
      phone: '+92 312 6654321',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ZainabRaza&backgroundColor=dcfce7',
    });

    const member4 = await User.create({
      fullName: 'Usman Farooq',
      email: 'usman.farooq@worksphere.com',
      password: 'password123',
      title: 'Backend & DevOps Engineer',
      phone: '+92 301 8845123',
      profilePicture: 'https://api.dicebear.com/9.x/avataaars/svg?seed=UsmanFarooq&backgroundColor=fef3c7',
    });

    console.log('✅ 6 Pakistani team accounts created\n');

    // ── WORKSPACE ─────────────────────────────────────────────
    console.log('🏢 Creating workspace...');
    const workspace = await Workspace.create({
      name: 'Software Engineering & Product',
      description: 'Central engineering workspace for WorkSphere Pakistan — product delivery, QA, and cloud operations.',
      owner: owner._id,
      status: 'Active',
    });

    await WorkspaceMember.create([
      { workspace: workspace._id, user: owner._id, role: 'Owner', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: manager._id, role: 'Manager', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: member1._id, role: 'Member', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: member2._id, role: 'Member', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: member3._id, role: 'Member', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: member4._id, role: 'Member', status: 'Active', joinedAt: new Date() },
    ]);
    console.log(`✅ Workspace created: ${workspace.name}\n`);

    // ── PROJECTS ──────────────────────────────────────────────
    console.log('📁 Creating realistic projects...');
    const now = new Date();
    const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

    const proj1 = await Project.create({
      workspace: workspace._id,
      name: 'WorkSphere Enterprise Portal',
      description: 'Core SaaS platform with RBAC permissions, Cloudinary media uploads, and real-time analytics.',
      manager: manager._id,
      members: [owner._id, manager._id, member1._id, member2._id, member3._id],
      status: 'In Progress',
      priority: 'High',
      startDate: addDays(now, -25),
      endDate: addDays(now, 20),
      createdBy: owner._id,
    });

    const proj2 = await Project.create({
      workspace: workspace._id,
      name: 'PayPak Fintech Mobile App',
      description: 'Raast instant payment integration, biometric login, and merchant QR checkout for Pakistani SMEs.',
      manager: manager._id,
      members: [manager._id, member1._id, member4._id],
      status: 'In Progress',
      priority: 'Critical',
      startDate: addDays(now, -18),
      endDate: addDays(now, 12),
      createdBy: manager._id,
    });

    const proj3 = await Project.create({
      workspace: workspace._id,
      name: 'Lahore Smart Logistics CRM',
      description: 'Fleet dispatch dashboard, courier live tracking, and automated invoice reconciliation.',
      manager: owner._id,
      members: [owner._id, member2._id, member3._id, member4._id],
      status: 'In Progress',
      priority: 'Medium',
      startDate: addDays(now, -12),
      endDate: addDays(now, 30),
      createdBy: owner._id,
    });

    const proj4 = await Project.create({
      workspace: workspace._id,
      name: 'CloudDocs Analytics Engine',
      description: 'Automated CSV reporting pipeline and executive telemetry charts for leadership.',
      manager: manager._id,
      members: [manager._id, member1._id, member3._id],
      status: 'Planning',
      priority: 'Medium',
      startDate: addDays(now, -5),
      endDate: addDays(now, 40),
      createdBy: manager._id,
    });

    console.log('✅ 4 Projects created\n');

    // ── TASKS ─────────────────────────────────────────────────
    console.log('📝 Creating tasks across all Kanban stages...');
    const tasksData = [
      // Proj 1
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Enforce 4.4 Role Permission Matrix on APIs',
        description: 'Validate Owner, Manager, and Member permissions on every workspace, project, and task route.',
        createdBy: owner._id,
        assignedTo: [member1._id],
        status: 'Completed',
        priority: 'Critical',
        startDate: addDays(now, -20),
        dueDate: addDays(now, -8),
        updatedAt: addDays(now, -7),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Integrate Cloudinary Profile Picture Upload',
        description: 'Upload user avatars to Cloudinary and persist secure_url inside MongoDB User model.',
        createdBy: owner._id,
        assignedTo: [member2._id],
        status: 'Completed',
        priority: 'High',
        startDate: addDays(now, -14),
        dueDate: addDays(now, -3),
        updatedAt: addDays(now, -2),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'QA Regression Suite for RBAC & CSV Export',
        description: 'Verify CSV download headers, permission boundaries, and notification read/unread toggles.',
        createdBy: manager._id,
        assignedTo: [member3._id],
        status: 'In Review',
        priority: 'High',
        startDate: addDays(now, -4),
        dueDate: addDays(now, 2),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Optimize MongoDB Atlas Aggregation Indexes',
        description: 'Add compound indexes for workspace tasks and activity logs to keep dashboard under 120ms.',
        createdBy: manager._id,
        assignedTo: [member4._id],
        status: 'In Progress',
        priority: 'Medium',
        startDate: addDays(now, -3),
        dueDate: addDays(now, 5),
      },

      // Proj 2
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'Raast Instant Transfer Webhook Handler',
        description: 'Handle signed settlement callbacks and idempotent ledger updates.',
        createdBy: manager._id,
        assignedTo: [member4._id],
        status: 'Completed',
        priority: 'Critical',
        startDate: addDays(now, -15),
        dueDate: addDays(now, -4),
        updatedAt: addDays(now, -4),
      },
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'Biometric & OTP Checkout Flow',
        description: 'Build responsive mobile verification modal with retry cooldown.',
        createdBy: manager._id,
        assignedTo: [member1._id],
        status: 'In Progress',
        priority: 'High',
        startDate: addDays(now, -5),
        dueDate: addDays(now, 3),
      },
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'Merchant QR Settlement Reconciliation',
        description: 'Cross-check daily merchant payouts against bank settlement files.',
        createdBy: manager._id,
        assignedTo: [member1._id],
        status: 'To Do',
        priority: 'High',
        startDate: now,
        dueDate: addDays(now, 6),
      },

      // Proj 3
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Courier Live Route Map Component',
        description: 'Display active Lahore delivery zones and rider ETA cards.',
        createdBy: owner._id,
        assignedTo: [member2._id],
        status: 'Completed',
        priority: 'Medium',
        startDate: addDays(now, -10),
        dueDate: addDays(now, -2),
        updatedAt: addDays(now, -1),
      },
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Automated COD Invoice PDF Generator',
        description: 'Generate itemized cash-on-delivery statements for regional hubs.',
        createdBy: owner._id,
        assignedTo: [member4._id],
        status: 'In Review',
        priority: 'High',
        startDate: addDays(now, -6),
        dueDate: addDays(now, 1),
      },
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Dispatch SLA Breach Alert Rules',
        description: 'Trigger overdue warning badges when hub pickup exceeds 4 hours.',
        createdBy: owner._id,
        assignedTo: [member3._id],
        status: 'In Progress',
        priority: 'Urgent',
        startDate: addDays(now, -7),
        dueDate: addDays(now, -1), // 1 realistic overdue task for Overdue Warnings KPI
      },

      // Proj 4
      {
        workspace: workspace._id,
        project: proj4._id,
        title: 'Executive CSV Export Schema Validation',
        description: 'Ensure tasks and projects CSV exports sanitize formulas and include overdue flags.',
        createdBy: manager._id,
        assignedTo: [member1._id],
        status: 'Completed',
        priority: 'Medium',
        startDate: addDays(now, -4),
        dueDate: addDays(now, -1),
        updatedAt: now,
      },
      {
        workspace: workspace._id,
        project: proj4._id,
        title: 'Monthly Completion Velocity Chart Tests',
        description: 'Verify chart aggregation across completed tasks by calendar month.',
        createdBy: manager._id,
        assignedTo: [member3._id],
        status: 'To Do',
        priority: 'Low',
        startDate: now,
        dueDate: addDays(now, 10),
      },
    ];

    const createdTasks = await Task.insertMany(tasksData);
    console.log(`✅ ${createdTasks.length} Tasks created\n`);

    // ── COMMENTS ──────────────────────────────────────────────
    await Comment.create([
      {
        task: createdTasks[2]._id,
        user: member3._id,
        content: 'Completed RBAC API regression checks for Owner, Manager, and Member roles — all 403 guards verified.',
      },
      {
        task: createdTasks[5]._id,
        user: manager._id,
        content: 'Ayesha, please prioritize the OTP resend timer before Friday sprint demo.',
      },
    ]);

    // ── ACTIVITY LOGS ─────────────────────────────────────────
    await ActivityLog.insertMany([
      {
        workspace: workspace._id,
        project: proj1._id,
        actor: owner._id,
        action: 'PROJECT_CREATED',
        description: `${owner.fullName} created project "${proj1.name}"`,
        createdAt: addDays(now, -25),
      },
      {
        workspace: workspace._id,
        project: proj2._id,
        actor: manager._id,
        action: 'PROJECT_CREATED',
        description: `${manager.fullName} created project "${proj2.name}"`,
        createdAt: addDays(now, -18),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        task: createdTasks[0]._id,
        actor: member1._id,
        action: 'TASK_STATUS_CHANGED',
        description: `${member1.fullName} marked "${createdTasks[0].title}" as Completed`,
        oldValue: 'In Review',
        newValue: 'Completed',
        createdAt: addDays(now, -7),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        task: createdTasks[1]._id,
        actor: member2._id,
        action: 'TASK_STATUS_CHANGED',
        description: `${member2.fullName} marked "${createdTasks[1].title}" as Completed`,
        oldValue: 'In Progress',
        newValue: 'Completed',
        createdAt: addDays(now, -2),
      },
      {
        workspace: workspace._id,
        project: proj4._id,
        actor: manager._id,
        action: 'PROJECT_CREATED',
        description: `${manager.fullName} created project "${proj4.name}"`,
        createdAt: addDays(now, -1),
      },
    ]);

    // ── NOTIFICATIONS (Unread for Owner, Manager & Members) ───
    await Notification.insertMany([
      {
        recipient: owner._id,
        workspace: workspace._id,
        type: 'ProjectAdded',
        title: 'New Project Created',
        message: `${manager.fullName} (Manager) created a new project "${proj2.name}".`,
        relatedEntity: { entityType: 'Project', entityId: proj2._id },
        isRead: false,
      },
      {
        recipient: owner._id,
        workspace: workspace._id,
        type: 'ProjectAdded',
        title: 'New Project Created',
        message: `${manager.fullName} (Manager) created a new project "${proj4.name}".`,
        relatedEntity: { entityType: 'Project', entityId: proj4._id },
        isRead: false,
      },
      {
        recipient: manager._id,
        workspace: workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Added to Workspace',
        message: `${owner.fullName} (Owner) invited and added you to "${workspace.name}" as Manager.`,
        relatedEntity: { entityType: 'Workspace', entityId: workspace._id },
        isRead: false,
      },
      {
        recipient: member1._id,
        workspace: workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Added to Workspace',
        message: `${owner.fullName} (Owner) invited and added you to "${workspace.name}" as Member.`,
        relatedEntity: { entityType: 'Workspace', entityId: workspace._id },
        isRead: false,
      },
      {
        recipient: member1._id,
        workspace: workspace._id,
        type: 'TaskAssigned',
        title: 'New Task Assigned',
        message: `${manager.fullName} assigned you "${createdTasks[5].title}" in ${proj2.name}.`,
        relatedEntity: { entityType: 'Task', entityId: createdTasks[5]._id },
        isRead: false,
      },
      {
        recipient: member2._id,
        workspace: workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Added to Workspace',
        message: `${owner.fullName} (Owner) invited and added you to "${workspace.name}" as Member.`,
        relatedEntity: { entityType: 'Workspace', entityId: workspace._id },
        isRead: false,
      },
      {
        recipient: member3._id,
        workspace: workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Added to Workspace',
        message: `${owner.fullName} (Owner) invited and added you to "${workspace.name}" as Member.`,
        relatedEntity: { entityType: 'Workspace', entityId: workspace._id },
        isRead: false,
      },
    ]);

    console.log('══════════════════════════════════════════════════════');
    console.log('🎉 WorkSphere Pakistani Real Seed Data Ready!');
    console.log('══════════════════════════════════════════════════════');
    console.log('  👑 Owner   : admin@worksphere.com        / password123 (Adeeba Tariq)');
    console.log('  📋 Manager : manager@worksphere.com      / password123 (Hamza Siddiqui)');
    console.log('  👤 Member  : member@worksphere.com       / password123 (Ayesha Khan)');
    console.log('  👤 Member  : bilal.ahmed@worksphere.com  / password123 (Bilal Ahmed)');
    console.log('  👤 Member  : zainab.raza@worksphere.com  / password123 (Zainab Raza)');
    console.log('  👤 Member  : usman.farooq@worksphere.com / password123 (Usman Farooq)');
    console.log('══════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
