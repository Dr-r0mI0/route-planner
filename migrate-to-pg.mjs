import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const client = new Client({
  host: '172.19.0.2',
  port: 5432,
  database: 'routplanner',
  user: 'admin',
  password: 'rout2024secure'
});

async function migrateUsers() {
  const users = JSON.parse(fs.readFileSync('/app/server/data/users.json', 'utf8'));
  
  for (const user of users) {
    try {
      await client.query(
        `INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, user.password, user.name, user.role || 'user', true, user.createdAt]
      );
    } catch (e) {
      // Skip duplicates
    }
  }
  
  console.log(`Migrated ${users.length} users`);
}

async function migratePlaces() {
  const places = JSON.parse(fs.readFileSync('/app/server/data/places.json', 'utf8'));
  
  for (const place of places) {
    try {
      await client.query(
        `INSERT INTO places (id, name, address, map_url, category, contacts, last_visit, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
        [place.id, place.name, place.address, place.mapUrl, place.category, 
         JSON.stringify(place.contacts || []), place.lastVisit, place.createdBy, place.createdAt]
      );
    } catch (e) {
      // Skip duplicates
    }
  }
  
  console.log(`Migrated ${places.length} places`);
}

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    await migrateUsers();
    await migratePlaces();
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();