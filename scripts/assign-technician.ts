import { prisma } from '../src/lib/prisma';

async function assign() {
  const projectId = '1a46c3a4-5380-405e-b73b-a7881c042aad';
  const techEmail = 'corintek04@mail.com';

  const tech = await prisma.user.findUnique({
    where: { email: techEmail },
  });

  if (!tech) {
    console.log('Technician not found');
    return;
  }

  // Check if already assigned
  const existing = await prisma.projectAssignment.findFirst({
    where: {
      projectId,
      userId: tech.id,
    },
  });

  if (existing) {
    console.log('Technician already assigned');
    return;
  }

  // Create assignment
  await prisma.projectAssignment.create({
    data: {
      projectId,
      userId: tech.id,
      role: 'TECHNICIAN',
    },
  });

  console.log(`Assigned ${techEmail} to project as TECHNICIAN`);
  await prisma.$disconnect();
}

assign();
