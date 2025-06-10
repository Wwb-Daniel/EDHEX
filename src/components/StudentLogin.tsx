import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, User, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentLoginProps {
  onLogin: (student: any) => void;
}

const StudentLogin = ({ onLogin }: StudentLoginProps) => {
  const [studentName, setStudentName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!studentName || !password) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar si el estudiante ya existe
      const { data: existingStudent } = await supabase
        .from('students')
        .select('*')
        .eq('name', studentName)
        .single();

      if (existingStudent) {
        toast({
          title: "Error",
          description: "Este graduando ya está registrado",
          variant: "destructive",
        });
        return;
      }

      // Crear hash simple de la contraseña (en producción usar bcrypt)
      const passwordHash = btoa(password);

      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: studentName,
          password_hash: passwordHash,
          tickets_generated: 0,
          max_tickets: 5
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Registro exitoso! 🎓",
        description: `Bienvenido ${studentName}. Puedes generar hasta 5 entradas.`,
      });

      onLogin(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el graduando",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!studentName || !password) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('name', studentName)
        .single();

      if (error || !student) {
        toast({
          title: "Error",
          description: "Graduando no encontrado",
          variant: "destructive",
        });
        return;
      }

      // Verificar contraseña
      const passwordHash = btoa(password);
      if (student.password_hash !== passwordHash) {
        toast({
          title: "Error",
          description: "Contraseña incorrecta",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Bienvenido! 🎓",
        description: `Hola ${student.name}. Entradas generadas: ${student.tickets_generated}/${student.max_tickets}`,
      });

      onLogin(student);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 sm:p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-10">
        <Sparkles className="w-full h-full text-white animate-pulse-slow" />
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {isRegistering ? "Registro de Graduando" : "Acceso de Graduando"}
          </h2>
          <p className="text-white/80 text-base sm:text-lg">
            {isRegistering 
              ? "Regístrate para generar tus entradas digitales" 
              : "Inicia sesión para generar entradas"}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-white font-medium text-base sm:text-lg mb-3 block">
              Nombre Completo
            </Label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                id="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ej: María González"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 h-12 text-base"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-white font-medium text-base sm:text-lg mb-3 block">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña secreta"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={isRegistering ? handleRegister : handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
            >
              {loading ? "Procesando..." : isRegistering ? "Registrarme" : "Iniciar Sesión"}
            </Button>
            
            <Button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
            >
              {isRegistering ? "Ya tengo cuenta" : "Registrarme"}
            </Button>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-6 sm:mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
          <p className="text-purple-200 text-sm text-center">
            💡 Cada graduando puede generar hasta 5 entradas digitales únicas
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StudentLogin;