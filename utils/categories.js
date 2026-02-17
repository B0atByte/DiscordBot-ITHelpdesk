const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function getCategories() {
  return loadConfig().categories;
}

// For backward compatibility
const CATEGORIES = getCategories();

function detectCategory(problemText) {
  const categories = getCategories();
  const text = problemText.toLowerCase();

  for (const cat of categories) {
    if (cat.keywords.length === 0) continue;
    for (const keyword of cat.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return `${cat.id}. ${cat.name}`;
      }
    }
  }

  const otherCat = categories.find(c => c.keywords.length === 0);
  return otherCat ? `${otherCat.id}. ${otherCat.name}` : '12. Other';
}

module.exports = { CATEGORIES, getCategories, detectCategory };
