// backend/src/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const WorkspaceMember = require('./models/WorkspaceMember');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/worksphere';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await WorkspaceMember.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing database records.');

    // 1. Create Users
    const password = 'password123';

    const owner = await User.create({
      fullName: 'Alex Morgan',
      email: 'admin@worksphere.com',
      password,
      title: 'Head of Engineering & Owner',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const manager = await User.create({
      fullName: 'Sarah Jenkins',
      email: 'manager@worksphere.com',
      password,
      title: 'Senior Project Manager',
      profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    const devAhmed = await User.create({
      fullName: 'Ahmed Raza',
      email: 'ahmed@worksphere.com',
      password,
      title: 'Frontend React Specialist',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const devJaylon = await User.create({
      fullName: 'Jaylon Dias',
      email: 'jaylon@worksphere.com',
      password,
      title: 'Backend Node.js Engineer',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const designerGretchen = await User.create({
      fullName: 'Gretchen Vetrovs',
      email: 'gretchen@worksphere.com',
      password,
      title: 'Lead UI/UX Designer',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const qaFatima = await User.create({
      fullName: 'Fatima Noor',
      email: 'fatima@worksphere.com',
      password,
      title: 'Quality Assurance Lead',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    });

    console.log('Users created.');

    // 2. Create Workspaces
    const workspace1 = await Workspace.create({
      name: 'Software Engineering & Product',
      description: 'Core product development, SaaS backend APIs, and React frontend ecosystem.',
      owner: owner._id,
      status: 'Active',
    });

    const workspace2 = await Workspace.create({
      name: 'Marketing & Digital Services',
      description: 'Brand campaigns, SEO, client outreach, and digital presence.',
      owner: owner._id,
      status: 'Active',
    });

    // 3. Add Members to Workspace 1
    const membersData = [
      { user: owner._id, role: 'Owner' },
      { user: manager._id, role: 'Manager' },
      { user: devAhmed._id, role: 'Member' },
      { user: devJaylon._id, role: 'Member' },
      { user: designerGretchen._id, role: 'Member' },
      { user: qaFatima._id, role: 'Member' },
    ];

    for (const m of membersData) {
      await WorkspaceMember.create({
        workspace: workspace1._id,
        user: m.user,
        role: m.role,
        status: 'Active',
      });
    }

    // Add Owner and Manager to Workspace 2
    await WorkspaceMember.create({
      workspace: workspace2._id,
      user: owner._id,
      role: 'Owner',
      status: 'Active',
    });
    await WorkspaceMember.create({
      workspace: workspace2._id,
      user: manager._id,
      role: 'Manager',
      status: 'Active',
    });

    console.log('Workspaces and members created.');

    // 4. Create Projects in Workspace 1
    const now = new Date();
    const project1 = await Project.create({
      workspace: workspace1._id,
      name: 'WorkSphere Web SaaS Platform',
      description: 'Centralized enterprise project & team management web application with Kanban boards and role security.',
      manager: manager._id,
      members: [devAhmed._id, devJaylon._id, designerGretchen._id, qaFatima._id],
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      priority: 'Critical',
      status: 'In Progress',
      createdBy: owner._id,
    });

    const project2 = await Project.create({
      workspace: workspace1._id,
      name: 'Mobile Application Development',
      description: 'Cross-platform mobile application for real-time task notifications and offline access.',
      manager: manager._id,
      members: [devAhmed._id, designerGretchen._id],
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      priority: 'High',
      status: 'Planning',
      createdBy: manager._id,
    });

    const project3 = await Project.create({
      workspace: workspace1._id,
      name: 'Payment & Billing Gateway Integration',
      description: 'Stripe subscription billing, invoice PDF generation, and customer portal.',
      manager: manager._id,
      members: [devJaylon._id, qaFatima._id],
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      priority: 'Medium',
      status: 'Completed',
      createdBy: owner._id,
    });

    console.log('Projects created.');

    // 5. Create Tasks for Project 1 (Kanban Board)
    const task1 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Architect JWT Authentication & Role Middlewares',
      description: 'Implement secure JWT tokens, bcrypt password hashing, and role-based permissions (Owner, Manager, Member).',
      assignedTo: [devJaylon._id],
      createdBy: manager._id,
      status: 'Completed',
      priority: 'High',
      startDate: new Date(now.getTime() - 14 * 86400000),
      dueDate: new Date(now.getTime() - 7 * 86400000),
      labels: ['Backend', 'Security', 'Auth'],
      order: 0,
    });

    const task2 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Design Kanban Drag-and-Drop Task Board UI',
      description: 'Develop high-fidelity modern UI in Tailwind CSS supporting smooth drag and drop between workflow columns.',
      assignedTo: [devAhmed._id, designerGretchen._id],
      createdBy: manager._id,
      status: 'In Progress',
      priority: 'Urgent',
      startDate: new Date(now.getTime() - 5 * 86400000),
      dueDate: new Date(now.getTime() + 4 * 86400000), // due in 4 days
      labels: ['Frontend', 'Kanban', 'Tailwind'],
      order: 1,
    });

    const task3 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Analytics Dashboard Charts & KPI Summary',
      description: 'Connect Recharts bar chart, pie chart status distribution, and calculate completion rates from live MongoDB data.',
      assignedTo: [devAhmed._id],
      createdBy: manager._id,
      status: 'In Review',
      priority: 'Medium',
      startDate: new Date(now.getTime() - 3 * 86400000),
      dueDate: new Date(now.getTime() + 2 * 86400000),
      labels: ['Analytics', 'Frontend'],
      order: 2,
    });

    const task4 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Comprehensive Role-Based Access Control Audit',
      description: 'Verify backend API authorization checks prevent cross-workspace data access and validate business rules.',
      assignedTo: [qaFatima._id],
      createdBy: owner._id,
      status: 'To Do',
      priority: 'Critical',
      startDate: now,
      dueDate: new Date(now.getTime() + 7 * 86400000),
      labels: ['QA', 'Security'],
      order: 3,
    });

    const task5 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Export Reports to CSV Functionality',
      description: 'Implement server-side CSV streaming with filters for task statuses, projects, and employee workloads.',
      assignedTo: [devJaylon._id],
      createdBy: manager._id,
      status: 'To Do',
      priority: 'Medium',
      startDate: now,
      dueDate: new Date(now.getTime() + 10 * 86400000),
      labels: ['Backend', 'Reports'],
      order: 4,
    });

    // Overdue task to test overdue logic (Scenario 05)
    const task6 = await Task.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'Legacy Database Migration & Index Optimization',
      description: 'Migrate legacy tasks and compound indexes into MongoDB collections.',
      assignedTo: [devJaylon._id],
      createdBy: manager._id,
      status: 'In Progress',
      priority: 'High',
      startDate: new Date(now.getTime() - 10 * 86400000),
      dueDate: new Date(now.getTime() - 2 * 86400000), // overdue by 2 days!
      labels: ['Database', 'Optimization'],
      order: 5,
    });

    console.log('Tasks created.');

    // 6. Comments
    await Comment.create({
      task: task2._id,
      user: manager._id,
      content: 'Ahmed, please ensure drag and drop feels responsive and immediately syncs the status update with the API.',
    });

    await Comment.create({
      task: task2._id,
      user: devAhmed._id,
      content: 'Understood Sarah! The API integration is linked to PATCH /api/v1/tasks/:id/status and updates state smoothly.',
    });

    console.log('Comments created.');

    // 7. Activity Logs
    await ActivityLog.create({
      actor: owner._id,
      workspace: workspace1._id,
      project: project1._id,
      action: 'PROJECT_CREATED',
      description: 'Alex Morgan created project "WorkSphere Web SaaS Platform"',
    });

    await ActivityLog.create({
      actor: manager._id,
      workspace: workspace1._id,
      project: project1._id,
      task: task2._id,
      action: 'TASK_ASSIGNED',
      description: 'Sarah Jenkins assigned "Design Kanban Drag-and-Drop Task Board UI" to Ahmed Raza',
    });

    await ActivityLog.create({
      actor: devAhmed._id,
      workspace: workspace1._id,
      project: project1._id,
      task: task2._id,
      action: 'KANBAN_STATUS_MOVED',
      description: 'Ahmed Raza moved task to "In Progress"',
    });

    console.log('Activity logs created.');

    // 8. Notifications
    await Notification.create({
      recipient: devAhmed._id,
      workspace: workspace1._id,
      type: 'TaskAssigned',
      title: 'New Task Assignment',
      message: 'You have been assigned to "Design Kanban Drag-and-Drop Task Board UI"',
      relatedEntity: {
        entityType: 'Task',
        entityId: task2._id,
      },
      isRead: false,
    });

    await Notification.create({
      recipient: devAhmed._id,
      workspace: workspace1._id,
      type: 'CommentAdded',
      title: 'New Comment on Task',
      message: 'Sarah Jenkins commented on "Design Kanban Drag-and-Drop Task Board UI"',
      relatedEntity: {
        entityType: 'Task',
        entityId: task2._id,
      },
      isRead: false,
    });

    console.log('Notifications created.');

    console.log('\n======================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('------------------------------------------------------');
    console.log('Owner:    admin@worksphere.com    / password123');
    console.log('Manager:  manager@worksphere.com  / password123');
    console.log('Member:   ahmed@worksphere.com    / password123');
    console.log('Member:   jaylon@worksphere.com   / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
};

seedData();

