const path = require('path');
const fs = require('fs');

function loadEnvFile(relativePath) {
  const fullPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(fullPath)) return;

  require('dotenv').config({ path: fullPath, override: false });
}

// apps/mobile first, then monorepo root fallback
loadEnvFile('.env');
loadEnvFile('.env.local');
loadEnvFile('../../.env');
loadEnvFile('../../.env.local');

module.exports = {
  expo: require('./app.json').expo,
};
