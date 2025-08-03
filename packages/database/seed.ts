#!/usr/bin/env bun

import { PrismaClient, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await argon2.hash('password123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: hashedPassword,
      name: 'Regular User',
    },
  });

  // Create posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to our platform',
        content: 'This is the first post on our platform.',
        published: true,
        authorId: admin.id,
        status: UserStatus.ACTIVE,
      },
      {
        title: 'Draft post',
        content: 'This is a draft post.',
        published: false,
        authorId: user.id,
        status: UserStatus.PENDING,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
