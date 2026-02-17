const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function getDepartments() {
  return loadConfig().departments;
}

// For backward compatibility
const DEPARTMENTS = getDepartments();

module.exports = { DEPARTMENTS, getDepartments };
