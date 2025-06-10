import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, User, Lock } from "lucide-react";
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
    <Card className="glass-card p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRegistering ? "Registro de Graduando" : "Acceso de Graduando"}
        </h2>
        <p className="text-white/70">
          {isRegistering 
            ? "Regístrate para generar tus entradas" 
            : "Inicia sesión para generar entradas"}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white font-medium">
            Nombre Completo
          </Label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input
              id="name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ej: María González"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-white font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña secreta"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={isRegistering ? handleRegister : handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            {loading ? "Procesando..." : isRegistering ? "Registrarme" : "Iniciar Sesión"}
          </Button>
          
          <Button
            onClick={() => setIsRegistering(!isRegistering)}
            variant="outline"
            className="w-full bg-black text-white border-gray-400 hover:bg-gray-900 hover:text-white"
          >
            {isRegistering ? "Ya tengo cuenta" : "Registrarme"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StudentLogin;
