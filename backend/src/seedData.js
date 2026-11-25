// backend/src/seedData.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const WorkspaceMember = require('./models/WorkspaceMember');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── CLEANUP ──────────────────────────────────────────────
    console.log('🧹 Cleaning up previous seed data...');
    const seedEmails = [
      'admin@worksphere.com',
      'manager@worksphere.com',
      'member@worksphere.com',
    ];
    const existingUsers = await User.find({ email: { $in: seedEmails } });
    const existingUserIds = existingUsers.map((u) => u._id);

    if (existingUserIds.length > 0) {
      await WorkspaceMember.deleteMany({ user: { $in: existingUserIds } });
      const workspaces = await Workspace.find({ owner: { $in: existingUserIds } });
      const wsIds = workspaces.map((w) => w._id);
      
      const projects = await Project.find({ workspace: { $in: wsIds } });
      const pIds = projects.map((p) => p._id);
      
      await Task.deleteMany({ project: { $in: pIds } });
      await ActivityLog.deleteMany({ workspace: { $in: wsIds } });
      await Project.deleteMany({ workspace: { $in: wsIds } });
      await Workspace.deleteMany({ owner: { $in: existingUserIds } });
      await User.deleteMany({ email: { $in: seedEmails } });
    }
    console.log('✅ Cleanup finished\n');

    // ── USERS ─────────────────────────────────────────────────
    console.log('👤 Creating demo users...');
    const owner = await User.create({
      fullName: 'Alex Morgan',
      email: 'admin@worksphere.com',
      password: 'Password123',
      title: 'Head of Engineering & Owner',
      profilePicture: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Morgan',
    });

    const manager = await User.create({
      fullName: 'Sarah Jenkins',
      email: 'manager@worksphere.com',
      password: 'Password123',
      title: 'Senior Project Manager',
      profilePicture: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Jenkins',
    });

    const member = await User.create({
      fullName: 'Fatima Noor',
      email: 'member@worksphere.com',
      password: 'Password123',
      title: 'Quality Assurance Lead',
      profilePicture: 'https://api.dicebear.com/7.x/initials/svg?seed=Fatima%20Noor',
    });

    console.log('✅ Users created:');
    console.log(`   - Owner: ${owner.email}`);
    console.log(`   - Manager: ${manager.email}`);
    console.log(`   - Member: ${member.email}\n`);

    // ── WORKSPACE ─────────────────────────────────────────────
    console.log('🏢 Creating workspace...');
    const workspace = await Workspace.create({
      name: 'Software Engineering & Product',
      description: 'Central engineering workspace for all core SaaS modules, architecture, and team workflows.',
      owner: owner._id,
      status: 'Active',
    });

    await WorkspaceMember.create([
      { workspace: workspace._id, user: owner._id, role: 'Owner', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: manager._id, role: 'Manager', status: 'Active', joinedAt: new Date() },
      { workspace: workspace._id, user: member._id, role: 'Member', status: 'Active', joinedAt: new Date() },
    ]);
    console.log('✅ Workspace created: ' + workspace.name + '\n');

    // ── PROJECTS ──────────────────────────────────────────────
    console.log('📁 Creating projects...');
    const now = new Date();
    const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

    const proj1 = await Project.create({
      workspace: workspace._id,
      name: 'WorkSphere Platform v2.0',
      description: 'Core platform rebuild with real-time analytics, role permission matrix, and automated reporting.',
      manager: manager._id,
      members: [owner._id, manager._id, member._id],
      status: 'In Progress',
      priority: 'High',
      startDate: now,
      endDate: addDays(now, 30),
      createdBy: owner._id,
    });

    const proj2 = await Project.create({
      workspace: workspace._id,
      name: 'Mobile App Experience',
      description: 'Cross-platform mobile application for iOS and Android with push notifications.',
      manager: manager._id,
      members: [manager._id, member._id],
      status: 'Planning',
      priority: 'Medium',
      startDate: now,
      endDate: addDays(now, 60),
      createdBy: manager._id,
    });

    const proj3 = await Project.create({
      workspace: workspace._id,
      name: 'Enterprise CRM Overhaul',
      description: 'Re-engineering lead pipelines, contact scoring, and customer health telemetry.',
      manager: owner._id,
      members: [owner._id, manager._id],
      status: 'In Progress',
      priority: 'Critical',
      startDate: now,
      endDate: addDays(now, 14),
      createdBy: owner._id,
    });

    console.log('✅ 3 Projects created\n');

    // ── TASKS ─────────────────────────────────────────────────
    console.log('📝 Creating real tasks across projects...');

    const tasksData = [
      // Proj 1
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Implement JWT authentication & refresh flow',
        description: 'Enforce 7-day token expiration with pre-save bcrypt hashing and Bearer header checks.',
        createdBy: owner._id,
        assignedTo: [owner._id],
        status: 'Completed',
        priority: 'High',
        startDate: addDays(now, -10),
        dueDate: addDays(now, -5),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Enforce SRS 4.4 Role Permission Matrix in controllers',
        description: 'Verify 403 Forbidden responses on Owner/Manager/Member restricted endpoints.',
        createdBy: owner._id,
        assignedTo: [manager._id],
        status: 'Completed',
        priority: 'Critical',
        startDate: addDays(now, -8),
        dueDate: addDays(now, -3),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Dashboard overview API aggregation pipeline',
        description: 'Implement real MongoDB facet metrics for task velocity, project completion and deadlines.',
        createdBy: manager._id,
        assignedTo: [owner._id],
        status: 'In Review',
        priority: 'High',
        startDate: addDays(now, -3),
        dueDate: addDays(now, 2),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Design premium modern SaaS Dashboard UI',
        description: 'Build responsive glassmorphic cards, Recharts area trends, and workflow stage badges.',
        createdBy: owner._id,
        assignedTo: [member._id],
        status: 'In Progress',
        startDate: addDays(now, -1),
        dueDate: addDays(now, 4),
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        title: 'Comprehensive test suite for auth controller',
        description: 'Test register, login, refresh token, password recovery, and invalid body guards.',
        createdBy: manager._id,
        assignedTo: [member._id],
        status: 'To Do',
        priority: 'Medium',
        startDate: now,
        dueDate: addDays(now, 12),
      },

      // Proj 2
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'React Native architecture & navigation structure',
        description: 'Configure React Navigation stack with offline caching and biometric unlock.',
        createdBy: manager._id,
        assignedTo: [manager._id],
        status: 'Completed',
        priority: 'High',
        startDate: addDays(now, -12),
        dueDate: addDays(now, -6),
      },
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'Mobile authentication & biometric login screens',
        description: 'Design sleek login, registration, and OTP verification flows.',
        createdBy: manager._id,
        assignedTo: [member._id],
        status: 'In Progress',
        priority: 'High',
        startDate: addDays(now, -2),
        dueDate: addDays(now, 6),
      },
      {
        workspace: workspace._id,
        project: proj2._id,
        title: 'Offline task sync with conflict resolution',
        description: 'Cache modified tasks locally in WatermelonDB and sync on network reconnection.',
        createdBy: manager._id,
        assignedTo: [member._id],
        status: 'To Do',
        priority: 'Medium',
        startDate: now,
        dueDate: addDays(now, 18),
      },

      // Proj 3
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Normalized CRM schema migration',
        description: 'Migrate contact documents with indexed compound keys and audit logging.',
        createdBy: owner._id,
        assignedTo: [owner._id],
        status: 'Completed',
        priority: 'Critical',
        startDate: addDays(now, -9),
        dueDate: addDays(now, -7),
      },
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Revenue forecast & conversion funnel charts',
        description: 'Implement monthly sales volume chart and pipeline conversion rates.',
        createdBy: owner._id,
        assignedTo: [manager._id],
        status: 'In Review',
        priority: 'High',
        startDate: addDays(now, -2),
        dueDate: addDays(now, 3),
      },
      {
        workspace: workspace._id,
        project: proj3._id,
        title: 'Automated CSV & PDF weekly report exporter',
        description: 'Create scheduled export tasks generating detailed team performance audits.',
        createdBy: manager._id,
        assignedTo: [member._id],
        status: 'In Progress',
        priority: 'Medium',
        startDate: now,
        dueDate: addDays(now, 7),
      },
    ];

    const createdTasks = await Task.insertMany(tasksData);
    console.log(`✅ ${createdTasks.length} real tasks created across 3 projects\n`);

    // ── ACTIVITIES ────────────────────────────────────────────
    console.log('⚡ Generating activity logs...');
    await ActivityLog.create([
      {
        workspace: workspace._id,
        project: proj1._id,
        actor: owner._id,
        action: 'PROJECT_CREATED',
        description: 'Alex Morgan created project "WorkSphere Platform v2.0"',
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        task: createdTasks[0]._id,
        actor: owner._id,
        action: 'TASK_COMPLETED',
        description: 'Alex Morgan completed task "Implement JWT authentication & refresh flow"',
      },
      {
        workspace: workspace._id,
        project: proj1._id,
        task: createdTasks[1]._id,
        actor: manager._id,
        action: 'TASK_COMPLETED',
        description: 'Sarah Jenkins completed task "Enforce SRS 4.4 Role Permission Matrix in controllers"',
      },
      {
        workspace: workspace._id,
        actor: member._id,
        action: 'MEMBER_JOINED',
        description: 'Fatima Noor joined the workspace as QA Lead',
      },
    ]);
    console.log('✅ Activity logs generated\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY! REAL DATA IS IN MONGODB');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Demo Credentials for presentation:');
    console.log('  👑 Owner   : admin@worksphere.com   / Password123');
    console.log('  📋 Manager : manager@worksphere.com / Password123');
    console.log('  👤 Member  : member@worksphere.com  / Password123');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
