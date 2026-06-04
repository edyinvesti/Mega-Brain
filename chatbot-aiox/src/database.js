import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROPERTIES_DIR = path.join(__dirname, '../database/properties');

class DatabaseManager {
  constructor() {
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(PROPERTIES_DIR)) {
      fs.mkdirSync(path.join(__dirname, '../database'), { recursive: true });
      fs.mkdirSync(PROPERTIES_DIR, { recursive: true });
    }
  }

  listProperties() {
    try {
      const files = fs.readdirSync(PROPERTIES_DIR);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (e) {
      return [];
    }
  }

  getProperty(id) {
    const filePath = path.join(PROPERTIES_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  }
}

module.exports = new DatabaseManager();
