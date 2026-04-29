import 'dotenv/config';
import prisma from '../src/config/prisma.js';

async function main() {
  // Clear existing data to avoid conflicts
  await prisma.purchase.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.drop.deleteMany({});
  await prisma.user.deleteMany({});

  // Create a demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@techzo.com',
      name: 'John Doe',
      password: 'password123',
    },
  });

  console.log('User created:', user);

  // Create some initial drops
  const drops = [
    {
      name: 'Air Jordan 1 Retro High',
      description: 'Limited edition Chicago colorway.',
      price: 190.00,
      totalStock: 50,
      availableStock: 50,
      startTime: new Date(),
    },
    {
      name: 'Yeezy Boost 350 V2',
      description: 'Classic Zebra pattern.',
      price: 220.00,
      totalStock: 30,
      availableStock: 30,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
    {
        name: 'Nike Dunk Low Panda',
        description: 'The most popular sneaker of the year.',
        price: 110.00,
        totalStock: 100,
        availableStock: 100,
        startTime: new Date(),
      },
  ];

  for (const dropData of drops) {
    const createdDrop = await prisma.drop.create({
      data: dropData,
    });
    console.log('Drop created:', createdDrop);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
