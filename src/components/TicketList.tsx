
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, User, Clock, CheckCircle, XCircle, Filter, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TicketListProps {
  onRefresh?: () => void;
}

const TicketList = ({ onRefresh }: TicketListProps) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las entradas",
          variant: "destructive",
        });
        return;
      }

      // Adaptar los datos para compatibilidad
      const adaptedTickets = (data || []).map(ticket => ({
        ...ticket,
        studentName: ticket.student_name,
        guestName: ticket.guest_name || ticket.student_name,
        ticketType: ticket.ticket_type,
        createdAt: ticket.created_at,
        usedAt: ticket.used_at,
        specialNotes: ticket.special_notes
      }));

      setTickets(adaptedTickets);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las entradas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || ticket.ticketType === filterType;
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "used" && ticket.used) ||
      (filterStatus === "available" && !ticket.used);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "graduado": return "bg-yellow-500";
      case "familiar": return "bg-blue-500";
      default: return "bg-gray-500";
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

  const exportTickets = () => {
    const csvContent = [
      ['Graduando', 'Invitado', 'Tipo', 'Código', 'Estado', 'Creado', 'Usado', 'Validado por', 'Notas'].join(','),
      ...filteredTickets.map(ticket => [
        `"${ticket.studentName}"`,
        `"${ticket.guestName}"`,
        ticket.ticketType,
        ticket.code,
        ticket.used ? 'Usada' : 'Disponible',
        formatDate(ticket.createdAt),
        ticket.usedAt ? formatDate(ticket.usedAt) : '-',
        ticket.validated_by || '-',
        `"${ticket.specialNotes || '-'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entradas-graduacion-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Cargando entradas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-yellow-400" />
            Lista de Entradas Generadas
          </h2>
          <p className="text-white/70">
            Gestiona y visualiza todas las entradas del sistema
          </p>
        </div>
        <Button
          onClick={loadTickets}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Tipo de entrada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="graduado">Graduado</SelectItem>
              <SelectItem value="familiar">Familiar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="used">Usadas</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={exportTickets}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white/70 text-sm mb-1">Total</h4>
          <p className="text-2xl font-bold text-white">{filteredTickets.length}</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white/70 text-sm mb-1">Disponibles</h4>
          <p className="text-2xl font-bold text-green-400">{filteredTickets.filter(t => !t.used).length}</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white/70 text-sm mb-1">Usadas</h4>
          <p className="text-2xl font-bold text-red-400">{filteredTickets.filter(t => t.used).length}</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <h4 className="text-white/70 text-sm mb-1">Graduados</h4>
          <p className="text-2xl font-bold text-yellow-400">{filteredTickets.filter(t => t.ticketType === 'graduado').length}</p>
        </Card>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <Filter className="w-12 h-12 mx-auto mb-4 text-white/50" />
          <h3 className="text-white text-lg font-medium mb-2">No hay entradas</h3>
          <p className="text-white/70">
            {tickets.length === 0 
              ? "Aún no se han generado entradas" 
              : "No hay entradas que coincidan con los filtros"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="glass-card p-4 hover:bg-white/15 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Student & Guest Info */}
                <div className="md:col-span-2">
                  <h4 className="text-white font-semibold">{ticket.studentName}</h4>
                  <p className="text-white/70 text-sm">{ticket.guestName}</p>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2">
                  <Badge className={`${getTypeColor(ticket.ticketType)} text-white`}>
                    {ticket.ticketType.toUpperCase()}
                  </Badge>
                </div>

                {/* Code */}
                <div>
                  <p className="text-white font-mono text-sm">{ticket.code}</p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {ticket.used ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <div>
                        <span className="text-green-400 text-sm block">Usada</span>
                        {ticket.validated_by && (
                          <span className="text-white/50 text-xs">por {ticket.validated_by}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">Disponible</span>
                    </>
                  )}
                </div>

                {/* Date */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white/70 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(ticket.createdAt)}
                  </div>
                  {ticket.used && ticket.usedAt && (
                    <div className="text-green-400 text-xs mt-1">
                      Usada: {formatDate(ticket.usedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Special Notes */}
              {ticket.specialNotes && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white/70 text-sm">
                    <span className="font-medium">Notas:</span> {ticket.specialNotes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
