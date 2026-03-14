-- Remove sample/seed data that was added by scripts/seed.ts or similar.
-- Safe to run: only deletes known seed IDs (p1, p2, g1, e1).

DELETE FROM trinityhouse.group_members WHERE group_id = 'g1';
DELETE FROM trinityhouse.events WHERE id = 'e1';
DELETE FROM trinityhouse.groups WHERE id = 'g1';
DELETE FROM trinityhouse.people WHERE id IN ('p1', 'p2');
