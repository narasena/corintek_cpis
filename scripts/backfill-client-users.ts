#!/usr/bin/env tsx
/**
 * Backfill Script: Link existing CLIENT* users to Clients
 *
 * This script helps migrate existing CLIENT_SUPERVISOR, CLIENT_TECHNICIAN,
 * and CLIENT users by assigning them to appropriate clients.
 *
 * Usage:
 *   npx tsx scripts/backfill-client-users.ts           # Show report only
 *   npx tsx scripts/backfill-client-users.ts --apply   # Apply changes
 */

import { prisma } from '../src/lib/prisma';

interface UserWithClient {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  suggestedClientId: string | null;
  suggestedClientName: string | null;
}

async function generateReport(): Promise<UserWithClient[]> {
  console.log('🔍 Finding CLIENT* users without clientId...\n');

  const usersWithoutClient = await prisma.user.findMany({
    where: {
      role: {
        in: ['CLIENT', 'CLIENT_SUPERVISOR', 'CLIENT_TECHNICIAN'],
      },
      clientId: null,
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (usersWithoutClient.length === 0) {
    console.log('✅ All CLIENT* users already have clientId assigned!');
    return [];
  }

  // Get all clients for suggestion
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  const report: UserWithClient[] = [];

  for (const user of usersWithoutClient) {
    const fullName = `${user.firstName} ${user.lastName || ''}`.trim();

    // Try to suggest client based on email domain
    let suggestedClientId: string | null = null;
    let suggestedClientName: string | null = null;

    if (user.email) {
      const emailDomain = user.email.split('@')[1]?.toLowerCase();
      const matchingClient = clients.find(c => {
        if (!c.email) return false;
        const clientDomain = c.email.split('@')[1]?.toLowerCase();
        return clientDomain && emailDomain === clientDomain;
      });

      if (matchingClient) {
        suggestedClientId = matchingClient.id;
        suggestedClientName = matchingClient.name;
      }
    }

    report.push({
      userId: user.id,
      userName: fullName,
      userEmail: user.email,
      userRole: user.role,
      suggestedClientId,
      suggestedClientName,
    });
  }

  return report;
}

function printReport(report: UserWithClient[]) {
  console.log(`Found ${report.length} users without clientId:\n`);

  console.log('─'.repeat(120));
  console.log(
    `${'User ID'.padEnd(36)} | ${'Name'.padEnd(25)} | ${'Role'.padEnd(20)} | ${'Email'.padEnd(30)} | ${'Suggested Client'}`
  );
  console.log('─'.repeat(120));

  for (const item of report) {
    const suggested = item.suggestedClientName
      ? `✅ ${item.suggestedClientName}`
      : '❌ No suggestion';
    console.log(
      `${item.userId} | ${item.userName.padEnd(25)} | ${item.userRole.padEnd(20)} | ${(item.userEmail || '-').padEnd(30)} | ${suggested}`
    );
  }

  console.log('─'.repeat(120));
}

async function applyChanges(report: UserWithClient[]) {
  const withSuggestions = report.filter(r => r.suggestedClientId);
  const withoutSuggestions = report.filter(r => !r.suggestedClientId);

  console.log(`\n📝 Applying changes...\n`);

  if (withSuggestions.length === 0) {
    console.log('No users with suggested clients to auto-assign.');
  } else {
    console.log(
      `Auto-assigning ${withSuggestions.length} users based on email domain match...`
    );

    for (const item of withSuggestions) {
      await prisma.user.update({
        where: { id: item.userId },
        data: { clientId: item.suggestedClientId },
      });
      console.log(`  ✓ ${item.userName} → ${item.suggestedClientName}`);
    }
  }

  if (withoutSuggestions.length > 0) {
    console.log(
      `\n⚠️  ${withoutSuggestions.length} users need MANUAL assignment:\n`
    );
    for (const item of withoutSuggestions) {
      console.log(`  - ${item.userName} (${item.userEmail || 'no email'})`);
      console.log(`    URL: /users?edit=${item.userId}`);
    }
  }

  console.log('\n✅ Backfill complete!');
}

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');

  try {
    const report = await generateReport();

    if (report.length === 0) {
      process.exit(0);
    }

    printReport(report);

    const withSuggestions = report.filter(r => r.suggestedClientId).length;
    const withoutSuggestions = report.length - withSuggestions;

    console.log(`\n📊 Summary:`);
    console.log(`  Total users without clientId: ${report.length}`);
    console.log(`  With email domain match: ${withSuggestions}`);
    console.log(`  Without match (manual needed): ${withoutSuggestions}`);

    if (shouldApply) {
      await applyChanges(report);
    } else {
      console.log(
        `\n💡 Run with --apply to auto-assign based on email domain:`
      );
      console.log(`   npx tsx scripts/backfill-client-users.ts --apply`);
      console.log(
        `\n   Note: Only ${withSuggestions} users will be auto-assigned.`
      );
      if (withoutSuggestions > 0) {
        console.log(
          `   ${withoutSuggestions} users will need manual assignment in the UI.`
        );
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
