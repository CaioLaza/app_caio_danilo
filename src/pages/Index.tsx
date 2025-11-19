import { useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { EmotionResult } from "@/components/EmotionResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisResult {
  emotion: string;
  suggestion: string;
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    setCapturedImage(imageData);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-emotion", {
        body: { imageData },
      });

      if (error) throw error;

      setResult(data);
      toast.success("Análise concluída!");
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      toast.warning(
        "Não foi possível falar com o servidor agora. Usando modo demonstração offline."
      );

      // Fallback simples em modo demo/local, sem IA real
      const fallback: AnalysisResult = {
        emotion: "neutro",
        suggestion:
          "Não conseguimos analisar sua foto agora, mas aqui vai uma sugestão: **ouça uma música calma** que você gosta e faça uma pausa de 5 minutos para respirar fundo.",
      };

      setResult(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Análise de Humor
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Capture uma foto e descubra sugestões personalizadas para manter ou melhorar seu humor
          </p>
        </div>

        {!result ? (
          <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
        ) : (
          <div className="space-y-6">
            <EmotionResult
              emotion={result.emotion}
              suggestion={result.suggestion}
              capturedImage={capturedImage}
            />
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                size="lg"
                className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Nova Análise
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by IA para análise de emoções e geração de sugestões</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

