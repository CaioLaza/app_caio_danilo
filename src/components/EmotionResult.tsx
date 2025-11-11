import { Card } from "@/components/ui/card";
import { Sparkles, Music, BookOpen } from "lucide-react";

interface EmotionResultProps {
  emotion: string;
  suggestion: string;
  capturedImage: string | null;
}

const emotionEmojis: Record<string, string> = {
  feliz: "😊",
  triste: "😢",
  neutro: "😐",
  ansioso: "😰",
  entusiasmado: "🤩",
  cansado: "😴",
  reflexivo: "🤔",
};

const emotionColors: Record<string, string> = {
  feliz: "from-yellow-400 to-orange-400",
  triste: "from-blue-400 to-blue-600",
  neutro: "from-gray-400 to-gray-500",
  ansioso: "from-red-400 to-orange-500",
  entusiasmado: "from-green-400 to-emerald-500",
  cansado: "from-indigo-400 to-purple-500",
  reflexivo: "from-purple-400 to-pink-500",
};

export const EmotionResult = ({ emotion, suggestion, capturedImage }: EmotionResultProps) => {
  const emoji = emotionEmojis[emotion] || "🙂";
  const colorGradient = emotionColors[emotion] || "from-primary to-secondary";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-700">
      {capturedImage && (
        <Card className="overflow-hidden shadow-soft">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-48 object-cover"
          />
        </Card>
      )}

      <Card className={`p-8 bg-gradient-to-br ${colorGradient} shadow-glow`}>
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">{emoji}</div>
          <h2 className="text-3xl font-bold text-white capitalize">
            {emotion}
          </h2>
        </div>
      </Card>

      <Card className="p-8 shadow-soft border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Sugestão Para Você</h3>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {suggestion}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            {suggestion.toLowerCase().includes("música") && (
              <div className="flex items-center gap-2 text-secondary">
                <Music className="h-5 w-5" />
                <span className="text-sm font-medium">Sugestão Musical</span>
              </div>
            )}
            {suggestion.toLowerCase().includes("poema") && (
              <div className="flex items-center gap-2 text-accent">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Poema</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
