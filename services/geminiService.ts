import { GoogleGenAI, Type } from "@google/genai";
import { GameConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate the list of items first
export const generateGameItems = async (config: GameConfig): Promise<string[]> => {
  const prompt = `
    Generate a list of ${config.pairCount} distinct, physical objects or concepts suitable for a memory matching game card.
    
    Context:
    - Style: ${config.style}
    - Color Palette: ${config.palette}
    - Sophistication Level: ${config.level}
    
    The items should be visually distinct from each other to prevent confusion.
    Return ONLY a JSON array of strings. Example: ["Red Apple", "Bicycle", "Tree"].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error generating item list:", error);
    // Fallback list if API fails
    return Array.from({ length: config.pairCount }, (_, i) => `Item ${i + 1}`);
  }
};

// Helper to generate a single image
export const generateImageForItem = async (item: string, config: GameConfig): Promise<string | null> => {
  const imagePrompt = `
    A ${config.style} image of a ${item}. 
    Color palette: ${config.palette}. 
    Sophistication level: ${config.level}.
    centered, white background, high contrast, suitable for a square game card icon.
    No text, no borders.
  `;

  try {
    // Using gemini-2.5-flash-image for speed as requested in guidelines for general tasks
    // If high quality is needed, we could use gemini-3-pro-image-preview, but for 12 images speed is crucial.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {
        // No responseMimeType for image models
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error generating image for ${item}:`, error);
    return null;
  }
};

export const generateGameAssets = async (
  config: GameConfig, 
  onProgress: (completed: number, total: number) => void
): Promise<{ label: string; imageUrl: string }[]> => {
  
  // 1. Get the list of items
  const items = await generateGameItems(config);
  const assets: { label: string; imageUrl: string }[] = [];
  
  // 2. Generate images in parallel (with concurrency limit ideally, but simple batching here)
  // We'll do chunks of 3 to avoid hitting rate limits too hard while keeping it relatively fast.
  const chunkSize = 3;
  let completed = 0;
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      const imageUrl = await generateImageForItem(item, config);
      return { label: item, imageUrl };
    });

    const results = await Promise.all(promises);
    
    for (const res of results) {
      if (res.imageUrl) {
        assets.push({ label: res.label, imageUrl: res.imageUrl });
      } else {
        // Fallback placeholder if generation fails
        assets.push({ 
          label: res.label, 
          imageUrl: `https://picsum.photos/seed/${res.label}/512/512` 
        });
      }
    }
    
    completed += chunk.length;
    onProgress(Math.min(completed, items.length), items.length);
  }

  return assets;
};
