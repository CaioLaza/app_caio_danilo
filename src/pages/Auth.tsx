import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    const email = "caio@gmail.com";
    const password = "caio1234";
    
    try {
      // Tenta fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Se o login falhar (usuário não existe), cria a conta
      if (signInError) {
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        
        if (signUpError) throw signUpError;
        
        toast.success("Conta criada! Fazendo login...");
        
        // Aguarda um pouco e tenta login novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (retryError) throw retryError;
      }
      
      toast.success("Bem-vindo!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-50 rounded-full" />
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
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
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
