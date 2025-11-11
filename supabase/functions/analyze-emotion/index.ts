import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error("Image data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing emotion from image...");

    // First, analyze the emotion
    const emotionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta foto e identifique a emoção principal da pessoa. Responda APENAS com uma palavra entre: feliz, triste, neutro, ansioso, entusiasmado, cansado, reflexivo. Seja preciso e conciso.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!emotionResponse.ok) {
      const errorText = await emotionResponse.text();
      console.error("Emotion analysis error:", emotionResponse.status, errorText);
      throw new Error("Failed to analyze emotion");
    }

    const emotionData = await emotionResponse.json();
    const emotion = emotionData.choices[0].message.content.trim().toLowerCase();
    
    console.log("Detected emotion:", emotion);

    // Generate suggestion based on emotion
    const suggestionPrompt = getSuggestionPrompt(emotion);
    
    const suggestionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um assistente criativo que gera sugestões personalizadas para melhorar o humor das pessoas.",
          },
          {
            role: "user",
            content: suggestionPrompt,
          },
        ],
      }),
    });

    if (!suggestionResponse.ok) {
      const errorText = await suggestionResponse.text();
      console.error("Suggestion generation error:", suggestionResponse.status, errorText);
      throw new Error("Failed to generate suggestion");
    }

    const suggestionData = await suggestionResponse.json();
    const suggestion = suggestionData.choices[0].message.content;

    console.log("Generated suggestion successfully");

    return new Response(
      JSON.stringify({
        emotion,
        suggestion,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-emotion function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getSuggestionPrompt(emotion: string): string {
  const prompts: Record<string, string> = {
    feliz: "A pessoa está feliz! Sugira uma música animada e alegre OU escreva um pequeno poema celebrando esse momento de felicidade. Seja criativo e positivo!",
    triste: "A pessoa está triste. Sugira uma música reconfortante e calma OU escreva um poema inspirador que traga esperança e conforto. Seja empático e gentil.",
    neutro: "A pessoa está com emoção neutra. Sugira uma música agradável e relaxante OU escreva um poema curto sobre apreciar os pequenos momentos. Seja tranquilo e positivo.",
    ansioso: "A pessoa parece ansiosa. Sugira uma música calma e meditativa OU escreva um poema sobre respirar fundo e encontrar paz interior. Seja reconfortante.",
    entusiasmado: "A pessoa está entusiasmada! Sugira uma música energética e motivadora OU escreva um poema sobre perseguir sonhos e aproveitar a energia. Seja empolgante!",
    cansado: "A pessoa parece cansada. Sugira uma música suave e relaxante OU escreva um poema sobre descanso e renovação. Seja gentil e reconfortante.",
    reflexivo: "A pessoa parece reflexiva. Sugira uma música contemplativa OU escreva um poema sobre introspecção e crescimento pessoal. Seja profundo mas esperançoso.",
  };

  return prompts[emotion] || prompts.neutro;
}
