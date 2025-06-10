import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Shield, Calendar, User, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from 'qrcode';

interface TicketPreviewProps {
  ticket: {
    id?: number;
    student_name?: string;
    studentName?: string;
    guest_name?: string | null;
    guestName?: string;
    ticket_type?: string;
    ticketType?: string;
    code: string;
    created_at?: string;
    createdAt?: string;
    special_notes?: string | null;
    specialNotes?: string;
    used?: boolean;
  };
}

const TicketPreview = ({ ticket }: TicketPreviewProps) => {
  const downloadTicket = async () => {
    // Crear una imagen del ticket para descargar
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (ticketType === 'graduado') {
      gradient.addColorStop(0, '#fbbf24'); // yellow-400
      gradient.addColorStop(1, '#f59e0b'); // yellow-500
    } else {
      gradient.addColorStop(0, '#60a5fa'); // blue-400
      gradient.addColorStop(1, '#3b82f6'); // blue-500
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurar texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('EDHEX GRADUADOS 2025', canvas.width / 2, 80);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`ENTRADA ${ticketType.toUpperCase()}`, canvas.width / 2, 120);
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('GRADUANDO:', 60, 200);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(studentName, 60, 230);
    ctx.font = '20px Arial';
    ctx.fillText('INVITADO:', 60, 280);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(guestName, 60, 310);
    ctx.font = '18px Arial';
    ctx.fillText('CÓDIGO ÚNICO:', 60, 360);
    ctx.font = 'bold 28px monospace';
    ctx.fillText(ticket.code, 60, 390);
    ctx.font = '16px Arial';
    ctx.fillText(`Generado: ${formatDate(createdAt)}`, 60, 430);
    if (specialNotes) {
      ctx.fillText('NOTAS:', 60, 470);
      ctx.font = '18px Arial';
      ctx.fillText(specialNotes, 60, 500);
    }

    // QR Code real
    ctx.fillStyle = 'white';
    ctx.fillRect(550, 200, 200, 200);
    const qrDataUrl = await QRCode.toDataURL(ticket.code, { width: 180, margin: 1 });
    const qrImg = new window.Image();
    qrImg.onload = function () {
      ctx.drawImage(qrImg, 560, 210, 180, 180);
      // Advertencia de seguridad
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ Esta entrada es única e intransferible', canvas.width / 2, 550);
      // Descargar imagen
      const link = document.createElement('a');
      link.download = `entrada-${ticket.code}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case "graduado": return "from-yellow-400 to-orange-500";
      case "familiar": return "from-blue-400 to-purple-500";
      default: return "from-blue-400 to-purple-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar tanto el formato viejo como el nuevo
  const studentName = ticket.student_name || ticket.studentName || '';
  const guestName = ticket.guest_name || ticket.guestName || 'Entrada General';
  const ticketType = ticket.ticket_type || ticket.ticketType || 'familiar';
  const createdAt = ticket.created_at || ticket.createdAt || new Date().toISOString();
  const specialNotes = ticket.special_notes || ticket.specialNotes;

  return (
    <div className="space-y-4">
      {/* Ticket Preview */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${getTicketTypeColor(ticketType)} p-6 text-white shadow-2xl`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>

        {/* Ticket Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">EDHEX GRADUADOS 2025</h3>
              <p className="opacity-80 text-sm uppercase tracking-wider">
                Entrada {ticketType.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <Shield className="w-6 h-6 mb-1" />
              <p className="text-xs opacity-80">VERIFICADO</p>
            </div>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm opacity-80">Graduando</span>
              </div>
              <p className="font-semibold text-lg">{studentName}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4" />
                <span className="text-sm opacity-80">
                  {ticketType === 'graduado' ? 'Graduando' : 'Familiar'}
                </span>
              </div>
              <p className="font-semibold">{ticketType === 'graduado' ? studentName : guestName}</p>
            </div>
          </div>

          {/* QR Code and Code */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm opacity-80">Generado</span>
              </div>
              <p className="text-sm">{formatDate(createdAt)}</p>
              
              <div className="mt-3 p-2 bg-black/20 rounded-lg">
                <p className="text-xs opacity-80 mb-1">CÓDIGO ÚNICO</p>
                <p className="font-mono font-bold text-lg tracking-wider">{ticket.code}</p>
              </div>
            </div>
            
            <div className="text-center">
              <QRCodeSVG 
                value={ticket.code} 
                size={80}
                bgColor="transparent"
                fgColor="white"
                className="bg-white/20 p-2 rounded-lg"
              />
              <p className="text-xs mt-1 opacity-80">Escanear para validar</p>
            </div>
          </div>

          {/* Special Notes */}
          {specialNotes && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <p className="text-xs opacity-80 mb-1">NOTAS ESPECIALES</p>
              <p className="text-sm">{specialNotes}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-60 text-center">
              ⚠️ Esta entrada es única e intransferible. No compartas el código.
            </p>
          </div>
        </div>
      </Card>

      {/* Download Button */}
      <Button 
        onClick={downloadTicket}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Descargar Entrada como Imagen
      </Button>
    </div>
  );
};

export default TicketPreview;
