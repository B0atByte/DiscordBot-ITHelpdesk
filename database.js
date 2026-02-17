const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'tickets.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opened_at TEXT NOT NULL,
    closed_at TEXT,
    channel_id TEXT,
    channel_link TEXT,
    reporter TEXT NOT NULL,
    user_id TEXT NOT NULL,
    department TEXT NOT NULL,
    floor TEXT NOT NULL,
    computer TEXT NOT NULL,
    ip TEXT NOT NULL,
    voice TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT,
    technician TEXT,
    status TEXT NOT NULL DEFAULT 'เปิด'
  );

  CREATE TABLE IF NOT EXISTS user_departments (
    user_id TEXT PRIMARY KEY,
    department TEXT NOT NULL
  );
`);

// === Ticket Operations ===

const insertTicket = db.prepare(`
  INSERT INTO tickets (opened_at, channel_id, channel_link, reporter, user_id, department, floor, computer, ip, voice, employee_id, owner_name, problem)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function createTicket(data) {
  const result = insertTicket.run(
    data.opened_at,
    data.channel_id,
    data.channel_link,
    data.reporter,
    data.user_id,
    data.department,
    data.floor,
    data.computer,
    data.ip,
    data.voice,
    data.employee_id,
    data.owner_name,
    data.problem
  );
  return result.lastInsertRowid;
}

function getTicketByChannelId(channelId) {
  return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
}

function getTicketById(id) {
  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
}

function getAllTickets() {
  return db.prepare('SELECT * FROM tickets ORDER BY id ASC').all();
}

function updateTicketStatus(channelId, status) {
  db.prepare('UPDATE tickets SET status = ? WHERE channel_id = ?').run(status, channelId);
}

function closeTicket(channelId, technician) {
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  db.prepare('UPDATE tickets SET status = ?, closed_at = ?, technician = ? WHERE channel_id = ?')
    .run('ปิด', now, technician, channelId);
}

function setSolution(channelId, solution) {
  db.prepare('UPDATE tickets SET solution = ? WHERE channel_id = ?').run(solution, channelId);
}

function setTechnician(channelId, technician) {
  db.prepare('UPDATE tickets SET technician = ? WHERE channel_id = ?').run(technician, channelId);
}

function getTicketsByMonth(year, month) {
  // opened_at is Thai locale: "d/m/yyyy HH:mm:ss" (Buddhist Era year)
  // Filter all tickets and match by month/year
  const all = db.prepare('SELECT * FROM tickets ORDER BY id ASC').all();
  return all.filter(t => {
    if (!t.opened_at) return false;
    const parts = t.opened_at.split(/[/ ,]/);
    // parts: [day, month, year, ...]
    const m = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    return m === parseInt(month) && y === parseInt(year);
  });
}

function deleteTicketsByIds(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM tickets WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}

function getNextTicketNumber() {
  const row = db.prepare('SELECT MAX(id) as maxId FROM tickets').get();
  return (row.maxId || 0) + 1;
}

// === User Department Memory ===

function saveUserDepartment(userId, department) {
  db.prepare('INSERT OR REPLACE INTO user_departments (user_id, department) VALUES (?, ?)')
    .run(userId, department);
}

function getUserDepartment(userId) {
  const row = db.prepare('SELECT department FROM user_departments WHERE user_id = ?').get(userId);
  return row ? row.department : null;
}

module.exports = {
  db,
  createTicket,
  getTicketByChannelId,
  getTicketById,
  getAllTickets,
  updateTicketStatus,
  closeTicket,
  setSolution,
  setTechnician,
  getNextTicketNumber,
  saveUserDepartment,
  getUserDepartment,
  getTicketsByMonth,
  deleteTicketsByIds,
};
