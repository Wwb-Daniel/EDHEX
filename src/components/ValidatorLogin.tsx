import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Scan, Lock } from "lucide-react";
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
    <Card className="glass-card p-6 sm:p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-20 sm:w-24 h-20 sm:h-24 opacity-10">
        <Shield className="w-full h-full text-white animate-pulse-slow" />
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-xl">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Acceso de Validador
          </h2>
          <p className="text-white/80 text-base sm:text-lg">
            Ingresa tu código para validar entradas
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="code" className="text-white font-medium text-base sm:text-lg mb-3 block">
              Código de Validador
            </Label>
            <div className="relative">
              <Scan className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                id="code"
                value={validatorCode}
                onChange={(e) => setValidatorCode(e.target.value.toUpperCase())}
                placeholder="VAL001"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 h-12 font-mono text-base text-center"
                maxLength={6}
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
          >
            <Lock className="w-5 h-5 mr-2" />
            {loading ? "Verificando..." : "Acceder"}
          </Button>
        </div>

        {/* Available codes info */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-500/10 rounded-xl border border-blue-400/20">
          <h4 className="text-blue-200 font-semibold mb-3 text-center text-sm sm:text-base">🔑 Códigos Disponibles</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            {['VAL001', 'VAL002', 'VAL003', 'VAL004', 'VAL005'].map((code) => (
              <div key={code} className="bg-blue-400/20 rounded-lg py-2 px-2 sm:px-3">
                <span className="text-blue-200 font-mono text-xs sm:text-sm">{code}</span>
              </div>
            ))}
          </div>
          <p className="text-blue-300 text-xs sm:text-sm text-center mt-3">
            Usa cualquiera de estos códigos para acceder
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ValidatorLogin;