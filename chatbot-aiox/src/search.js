export async function needsSearch(text) {
  const keywords = ['hoje', 'preço', 'valor', 'mercado', 'selic', 'notícia', 'onde', 'como está'];
  return keywords.some(k => text.toLowerCase().includes(k));
}

export async function searchWeb(query) {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    
    // Resposta direta (resposta concisa)
    if (data.AbstractText && data.AbstractText.length > 20) {
      return `🔍 *Resultado da pesquisa:*\n${data.AbstractText}\n\n_Fonte: ${data.AbstractSource || 'DuckDuckGo'}_`;
    }

    // Definição/conceito
    if (data.Definition && data.Definition.length > 10) {
      return `🔍 *Resultado da pesquisa:*\n${data.Definition}\n\n_Fonte: ${data.DefinitionSource || 'DuckDuckGo'}_`;
    }

    // Tópicos relacionados
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const first = data.RelatedTopics[0];
      if (first.Text) {
        return `🔍 *Resultado relacionado:*\n${first.Text}`;
      }
    }

    return null; // Sem resultado encontrado
  } catch (error) {
    console.error('[Search] Erro na pesquisa:', error.message);
    return null;
  }
}

/**
 * Detecta se a mensagem do usuário parece uma pergunta que precisa de pesquisa
 */
function needsSearch(message) {
  const triggers = [
    'qual', 'quanto', 'selic', 'taxa', 'juros', 'notícia', 'noticia',
    'price', 'preço', 'valor', 'atualiz', 'hoje', 'mercado', 'pesquisa',
    'buscar', 'encontrar', 'inflação', 'ipca', 'fgts'
  ];
  const lower = message.toLowerCase();
  return triggers.some(trigger => lower.includes(trigger));
}

module.exports = { searchWeb, needsSearch };
