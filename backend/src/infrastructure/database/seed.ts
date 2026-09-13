import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, userContacts, giftIdeas, invitations } from './schema';
import { sql } from 'drizzle-orm';

async function seed() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/nudge',
  });

  const db = drizzle(pool);

  // Clean existing data
  await db.delete(giftIdeas);
  await db.delete(userContacts);
  await db.delete(invitations);
  await db.delete(users);

  const phone = (n: number) => `06${String(n).padStart(8, '0')}`;

  // Create users - Damie family
  const damieMembers = ['Philou', 'Daniel', 'Perrine', 'Elia', 'Gabin'];
  const damieUsers = await db
    .insert(users)
    .values(damieMembers.map((name, i) => ({ name, phone: phone(i + 1), pin: '1234' })))
    .returning();

  // Create users - Trehout family
  const trehoutMembers = ['Herve', 'Lydia', 'Maxime', 'Aurore', 'Edouard'];
  const trehoutUsers = await db
    .insert(users)
    .values(trehoutMembers.map((name, i) => ({ name, phone: phone(i + 6), pin: '1234' })))
    .returning();

  // Create users - Common (both families)
  const commonMembers = ['Paul', 'Jeanne', 'Arthur', 'Nathan', 'Aline'];
  const commonUsers = await db
    .insert(users)
    .values(commonMembers.map((name, i) => ({ name, phone: phone(i + 11), pin: '1234' })))
    .returning();

  // Link each family group as reciprocal family contacts
  const linkFamily = (members: { id: string }[]) =>
    members.flatMap((a) => members.filter((b) => b.id !== a.id).map((b) => ({ userId: a.id, contactId: b.id, contactType: 'family' })));

  await db
    .insert(userContacts)
    .values([...linkFamily([...damieUsers, ...commonUsers]), ...linkFamily([...trehoutUsers, ...commonUsers])])
    .onConflictDoNothing();

  // Add some sample gift ideas
  const paul = commonUsers.find((u) => u.name === 'Paul')!;
  const jeanne = commonUsers.find((u) => u.name === 'Jeanne')!;
  const nathan = commonUsers.find((u) => u.name === 'Nathan')!;
  const arthur = commonUsers.find((u) => u.name === 'Arthur')!;

  await db.insert(giftIdeas).values([
    {
      forUserId: paul.id,
      addedByUserId: paul.id,
      title: 'Livre de cuisine',
      description: 'Un bon livre de recettes françaises',
      price: 2500,
    },
    {
      forUserId: paul.id,
      addedByUserId: jeanne.id,
      title: 'Casque audio Sony',
      description: 'Sony WH-1000XM5',
      url: 'https://www.sony.fr',
      price: 35000,
    },
    {
      forUserId: paul.id,
      addedByUserId: nathan.id,
      title: 'Abonnement Spotify',
      price: 1200,
    },
    {
      forUserId: nathan.id,
      addedByUserId: nathan.id,
      title: 'Nouveau sac à dos',
      description: 'Pour la randonnée',
      price: 8000,
    },
    {
      forUserId: nathan.id,
      addedByUserId: paul.id,
      title: 'Gourde isotherme',
      price: 3000,
      claimedByUserId: paul.id,
      claimedAt: new Date(),
    },
    {
      forUserId: arthur.id,
      addedByUserId: arthur.id,
      title: 'Jeu de société Wingspan',
      price: 4500,
    },
    {
      forUserId: arthur.id,
      addedByUserId: jeanne.id,
      title: 'Pull en laine',
      description: 'Taille M, couleur bleu',
      price: 6000,
    },
  ]);

  console.log('Seed completed successfully!');
  console.log(`Created ${damieUsers.length + trehoutUsers.length + commonUsers.length} users`);
  console.log(`Created 7 gift ideas`);

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
