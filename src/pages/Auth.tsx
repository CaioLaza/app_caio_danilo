import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona imediatamente para a página principal em modo público
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-glow">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Análise de Humor
          </h1>
          <p className="text-muted-foreground">
            O aplicativo agora funciona em modo público, sem necessidade de login.
          </p>
        </div>

        <Button
          className="w-full bg-gradient-primary"
          onClick={() => {
            toast.success("Redirecionando para o app...");
            navigate("/");
          }}
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Ir para o app
        </Button>
      </Card>
    </div>
  );
}

