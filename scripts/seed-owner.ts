import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'colombosilvanabelen@gmail.com';
  const password = 'Martitano02.';

  const passwordHash = await bcrypt.hash(password, 12);

  const owner = await prisma.usuario.upsert({
    where:  { email },
    update: {
      password: passwordHash,
      plan:     'owner',
      activo:   true,
    },
    create: {
      email,
      password: passwordHash,
      nombre:   'Silvana Colombo',
      empresa:  'INGENIUM PRO',
      pais:     'Argentina',
      plan:     'owner',
      activo:   true,
    },
  });

  console.log(`Owner upserted: ${owner.email} | plan: ${owner.plan} | activo: ${owner.activo}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
