import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const start = new Date("2026-02-12T00:00:00Z");
  const end = new Date("2026-02-12T23:59:59Z");

  console.log(
    `Checking logsheets between ${start.toISOString()} and ${end.toISOString()}`,
  );

  const logSheets = await prisma.logSheet.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: {
      project: { select: { name: true } },
      entries: {
        where: { deletedAt: null },
        include: { parameter: { select: { variableName: true, name: true } } },
      },
    },
  });

  console.log(`Total Found (including deleted): ${logSheets.length}`);

  for (const ls of logSheets) {
    console.log(`\nLogSheet ID: ${ls.id}`);
    console.log(`Project: ${ls.project.name}`);
    console.log(`Date: ${ls.date.toISOString()}`);
    console.log(`Status: ${ls.status}`);
    console.log(`Deleted?: ${ls.deletedAt !== null}`);
    console.log(`Entries: ${ls.entries.length}`);

    const metrics = ls.entries.filter((e) =>
      ["approach_cond", "approach_evap", "ampere_cond", "ampere_evap"].includes(
        e.parameter.variableName,
      ),
    );

    if (metrics.length === 0) {
      console.log("  [WARNING] No analytics metrics found in this logsheet.");
    } else {
      metrics.forEach((m) => {
        console.log(
          `  - ${m.parameter.name} (${m.parameter.variableName}): ${m.numericValue}`,
        );
      });
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
