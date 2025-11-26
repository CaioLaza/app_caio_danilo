import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, User } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleDemoMode = async () => {
    setIsLoading(true);
    const demoEmail = "caio@gmail.com";
    const demoPassword = "caio1234";
    
    try {
      // Tenta fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      
      // Se o login falhar (usuário não existe), cria a conta
      if (signInError) {
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        
        if (signUpError) throw signUpError;
        
        toast.success("Conta demo criada! Fazendo login...");
        
        // Aguarda um pouco e tenta login novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        
        if (retryError) throw retryError;
      }
      
      toast.success("Login de teste realizado!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar no modo demonstração");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-50 rounded-full" />
              <div className="relative p-4 rounded-2xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Análise de Humor
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra seu estado emocional através da IA
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 space-y-6 shadow-glow border-primary/10 backdrop-blur-sm bg-card/95">
          {/* Quick Access Button */}
          <Button
            variant="outline"
            className="w-full h-14 text-base font-medium border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
            onClick={handleDemoMode}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <User className="mr-2 h-5 w-5" />
                Acesso Rápido
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                ou use sua conta
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-primary text-white font-medium text-base shadow-lg hover:shadow-glow transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium transition-colors"
              disabled={isLoading}
            >
              {isLogin
                ? "Não tem uma conta? Criar conta"
                : "Já tem uma conta? Entrar"}
            </button>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sua privacidade e dados estão protegidos
        </p>
      </div>
    </div>
  );
}
