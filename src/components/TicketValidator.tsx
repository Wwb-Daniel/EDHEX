import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Scan, Search, AlertTriangle, LogOut, Camera, QrCode, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

interface TicketValidatorProps {
  validator: any;
  tickets: any[];
  onTicketValidated: (code: string, validatorCode: string) => void;
  onLogout: () => void;
}

const TicketValidator = ({ validator, tickets, onTicketValidated, onLogout }: TicketValidatorProps) => {
  const [searchCode, setSearchCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  const validateTicket = async (codeArg?: string) => {
    const codeToValidate = (codeArg ?? searchCode).trim();
    if (!codeToValidate) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código para validar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar ticket en la base de datos
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('code', codeToValidate.toUpperCase())
        .single();

      if (error || !ticket) {
        setValidationResult({
          status: "invalid",
          message: "Código no encontrado",
          details: "Este código no existe en el sistema"
        });
        toast({
          title: "❌ Entrada Inválida",
          description: "Código no encontrado en el sistema",
          variant: "destructive",
        });
        return;
      }

      if (ticket.used) {
        setValidationResult({
          status: "used",
          message: "Entrada ya utilizada",
          details: `Usada el ${new Date(ticket.used_at).toLocaleString('es-ES')} por ${ticket.validated_by}`,
          ticket: {
            ...ticket,
            studentName: ticket.student_name,
            guestName: ticket.guest_name || ticket.student_name,
            ticketType: ticket.ticket_type,
            specialNotes: ticket.special_notes
          }
        });
        toast({
          title: "⚠️ Entrada Ya Usada",
          description: `Esta entrada fue utilizada anteriormente`,
          variant: "destructive",
        });
        return;
      }

      // Marcar ticket como usado
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          used: true, 
          used_at: new Date().toISOString(),
          validated_by: validator.code
        })
        .eq('code', ticket.code);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        toast({
          title: "Error",
          description: "No se pudo marcar la entrada como usada",
          variant: "destructive",
        });
        return;
      }

      // Validar entrada exitosa
      onTicketValidated(ticket.code, validator.code);
      setValidationResult({
        status: "valid",
        message: "¡Entrada Válida!",
        details: "Acceso autorizado ✅",
        ticket: {
          ...ticket,
          studentName: ticket.student_name,
          guestName: ticket.guest_name || ticket.student_name,
          ticketType: ticket.ticket_type,
          specialNotes: ticket.special_notes
        }
      });
      
      toast({
        title: "✅ Entrada Válida",
        description: `Bienvenid@ ${ticket.guest_name || ticket.student_name}`,
      });

      // Limpiar después de 4 segundos
      setTimeout(() => {
        setSearchCode("");
        setValidationResult(null);
      }, 4000);

    } catch (error) {
      console.error('Error validating ticket:', error);
      toast({
        title: "Error",
        description: "Error al validar la entrada",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (showScanner && scannerRef.current) {
      html5QrRef.current = new Html5Qrcode(scannerRef.current.id);
      html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!isMounted) return;
          setSearchCode(decodedText);
          setShowScanner(false);
          setTimeout(() => validateTicket(decodedText), 100);
        },
        (errorMessage) => {
          // Puedes mostrar el error si quieres
        }
      ).catch((err) => {
        toast({ title: 'Error', description: 'No se pudo acceder a la cámara. Verifica los permisos y que no esté en uso por otra app.', variant: 'destructive' });
        setShowScanner(false);
      });
    }
    return () => {
      isMounted = false;
      (async () => {
        if (html5QrRef.current) {
          try {
            if (html5QrRef.current.isScanning) {
              await html5QrRef.current.stop();
            }
            await html5QrRef.current.clear();
          } catch (e) {
            // Ignorar errores de limpieza
          }
        }
      })();
    };
  }, [showScanner]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case "used":
        return <AlertTriangle className="w-16 h-16 text-yellow-400" />;
      case "invalid":
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Scan className="w-16 h-16 text-white/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "from-green-500 to-emerald-600";
      case "used":
        return "from-yellow-500 to-orange-600";
      case "invalid":
        return "from-red-500 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl">
              <img 
                src="/image.png" 
                alt="EDHEX Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Scan className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
              Validador de Entradas
            </h2>
          </div>
          <p className="text-white/80 text-sm sm:text-lg">
            Validador: <span className="font-semibold text-purple-300">{validator.name}</span> ({validator.code})
          </p>
        </div>
        <Button
          onClick={onLogout}
          className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      <Card className="glass-card p-4 sm:p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="code" className="text-white font-medium text-base sm:text-lg mb-3 block">
              Código de Entrada
            </Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <QrCode className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                <Input
                  id="code"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Escanea el QR o ingresa el código"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 text-base sm:text-lg h-12 sm:h-14 font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && validateTicket()}
                />
              </div>
              <Button
                onClick={validateTicket}
                className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white h-12 sm:h-14 px-6 sm:px-8 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Search className="w-5 h-5 mr-2" />
                Validar
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="bg-gradient-to-r from-purple-500/20 to-purple-400/20 border-2 border-purple-400 text-purple-200 hover:bg-purple-400 hover:text-purple-900 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="w-5 h-5 mr-3" />
              Escanear QR
            </Button>
          </div>
        </div>
      </Card>

      {showScanner && (
        <Card className="glass-card p-4 sm:p-8">
          <div className="text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              📱 Escáner QR
            </h3>
            <p className="text-white/80 mb-6 text-sm sm:text-base">
              Apunta la cámara hacia el código QR de la entrada
            </p>
            
            <div className="flex justify-center">
              <div className="relative bg-black/30 rounded-2xl p-4 border-2 border-purple-400/50 shadow-2xl max-w-sm mx-auto">
                <div 
                  id="qr-reader" 
                  ref={scannerRef} 
                  className="w-full h-80 rounded-xl overflow-hidden bg-black"
                  style={{ minHeight: '320px' }}
                />
                
                {/* Scanner overlay */}
                <div className="absolute inset-4 pointer-events-none">
                  <div className="relative w-full h-full">
                    {/* Corner indicators */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-purple-400 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-purple-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-purple-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-purple-400 rounded-br-lg"></div>
                    
                    {/* Scanning line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={async () => {
                setShowScanner(false);
                if (html5QrRef.current) {
                  try {
                    if (html5QrRef.current.isScanning) {
                      await html5QrRef.current.stop();
                    }
                    await html5QrRef.current.clear();
                  } catch (e) {
                    // Ignorar errores de limpieza
                  }
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Cerrar Escáner
            </Button>
          </div>
        </Card>
      )}

      {/* Validation Result */}
      {validationResult && (
        <Card className={`bg-gradient-to-br ${getStatusColor(validationResult.status)} p-6 sm:p-8 text-white shadow-2xl animate-pulse-slow border-0`}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {getStatusIcon(validationResult.status)}
            </div>
            
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-3">{validationResult.message}</h3>
              <p className="opacity-90 mb-6 text-lg sm:text-xl">{validationResult.details}</p>
            </div>

            {validationResult.ticket && (
              <div className="bg-black/20 rounded-xl p-4 sm:p-6 text-left max-w-2xl mx-auto">
                <h4 className="font-semibold mb-4 text-lg sm:text-xl text-center">📋 Detalles de la Entrada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
                  <div className="space-y-3">
                    <div>
                      <span className="opacity-70 block text-xs sm:text-sm">Graduando:</span>
                      <p className="font-medium text-base sm:text-lg">{validationResult.ticket.studentName}</p>
                    </div>
                    <div>
                      <span className="opacity-70 block text-xs sm:text-sm">Invitado:</span>
                      <p className="font-medium text-base sm:text-lg">{validationResult.ticket.guestName}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="opacity-70 block text-xs sm:text-sm">Tipo:</span>
                      <p className="font-medium text-base sm:text-lg capitalize">{validationResult.ticket.ticketType}</p>
                    </div>
                    <div>
                      <span className="opacity-70 block text-xs sm:text-sm">Código:</span>
                      <p className="font-medium font-mono text-base sm:text-lg">{validationResult.ticket.code}</p>
                    </div>
                  </div>
                </div>
                
                {validationResult.ticket.specialNotes && (
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-white/20">
                    <span className="opacity-70 block text-xs sm:text-sm mb-2">Notas especiales:</span>
                    <p className="font-medium text-sm sm:text-base">{validationResult.ticket.specialNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card p-4 sm:p-6 text-center card-hover">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h4 className="text-white font-medium text-base sm:text-lg mb-1">Total Entradas</h4>
          <p className="text-2xl sm:text-3xl font-bold text-purple-300">{tickets.length}</p>
        </Card>
        
        <Card className="glass-card p-4 sm:p-6 text-center card-hover">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h4 className="text-white font-medium text-base sm:text-lg mb-1">Usadas</h4>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">{tickets.filter(t => t.used).length}</p>
        </Card>
        
        <Card className="glass-card p-4 sm:p-6 text-center card-hover">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Scan className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h4 className="text-white font-medium text-base sm:text-lg mb-1">Disponibles</h4>
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">{tickets.filter(t => !t.used).length}</p>
        </Card>
      </div>
    </div>
  );
};

export default TicketValidator;