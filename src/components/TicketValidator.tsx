import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Scan, Search, AlertTriangle, LogOut, Camera } from "lucide-react";
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
        { fps: 10, qrbox: 250 },
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
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case "used":
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      case "invalid":
        return <XCircle className="w-12 h-12 text-red-400" />;
      default:
        return <Scan className="w-12 h-12 text-white/50" />;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Scan className="w-6 h-6 text-blue-400" />
            Validador de Entradas
          </h2>
          <p className="text-white/70">
            Validador: {validator.name} ({validator.code})
          </p>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="bg-black text-white border-gray-400 hover:bg-gray-900 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-white font-medium">
              Código de Entrada
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Escanea el QR o ingresa el código"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono text-lg"
                onKeyPress={(e) => e.key === 'Enter' && validateTicket()}
              />
              <Button
                onClick={validateTicket}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Validar
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-gray-400 bg-white text-black hover:bg-gray-100 hover:text-black"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Escanear QR
            </Button>
          </div>
        </div>
      </Card>

      {showScanner && (
        <div className="flex flex-col items-center mt-4">
          <div id="qr-reader" ref={scannerRef} style={{ width: 320, height: 320 }} />
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
            className="mt-4 bg-red-500 text-white"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <Card className={`bg-gradient-to-br ${getStatusColor(validationResult.status)} p-6 text-white shadow-2xl animate-pulse`}>
          <div className="text-center space-y-4">
            {getStatusIcon(validationResult.status)}
            
            <div>
              <h3 className="text-3xl font-bold mb-2">{validationResult.message}</h3>
              <p className="opacity-90 mb-4 text-lg">{validationResult.details}</p>
            </div>

            {validationResult.ticket && (
              <div className="bg-black/20 rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-3 text-lg">Detalles de la Entrada:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-70">Graduando:</span>
                    <p className="font-medium">{validationResult.ticket.studentName}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Invitado:</span>
                    <p className="font-medium">{validationResult.ticket.guestName}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Tipo:</span>
                    <p className="font-medium capitalize">{validationResult.ticket.ticketType}</p>
                  </div>
                  <div>
                    <span className="opacity-70">Código:</span>
                    <p className="font-medium font-mono">{validationResult.ticket.code}</p>
                  </div>
                </div>
                
                {validationResult.ticket.specialNotes && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <span className="opacity-70">Notas especiales:</span>
                    <p className="font-medium">{validationResult.ticket.specialNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white font-medium">Total Entradas</h4>
          <p className="text-2xl font-bold text-yellow-400">{tickets.length}</p>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white font-medium">Usadas</h4>
          <p className="text-2xl font-bold text-green-400">{tickets.filter(t => t.used).length}</p>
        </Card>
        
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white font-medium">Disponibles</h4>
          <p className="text-2xl font-bold text-blue-400">{tickets.filter(t => !t.used).length}</p>
        </Card>
      </div>
    </div>
  );
};

export default TicketValidator;
