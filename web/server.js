const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.WEB_PORT || 3000;

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helpers
function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function getDb() {
  return require('../database');
}

// ==================== ROUTES ====================

// Dashboard
app.get('/', (req, res) => {
  const db = getDb();
  const tickets = db.getAllTickets();
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'เปิด').length;
  const inProgress = tickets.filter(t => t.status === 'กำลังดำเนินการ').length;
  const closed = tickets.filter(t => t.status === 'ปิด').length;

  res.render('dashboard', {
    page: 'dashboard',
    stats: { total, open, inProgress, closed },
  });
});

// Tickets
app.get('/tickets', (req, res) => {
  const db = getDb();
  const tickets = db.getAllTickets();
  const statusFilter = req.query.status || '';

  const filtered = statusFilter
    ? tickets.filter(t => t.status === statusFilter)
    : tickets;

  res.render('tickets', {
    page: 'tickets',
    tickets: filtered,
    statusFilter,
  });
});

// Ticket detail
app.get('/tickets/:id', (req, res) => {
  const db = getDb();
  const ticket = db.getTicketById(parseInt(req.params.id));
  if (!ticket) return res.status(404).send('Ticket not found');

  res.render('tickets', {
    page: 'tickets',
    tickets: [ticket],
    statusFilter: '',
    detail: ticket,
  });
});

// Bot Config
app.get('/config', (req, res) => {
  const envPath = path.join(__dirname, '..', '.env');
  let envVars = {};

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  res.render('config', {
    page: 'config',
    envVars,
    saved: req.query.saved === '1',
  });
});

app.post('/config', (req, res) => {
  const envPath = path.join(__dirname, '..', '.env');
  const keys = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'TICKET_FORUM_CHANNEL_ID', 'TICKET_LOG_CHANNEL_ID'];
  const lines = keys
    .filter(k => req.body[k] !== undefined)
    .map(k => `${k}=${req.body[k]}`);

  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8');
  res.redirect('/config?saved=1');
});

// Restart Bot
app.post('/config/restart', async (req, res) => {
  try {
    const { restartBot } = require('../index');
    await restartBot();
    res.json({ success: true, message: 'Bot restarted สำเร็จ' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Export Excel
app.get('/export', async (req, res) => {
  try {
    const db = getDb();
    const tickets = db.getAllTickets();
    if (tickets.length === 0) {
      return res.status(404).send('ไม่มีข้อมูล Ticket');
    }
    const { exportToExcel } = require('../utils/exportExcel');
    const filePath = await exportToExcel(tickets);
    res.download(filePath);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).send('เกิดข้อผิดพลาดในการ Export');
  }
});

// Reset (Export + Delete by month)
app.post('/reset', async (req, res) => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุเดือนและปี' });
    }
    const db = getDb();
    const tickets = db.getTicketsByMonth(year, month);
    if (tickets.length === 0) {
      return res.json({ success: false, message: 'ไม่พบ Ticket ในเดือนที่เลือก' });
    }
    // Export first
    const { exportToExcel } = require('../utils/exportExcel');
    const filePath = await exportToExcel(tickets);
    // Delete
    const ids = tickets.map(t => t.id);
    const deleted = db.deleteTicketsByIds(ids);
    res.json({
      success: true,
      message: `Export และลบข้อมูล ${deleted} รายการเรียบร้อย`,
      exportFile: path.basename(filePath),
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Departments
app.get('/departments', (req, res) => {
  const config = loadConfig();
  res.render('departments', {
    page: 'departments',
    departments: config.departments,
    saved: req.query.saved === '1',
    deleted: req.query.deleted === '1',
  });
});

app.post('/departments/add', (req, res) => {
  const config = loadConfig();
  const name = req.body.name?.trim();
  if (name && !config.departments.includes(name)) {
    config.departments.push(name);
    saveConfig(config);
  }
  res.redirect('/departments?saved=1');
});

app.post('/departments/delete', (req, res) => {
  const config = loadConfig();
  const name = req.body.name;
  config.departments = config.departments.filter(d => d !== name);
  saveConfig(config);
  res.redirect('/departments?deleted=1');
});

app.post('/departments/edit', (req, res) => {
  const config = loadConfig();
  const { oldName, newName } = req.body;
  if (newName?.trim()) {
    const idx = config.departments.indexOf(oldName);
    if (idx !== -1) {
      config.departments[idx] = newName.trim();
      saveConfig(config);
    }
  }
  res.redirect('/departments?saved=1');
});

// Categories
app.get('/categories', (req, res) => {
  const config = loadConfig();
  res.render('categories', {
    page: 'categories',
    categories: config.categories,
    saved: req.query.saved === '1',
    deleted: req.query.deleted === '1',
  });
});

app.post('/categories/add', (req, res) => {
  const config = loadConfig();
  const name = req.body.name?.trim();
  const keywords = req.body.keywords
    ? req.body.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  if (name) {
    const maxId = config.categories.reduce((max, c) => Math.max(max, c.id), 0);
    config.categories.push({ id: maxId + 1, name, keywords });
    saveConfig(config);
  }
  res.redirect('/categories?saved=1');
});

app.post('/categories/edit', (req, res) => {
  const config = loadConfig();
  const id = parseInt(req.body.id);
  const name = req.body.name?.trim();
  const keywords = req.body.keywords
    ? req.body.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  const cat = config.categories.find(c => c.id === id);
  if (cat && name) {
    cat.name = name;
    cat.keywords = keywords;
    saveConfig(config);
  }
  res.redirect('/categories?saved=1');
});

app.post('/categories/delete', (req, res) => {
  const config = loadConfig();
  const id = parseInt(req.body.id);
  config.categories = config.categories.filter(c => c.id !== id);
  saveConfig(config);
  res.redirect('/categories?deleted=1');
});

// Start server
function startWebServer() {
  app.listen(PORT, () => {
    console.log(`🌐 Admin Panel running at http://localhost:${PORT}`);
  });
}

module.exports = { startWebServer };
