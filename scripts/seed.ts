/**
 * Seed TrinityHouse DB with sample data (optional).
 * Run after migration: npm run db:migrate && npm run db:seed
 * Requires DATABASE_URL in .env.
 */
import { getClient } from "../src/lib/db";

async function seed() {
  const client = await getClient();
  try {
    await client.query("SET search_path TO trinityhouse, public");

    // Check if we already have data
    const { rows } = await client.query("SELECT 1 FROM trinityhouse.people LIMIT 1");
    if (rows.length > 0) {
      console.log("People table already has data; skipping seed.");
      return;
    }

    await client.query(`
      INSERT INTO trinityhouse.people (id, first_name, last_name, email, phone, role, join_date, status, avatar_color)
      VALUES
        ('p1', 'David', 'Okonkwo', 'david@trinityhouse.org', '(555) 100-0001', 'senior_pastor', '2012-01-15', 'active', 'bg-brand-500'),
        ('p2', 'Sarah', 'Nwosu', 'sarah@trinityhouse.org', '(555) 100-0002', 'staff', '2015-03-20', 'active', 'bg-emerald-500')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO trinityhouse.groups (id, name, type, leader_id, meeting_day, meeting_time, location, description, avg_attendance)
      VALUES ('g1', 'Sunday Worship Team', 'ministry_team', 'p1', 'Sunday', '8:00 AM', 'Main Sanctuary', 'Leads Sunday services', 12)
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO trinityhouse.group_members (group_id, person_id) VALUES ('g1', 'p1'), ('g1', 'p2') ON CONFLICT (group_id, person_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO trinityhouse.events (id, title, type, date, time, end_time, location, capacity, registered, checked_in, description)
      VALUES ('e1', 'Sunday Service', 'service', CURRENT_DATE + 1, '9:00 AM', '11:00 AM', 'Main Sanctuary', 300, 45, 0, 'Weekly worship')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Seed completed: sample people, group, and event added.");
  } finally {
    client.release();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
