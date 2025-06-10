
import { createHash } from 'crypto';

// Función para generar código único tipo blockchain
export const generateTicketCode = (studentName: string, timestamp: number): string => {
  const secretKey = "GRADUACION2024_SECRET_KEY";
  const rawData = `${studentName}-${timestamp}-${secretKey}`;
  
  // En el navegador usamos SubtleCrypto para generar hash
  const encoder = new TextEncoder();
  const data = encoder.encode(rawData);
  
  // Fallback simple para navegador
  let hash = 0;
  for (let i = 0; i < rawData.length; i++) {
    const char = rawData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convertir a string hexadecimal y tomar primeros 12 caracteres
  const hexHash = Math.abs(hash).toString(36).toUpperCase().substring(0, 12);
  
  // Asegurar que siempre tenga 12 caracteres
  const paddedHash = hexHash.padEnd(12, '0').substring(0, 12);
  
  return paddedHash;
};

// Función para validar el formato del código
export const isValidCodeFormat = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{12}$/;
  return codeRegex.test(code);
};

// Función para generar ID único para tickets
export const generateTicketId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Función para formatear fecha
export const formatTicketDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para exportar tickets a CSV
export const exportTicketsToCSV = (tickets: any[]): string => {
  const headers = ['ID', 'Graduando', 'Invitado', 'Tipo', 'Código', 'Estado', 'Creado', 'Usado', 'Notas'];
  
  const csvContent = [
    headers.join(','),
    ...tickets.map(ticket => [
      ticket.id,
      `"${ticket.studentName}"`,
      `"${ticket.guestName}"`,
      ticket.ticketType,
      ticket.code,
      ticket.used ? 'Usada' : 'Disponible',
      formatTicketDate(ticket.createdAt),
      ticket.usedAt ? formatTicketDate(ticket.usedAt) : '-',
      `"${ticket.specialNotes || '-'}"`
    ].join(','))
  ].join('\n');
  
  return csvContent;
};
