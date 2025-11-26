import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-50 rounded-full animate-pulse" />
              <div className="relative p-6 rounded-3xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Análise de Humor
          </h1>
          <p className="text-muted-foreground text-xl max-w-sm mx-auto">
            Descubra seu estado emocional através da IA
          </p>
        </div>

        {/* Main Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-primary text-white shadow-glow hover:shadow-glow transition-all hover:scale-105"
            onClick={handleEnter}
          >
            Entrar
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground pt-8">
          Sua privacidade e dados estão protegidos
        </p>
      </div>
    </div>
  );
}
