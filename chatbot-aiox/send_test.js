require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const CHAT_ID = '6202370881';

async function sendTest() {
  try {
    await bot.telegram.sendMessage(CHAT_ID, '🔄 *Segunda tentativa de conexão:*\n\nAtualizei os modelos de IA para as versões mais recentes (Llama 3.1 e Gemini Flash). Tente me perguntar algo agora!', { parse_mode: 'Markdown' });
    console.log('✅ Mensagem de teste enviada!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

sendTest();
