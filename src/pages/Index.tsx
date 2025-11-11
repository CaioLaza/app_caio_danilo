import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CameraCapture } from "@/components/CameraCapture";
import { EmotionResult } from "@/components/EmotionResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";

interface AnalysisResult {
  emotion: string;
  suggestion: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      toast.error("Erro ao analisar a emoção. Tente novamente.");
      setCapturedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCapturedImage(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
  };

  if (!session) {
    return null;
  }

  const isAnonymous = session.user.is_anonymous;

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isAnonymous ? "Sair do Demo" : "Sair"}
          </Button>
        </div>
        
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
