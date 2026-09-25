const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('backend/database/database.sqlite');
const db = new DatabaseSync(dbPath);

console.log('Running migration...');

// Add user_id to quote_requests if not exists
const quoteCols = db.prepare('PRAGMA table_info(quote_requests)').all();
if (!quoteCols.some(c => c.name === 'user_id')) {
  db.prepare('ALTER TABLE quote_requests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL').run();
  console.log('Added user_id to quote_requests');
}

// Add user_id to contact_messages if not exists
const contactCols = db.prepare('PRAGMA table_info(contact_messages)').all();
if (!contactCols.some(c => c.name === 'user_id')) {
  db.prepare('ALTER TABLE contact_messages ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL').run();
  console.log('Added user_id to contact_messages');
}

// Check index
db.prepare('CREATE INDEX IF NOT EXISTS quote_requests_user_id_index ON quote_requests(user_id)').run();
db.prepare('CREATE INDEX IF NOT EXISTS contact_messages_user_id_index ON contact_messages(user_id)').run();

// Record in migrations table if not exists
const migrations = db.prepare('SELECT migration FROM migrations WHERE migration = ?').all('2026_09_24_190000_add_user_id_to_quote_requests_and_messages');
if (migrations.length === 0) {
  db.prepare('INSERT INTO migrations (migration, batch) VALUES (?, ?)').run('2026_09_24_190000_add_user_id_to_quote_requests_and_messages', 3);
  console.log('Recorded migration in migrations table');
}

console.log('Migration completed successfully.');
