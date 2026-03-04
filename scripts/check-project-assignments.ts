import { prisma } from '../src/lib/prisma';

async function check() {
  const projectId = '1a46c3a4-5380-405e-b73b-a7881c042aad';

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: { include: { user: true } },
    },
  });

  console.log('Project:', project?.name);
  console.log(
    'Assignments:',
    project?.assignments.map(a => ({
      role: a.role,
      user: a.user.email,
    }))
  );

  const tech = await prisma.user.findUnique({
    where: { email: 'corintek04@mail.com' },
  });

  console.log('\nTechnician:', tech?.email, 'Role:', tech?.role);

  await prisma.$disconnect();
}

check();
