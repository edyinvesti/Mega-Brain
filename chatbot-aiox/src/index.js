import { Telegraf } from 'telegraf';
import persona from './persona';
import vendedor from '../squads/vendas-squad/identity';
import trafego from '../squads/vendas-squad/trafego';
import memory from './memory';
import db from './database';
import resilience from './resilience';
import { searchWeb, needsSearch } from './search';

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      try {
        const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

        // --- CONFIGURAÇÃO DO BOT ---

        const activePersonas = {}; // Para gerenciar no contexto da requisição ou via KV brevemente

        bot.start((ctx) => {
          ctx.reply('👋 Olá! Sou a no Cloudflare! 24h online.\n\nDigite /vendas para o especialista em Instagram ou /ajuda para ver comandos.');
        });

        bot.command('vendas', (ctx) => {
          const userId = ctx.from.id;
          activePersonas[userId] = 'vendedor';
          ctx.reply('🔥 **AGENTE VENDEDOR ATIVADO!**\n\nPronto para criar posts orgânicos. Para anúncios pagos, digite /trafego.', { parse_mode: 'Markdown' });
        });

        bot.command('trafego', (ctx) => {
          const userId = ctx.from.id;
          activePersonas[userId] = 'trafego';
          ctx.reply('📊 **GESTOR DE TRÁFEGO ONLINE!**\n\nMe diga qual imóvel quer anunciar e qual seu orçamento. Vou planejar seu público e estratégia no Meta Ads.', { parse_mode: 'Markdown' });
        });

        bot.command('alma', (ctx) => {
          const userId = ctx.from.id;
          activePersonas[userId] = 'alma';
          ctx.reply('✨ **ALMA REATIVADA!**', { parse_mode: 'Markdown' });
        });

        bot.command('lista', (ctx) => {
          const properties = db.listProperties();
          ctx.reply('🏠 Imóveis: ' + properties.join(', '));
        });

        bot.on('text', async (ctx) => {
          const userId = ctx.from.id;
          const userMessage = ctx.message.text;

          // 1. Pesquisa Web (se necessário)
          let extraContext = '';
          if (await needsSearch(userMessage)) {
            extraContext = await searchWeb(userMessage);
          }

          // 2. Memória (KV)
          await memory.addMessage(userId, 'user', userMessage + extraContext, env);
          const history = await memory.getHistory(userId, env);

          // 3. Seleciona a Persona Ativa
          const activePersonaType = activePersonas[userId] || 'alma';
          let currentPersona = persona;
          if (activePersonaType === 'vendedor') currentPersona = vendedor;
          if (activePersonaType === 'trafego') currentPersona = trafego;

          // IA com Fallback
          const response = await resilience.generateResponse([currentPersona, ...history], env);
          
          await memory.addMessage(userId, 'assistant', response, env);
          await ctx.reply(response);
        });

        // processa o update
        const payload = await request.json();
        await bot.handleUpdate(payload);

        return new Response('OK', { status: 200 });
      } catch (err) {
        console.error(err);
        return new Response(err.message, { status: 500 });
      }
    }
    return new Response('IAmobil Bot Online 🚀');
  }
};
