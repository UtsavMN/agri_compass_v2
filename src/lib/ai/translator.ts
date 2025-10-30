export async function translateToKannada(text: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  try {
    // Use Google Translate API (free endpoint)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Google Translate response
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translatedText = data[0]
        .map((item: unknown[]) => item[0] as string)
        .filter((text: string) => text)
        .join('');

      return translatedText || text; // Fallback to original if translation fails
    }

    return text;
  } catch (error) {
    console.warn('Translation failed:', error);
    return text; // Return original text if translation fails
  }
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=kn&tl=en&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translatedText = data[0]
        .map((item: unknown[]) => item[0] as string)
        .filter((text: string) => text)
        .join('');

      return translatedText || text;
    }

    return text;
  } catch (error) {
    console.warn('Translation failed:', error);
    return text;
  }
}

export async function translateText(text: string, targetLang: 'en' | 'kn'): Promise<string> {
  if (targetLang === 'kn') {
    return translateToKannada(text);
  } else {
    return translateToEnglish(text);
  }
}

// Batch translation for multiple texts
export async function translateBatch(texts: string[], targetLang: 'en' | 'kn'): Promise<string[]> {
  const promises = texts.map(text => translateText(text, targetLang));
  return Promise.all(promises);
}

// Detect if text contains Kannada characters
export function containsKannada(text: string): boolean {
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  return kannadaRegex.test(text);
}

// Smart translation - only translate if needed
export async function smartTranslate(text: string, targetLang: 'en' | 'kn'): Promise<string> {
  const hasKannada = containsKannada(text);

  if (targetLang === 'kn' && !hasKannada) {
    return translateToKannada(text);
  } else if (targetLang === 'en' && hasKannada) {
    return translateToEnglish(text);
  }

  return text; // Already in target language
}
