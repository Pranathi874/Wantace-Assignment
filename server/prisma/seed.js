import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync(new URL('./seed_config_v3.json', import.meta.url));
  const cfg = JSON.parse(raw.toString());

  await prisma.config.create({
    data: {
      configVersion: cfg.config_version || 3,
      businessName: cfg.business?.name || 'Northline Roofing & Exteriors',
      currency: cfg.business?.currency || 'USD',
      questions: JSON.stringify(cfg.questions),
      modifiers: JSON.stringify(cfg.modifiers),
      active: true
    }
  });

  console.log('Seeded config v3');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
