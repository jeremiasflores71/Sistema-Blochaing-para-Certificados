const {
  DatabaseSync
} = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config/environment.cjs');
const db = new DatabaseSync(path.join(config.data, 'academic.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
db.exec(fs.readFileSync(path.join(__dirname, 'migrations/001.sql'), 'utf8'));
module.exports = {
  db
};
