const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('backend/database/database.sqlite');
const db = new DatabaseSync(dbPath);

const stmt = db.prepare(`
  UPDATE articles 
  SET cover_image = ? 
  WHERE id = 1
`);

stmt.run('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80');

const articles = db.prepare('SELECT id, title, cover_image, category_id FROM articles').all();
console.log('Updated articles:', articles);
