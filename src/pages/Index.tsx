import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Shield, Ticket, Scan, Users, UserCheck } from "lucide-react";
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
        <div className="text-white text-xl">Cargando sistema...</div>
      </div>
    );
  }

  // Pantalla de login si no hay usuario autenticado
  if (!currentUser) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="glass-card rounded-3xl p-8 mb-8 animate-float">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                EDHEX ENTRADAS
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Graduación Digital
                </span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                Entradas digitales únicas e imposibles de falsificar 🎓✨
              </p>
            </div>
          </div>

          {/* Login Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Login */}
            <Card className="glass-card p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Soy Graduando</h2>
              <p className="text-white/70 mb-6">
                Genera hasta 5 entradas digitales para tu familia
              </p>
              <Button
                onClick={() => setUserType('student')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                Acceder como Graduando
              </Button>
            </Card>

            {/* Validator Login */}
            <Card className="glass-card p-8 text-center">
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Soy Validador</h2>
              <p className="text-white/70 mb-6">
                Valida entradas escaneando códigos QR
              </p>
              <Button
                onClick={() => setUserType('validator')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Acceder como Validador
              </Button>
            </Card>
          </div>

          {/* Login Form */}
          <div className="mt-12">
            {userType === 'student' && (
              <StudentLogin onLogin={(user) => handleLogin(user, 'student')} />
            )}
            {userType === 'validator' && (
              <ValidatorLogin onLogin={(user) => handleLogin(user, 'validator')} />
            )}
          </div>

          {/* Back Button */}
          {userType && (
            <div className="text-center mt-6">
              <Button
                onClick={() => setUserType(null)}
                variant="outline"
                className="bg-black text-white border-gray-400 hover:bg-gray-900 hover:text-white"
              >
                Volver
              </Button>
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
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="glass-card rounded-3xl p-8 mb-8 animate-float">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              EDHEX ENTRADAS
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Graduación Digital
              </span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
              Panel administrativo del sistema de entradas 🎓✨
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <Shield className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
              <h3 className="text-white font-semibold text-lg">Seguridad Total</h3>
              <p className="text-white/70">Códigos únicos verificables</p>
            </Card>
            
            <Card className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <Ticket className="w-8 h-8 text-yellow-400 mb-2 mx-auto" />
              <h3 className="text-white font-semibold text-lg">Entradas Generadas</h3>
              <p className="text-white/70 text-2xl font-bold">{tickets.length}</p>
            </Card>
            
            <Card className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <Scan className="w-8 h-8 text-green-400 mb-2 mx-auto" />
              <h3 className="text-white font-semibold text-lg">Validadas</h3>
              <p className="text-white/70 text-2xl font-bold">
                {tickets.filter(t => t.used).length}
              </p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="glass-card">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-1 bg-white/10 rounded-xl p-1">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg"
              >
                Lista de Entradas
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
