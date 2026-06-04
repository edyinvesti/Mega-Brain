import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_FILE = path.join(__dirname, '../data/sessions.json');

class MemoryManager {
  constructor() {
    this.sessions = {};
    this.ensureDataDir();
    this.loadMemory();
  }

  ensureDataDir() {
    const dir = path.join(__dirname, '../data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  loadMemory() {
    if (fs.existsSync(MEMORY_FILE)) {
      try {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        this.sessions = JSON.parse(data);
      } catch (e) {
        this.sessions = {};
      }
    }
  }

  saveSessions() {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.sessions, null, 2));
  }

  // Novo método compatível com Cloudflare KV (assíncrono)
  async getHistory(userId, env) {
    // Se estiver no Cloudflare KV
    if (env && env.MEMORY_KV) {
      const data = await env.MEMORY_KV.get(`user_${userId}`);
      return data ? JSON.parse(data) : [];
    }
    
    // Fallback local
    return this.sessions[userId] || [];
  }

  async addMessage(userId, role, content, env) {
    const history = await this.getHistory(userId, env);
    history.push({ role, content });
    
    // Mantém apenas as últimas 12 mensagens
    const newHistory = history.slice(-12);

    if (env && env.MEMORY_KV) {
      await env.MEMORY_KV.put(`user_${userId}`, JSON.stringify(newHistory));
    } else {
      this.sessions[userId] = newHistory;
      this.saveSessions();
    }
  }

  async clear(userId, env) {
    if (env && env.MEMORY_KV) {
      await env.MEMORY_KV.delete(`user_${userId}`);
    } else {
      delete this.sessions[userId];
      this.saveSessions();
    }
  }
}

module.exports = new MemoryManager();
