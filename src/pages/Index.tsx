import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Shield, Ticket, Scan, Users, UserCheck, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudentLogin from "@/components/StudentLogin";
import ValidatorLogin from "@/components/ValidatorLogin";
import TicketGenerator from "@/components/TicketGenerator";
import TicketValidator from "@/components/TicketValidator";
import TicketList from "@/components/TicketList";

interface TicketData {
  id: string;
  student_name: string;
  guest_name: string | null;
  ticket_type: string;
  code: string;
  used: boolean;
  created_at: string;
  used_at: string | null;
  special_notes: string | null;
  validated_by?: string | null;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'student' | 'validator' | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar tickets desde Supabase
  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const addTicket = async (ticketData: Omit<TicketData, 'id' | 'created_at'>) => {
    // El ticket ya fue guardado en el componente TicketGenerator
    // Solo necesitamos recargar la lista
    await loadTickets();
  };

  const updateTicketStatus = async (code: string, validatorCode: string) => {
    // El ticket ya fue actualizado en el componente TicketValidator
    // Solo necesitamos recargar la lista
    await loadTickets();
  };

  const handleLogin = (user: any, type: 'student' | 'validator') => {
    setCurrentUser(user);
    setUserType(type);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="logo-container">
              <img 
                src="/image.png" 
                alt="EDHEX Logo" 
                className="w-12 h-12 logo-glow animate-pulse-slow"
              />
            </div>
            <div className="text-white/90 text-xl font-semibold">Cargando sistema...</div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de login si no hay usuario autenticado
  if (!currentUser) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="glass-card rounded-3xl p-12 mb-8 animate-float relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white animate-pulse-slow"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white animate-bounce-slow"></div>
                <Sparkles className="absolute top-1/2 left-1/4 w-6 h-6 text-white animate-pulse" />
                <Star className="absolute top-1/4 right-1/3 w-4 h-4 text-white animate-pulse" />
              </div>
              
              <div className="relative z-10">
                <div className="logo-container mb-6">
                  <img 
                    src="/image.png" 
                    alt="EDHEX Logo" 
                    className="w-24 h-24 mx-auto logo-glow animate-float"
                  />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  EDHEX
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-200 to-white text-4xl md:text-6xl mt-2">
                    Entradas Digitales
                  </span>
                </h1>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-300"></div>
                  <GraduationCap className="w-8 h-8 text-purple-300" />
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-300"></div>
                </div>
                
                <p className="text-white/80 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                  Sistema de entradas digitales seguras e imposibles de falsificar
                  <span className="block text-purple-200 text-lg mt-2">
                    ✨ Tecnología blockchain • 🔒 Códigos únicos • 📱 Validación instantánea
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Login Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Student Login */}
            <Card className="glass-card p-8 text-center card-hover group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Soy Graduando</h2>
                <p className="text-white/70 mb-8 text-lg leading-relaxed">
                  Genera hasta 5 entradas digitales únicas para tu familia y amigos
                </p>
                <Button
                  onClick={() => setUserType('student')}
                  className="w-full btn-primary text-lg py-4"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Acceder como Graduando
                </Button>
              </div>
            </Card>

            {/* Validator Login */}
            <Card className="glass-card p-8 text-center card-hover group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-xl">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Soy Validador</h2>
                <p className="text-white/70 mb-8 text-lg leading-relaxed">
                  Valida entradas escaneando códigos QR de forma segura
                </p>
                <Button
                  onClick={() => setUserType('validator')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Acceder como Validador
                </Button>
              </div>
            </Card>
          </div>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            {userType === 'student' && (
              <StudentLogin onLogin={(user) => handleLogin(user, 'student')} />
            )}
            {userType === 'validator' && (
              <ValidatorLogin onLogin={(user) => handleLogin(user, 'validator')} />
            )}
          </div>

          {/* Back Button */}
          {userType && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setUserType(null)}
                className="btn-outline"
              >
                ← Volver al inicio
              </Button>
            </div>
          )}

          {/* Features Section */}
          {!userType && (
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-white text-center mb-12">
                ¿Por qué elegir EDHEX?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <Card className="glass-card p-6 text-center card-hover">
                  <Shield className="w-12 h-12 text-purple-300 mb-4 mx-auto" />
                  <h4 className="text-white font-semibold text-xl mb-3">Seguridad Total</h4>
                  <p className="text-white/70">Códigos únicos imposibles de duplicar con tecnología blockchain</p>
                </Card>
                
                <Card className="glass-card p-6 text-center card-hover">
                  <Scan className="w-12 h-12 text-purple-300 mb-4 mx-auto" />
                  <h4 className="text-white font-semibold text-xl mb-3">Validación Rápida</h4>
                  <p className="text-white/70">Escaneo QR instantáneo con verificación en tiempo real</p>
                </Card>
                
                <Card className="glass-card p-6 text-center card-hover">
                  <Ticket className="w-12 h-12 text-purple-300 mb-4 mx-auto" />
                  <h4 className="text-white font-semibold text-xl mb-3">Fácil de Usar</h4>
                  <p className="text-white/70">Interfaz intuitiva para generar y gestionar entradas</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interfaz para graduandos
  if (userType === 'student') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <TicketGenerator 
            student={currentUser}
            onTicketGenerated={addTicket}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  // Interfaz para validadores
  if (userType === 'validator') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <TicketValidator 
            validator={currentUser}
            tickets={tickets}
            onTicketValidated={updateTicketStatus}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  // Interfaz administrativa (por defecto)
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="glass-card rounded-3xl p-12 mb-8 animate-float relative overflow-hidden">
            <div className="relative z-10">
              <div className="logo-container mb-6">
                <img 
                  src="/image.png" 
                  alt="EDHEX Logo" 
                  className="w-20 h-20 mx-auto logo-glow"
                />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                EDHEX
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white text-3xl md:text-5xl mt-2">
                  Panel Administrativo
                </span>
              </h1>
              
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                Gestión completa del sistema de entradas digitales 🎓✨
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-8 card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Seguridad Total</h3>
              <p className="text-white/70">Códigos únicos verificables</p>
            </Card>
            
            <Card className="glass-card p-8 card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Entradas Generadas</h3>
              <p className="text-white/70 text-3xl font-bold">{tickets.length}</p>
            </Card>
            
            <Card className="glass-card p-8 card-hover text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-purple-600 flex items-center justify-center">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Validadas</h3>
              <p className="text-white/70 text-3xl font-bold">
                {tickets.filter(t => t.used).length}
              </p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="glass-card">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-1 bg-white/10 rounded-xl p-1 mb-6">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-400 data-[state=active]:text-white rounded-lg text-lg py-3"
              >
                📋 Lista de Entradas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="p-6">
              <TicketList onRefresh={loadTickets} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;