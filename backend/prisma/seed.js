import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'user@trello.node' },
    update: {},
    create: {
      name: 'Default User',
      email: 'user@trello.node',
      avatarUrl: 'https://ui-avatars.com/api/?name=Default+User&background=0D8ABC&color=fff',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alice@trello.node' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@trello.node',
      avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=519839&color=fff',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@trello.node' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@trello.node',
      avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Smith&background=b04632&color=fff',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'carol@trello.node' },
    update: {},
    create: {
      name: 'Carol Davis',
      email: 'carol@trello.node',
      avatarUrl: 'https://ui-avatars.com/api/?name=Carol+Davis&background=89609e&color=fff',
    },
  });

  // Create default labels
  const labels = await Promise.all([
    prisma.label.upsert({ where: { id: 'label-bug' }, update: {}, create: { id: 'label-bug', title: 'Bug', color: '#ff5630' } }),
    prisma.label.upsert({ where: { id: 'label-feature' }, update: {}, create: { id: 'label-feature', title: 'Feature', color: '#36b37e' } }),
    prisma.label.upsert({ where: { id: 'label-enhancement' }, update: {}, create: { id: 'label-enhancement', title: 'Enhancement', color: '#0065ff' } }),
    prisma.label.upsert({ where: { id: 'label-urgent' }, update: {}, create: { id: 'label-urgent', title: 'Urgent', color: '#ffab00' } }),
  ]);

  // Create default board with lists and cards
  const board = await prisma.board.create({
    data: {
      title: 'Project Alpha',
      background: '#0079bf',
      lists: {
        create: [
          {
            title: 'To Do',
            order: 1000,
            cards: {
              create: [
                {
                  title: 'Setup Environment',
                  description: 'Initialize the repo and install dependencies.',
                  order: 1000,
                  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                },
                {
                  title: 'Design DB Schema',
                  order: 2000,
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                },
                {
                  title: 'Write API Documentation',
                  description: 'Document all REST endpoints with request/response examples.',
                  order: 3000,
                }
              ]
            }
          },
          {
            title: 'In Progress',
            order: 2000,
            cards: {
              create: [
                {
                  title: 'Implement Backend API',
                  description: 'Build Express routes for boards, lists, and cards.',
                  order: 1000,
                  dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
                },
                {
                  title: 'Build Frontend Components',
                  order: 2000,
                }
              ]
            }
          },
          {
            title: 'Done',
            order: 3000,
            cards: {
              create: [
                {
                  title: 'Requirements Gathering',
                  description: 'Collected all project requirements from stakeholders.',
                  order: 1000,
                },
                {
                  title: 'Project Setup',
                  order: 2000,
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      lists: {
        include: { cards: true }
      }
    }
  });

  // Assign labels to some cards
  const allCards = board.lists.flatMap(l => l.cards);
  const setupCard = allCards.find(c => c.title === 'Setup Environment');
  const schemaCard = allCards.find(c => c.title === 'Design DB Schema');
  const apiCard = allCards.find(c => c.title === 'Implement Backend API');
  const frontendCard = allCards.find(c => c.title === 'Build Frontend Components');
  const reqCard = allCards.find(c => c.title === 'Requirements Gathering');

  // Add labels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: setupCard.id, labelId: 'label-feature' },
      { cardId: schemaCard.id, labelId: 'label-enhancement' },
      { cardId: apiCard.id, labelId: 'label-urgent' },
      { cardId: apiCard.id, labelId: 'label-feature' },
      { cardId: frontendCard.id, labelId: 'label-feature' },
      { cardId: reqCard.id, labelId: 'label-enhancement' },
    ],
    skipDuplicates: true,
  });

  // Assign members
  await prisma.cardMember.createMany({
    data: [
      { cardId: setupCard.id, userId: user1.id },
      { cardId: setupCard.id, userId: user2.id },
      { cardId: apiCard.id, userId: user1.id },
      { cardId: apiCard.id, userId: user3.id },
      { cardId: frontendCard.id, userId: user2.id },
      { cardId: frontendCard.id, userId: user4.id },
      { cardId: reqCard.id, userId: user1.id },
    ],
    skipDuplicates: true,
  });

  // Add a checklist to "Implement Backend API"
  const checklist = await prisma.checklist.create({
    data: {
      title: 'API Endpoints',
      cardId: apiCard.id,
      items: {
        create: [
          { title: 'GET /boards', isCompleted: true },
          { title: 'POST /boards', isCompleted: true },
          { title: 'GET /boards/:id', isCompleted: true },
          { title: 'POST /lists', isCompleted: false },
          { title: 'PUT /cards/:id', isCompleted: false },
        ]
      }
    }
  });

  console.log('Database seeded successfully!', { users: [user1.name, user2.name, user3.name, user4.name], board: board.title, labels: labels.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
