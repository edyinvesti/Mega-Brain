import OpenAI from 'openai';

class ResilientLLM {
  getProviders(env) {
    return [
      {
        name: 'Groq',
        client: env.GROQ_API_KEY ? new OpenAI({ apiKey: env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' }) : null,
        model: 'llama-3.3-70b-versatile'
      },
      {
        name: 'OpenRouter',
        client: env.OPENROUTER_API_KEY
          ? new OpenAI({ apiKey: env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
          : null,
        model: 'google/gemini-2.0-flash-exp:free'
      },
      {
        name: 'OpenAI',
        client: env.OPENAI_API_KEY
          ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
          : null,
        model: 'gpt-4o-mini'
      },
      {
        name: 'DeepSeek',
        client: env.DEEPSEEK_API_KEY
          ? new OpenAI({ apiKey: env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
          : null,
        model: 'deepseek-chat'
      }
    ];
  }

  async generateResponse(messages, env) {
    const providers = this.getProviders(env);

    for (const provider of providers) {
      if (!provider.client && provider.name !== 'Anthropic') continue;
      
      try {
        console.log(`[Resilience] Tentando provedor: ${provider.name}...`);
        
        const response = await provider.client.chat.completions.create({
          model: provider.model,
          messages: messages, // Corrigido de history para messages
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error(`[Resilience] Erro no provedor ${provider.name}: ${error.message}`);
        continue; 
      }
    }
    throw new Error('Todos os provedores de IA falharam.');
  }
}

export default new ResilientLLM();
