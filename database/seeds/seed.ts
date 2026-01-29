import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Episode {
  title: string;
  season: number;
  episode: number;
  bracketGroup: 'early' | 'late';
}

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Starting database seed...');

    // 1. Create admin user
    console.log('Creating admin user...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sunny.com';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO users (email, username, password_hash, is_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, 'admin', hashedPassword, true]
    );

    // 2. Load and insert episodes
    console.log('Loading episodes...');
    const episodesPath = path.join(__dirname, 'episodes.json');
    const episodesData: Episode[] = JSON.parse(fs.readFileSync(episodesPath, 'utf-8'));

    console.log(`Inserting ${episodesData.length} episodes...`);
    for (const ep of episodesData) {
      await client.query(
        `INSERT INTO episodes (title, season_number, episode_number, bracket_group)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (season_number, episode_number) DO NOTHING`,
        [ep.title, ep.season, ep.episode, ep.bracketGroup]
      );
    }

    // 3. Create initial brackets
    console.log('Creating brackets...');
    await client.query(
      `INSERT INTO brackets (name, bracket_group, status, current_round)
       VALUES ('Seasons 1-8 Champion', 'early', 'active', 1),
              ('Seasons 9-16 Champion', 'late', 'active', 1)
       ON CONFLICT DO NOTHING`
    );

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
    console.log(`Admin credentials: ${adminEmail} / ${adminPassword}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
