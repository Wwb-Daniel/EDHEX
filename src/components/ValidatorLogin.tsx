
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ValidatorLoginProps {
  onLogin: (validator: any) => void;
}

const ValidatorLogin = ({ onLogin }: ValidatorLoginProps) => {
  const [validatorCode, setValidatorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!validatorCode) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu código de validador",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: validator, error } = await supabase
        .from('validators')
        .select('*')
        .eq('code', validatorCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !validator) {
        toast({
          title: "Error",
          description: "Código de validador inválido o inactivo",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Acceso autorizado! 🛡️",
        description: `Bienvenido ${validator.name}`,
      });

      onLogin(validator);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al verificar el validador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Acceso de Validador
        </h2>
        <p className="text-white/70">
          Ingresa tu código para validar entradas
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="code" className="text-white font-medium">
            Código de Validador
          </Label>
          <div className="relative">
            <Scan className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input
              id="code"
              value={validatorCode}
              onChange={(e) => setValidatorCode(e.target.value.toUpperCase())}
              placeholder="VAL001"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 font-mono"
              maxLength={6}
            />
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
        >
          {loading ? "Verificando..." : "Acceder"}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-blue-300 text-sm text-center">
          Códigos disponibles: VAL001, VAL002, VAL003, VAL004, VAL005
        </p>
      </div>
    </Card>
  );
};

export default ValidatorLogin;
