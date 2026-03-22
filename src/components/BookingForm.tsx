'use client';

import { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { createBookingAction } from '../app/reservar/[sedeId]/actions';
import { toast } from 'sonner';

type ExistingBooking = {
  fecha_entrada: string;
  fecha_salida: string;
};

export default function BookingForm({ sedeId, existingBookings }: { sedeId: string; existingBookings: ExistingBooking[]; }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blockedIntervals = existingBookings.map((b) => ({
    start: startOfDay(parseISO(b.fecha_entrada)),
    end: startOfDay(parseISO(b.fecha_salida)),
  }));

  const isDateBlocked = (date: Date) => {
    if (startOfDay(date) < startOfDay(new Date())) return true;
    return blockedIntervals.some((interval) =>
      isWithinInterval(startOfDay(date), { start: interval.start, end: interval.end })
    );
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange?.from || !dateRange?.to) return toast.error('Selecciona fechas de entrada y salida.');
    if (!nombre || !correo || !telefono) return toast.error('Completa todos los datos.');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('sedeId', sedeId);
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('telefono', telefono);
    formData.append('fechaEntrada', format(dateRange.from, 'yyyy-MM-dd'));
    formData.append('fechaSalida', format(dateRange.to, 'yyyy-MM-dd'));
    formData.append('isHourly', 'false');

    const result = await createBookingAction(formData);

    if (result.success) {
      toast.success('¡Reserva confirmada con éxito!');
      setDateRange(undefined);
      setNombre(''); setCorreo(''); setTelefono('');
    } else {
      toast.error(result.error || 'Error al procesar la reserva.');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleBooking} className="flex flex-col">
      
      {/* Calendar Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Fechas de estadía</h2>
        <p className="text-sm text-gray-500 mb-5">Selecciona tu rango de días.</p>
        
        <div className="w-full flex justify-center border border-gray-100 rounded-xl p-4 overflow-x-auto">
          <style dangerouslySetInnerHTML={{__html: `
            .rdp { --rdp-cell-size: 38px; --rdp-accent-color: #EE744B; --rdp-background-color: #fff0ec; margin: 0; }
            .rdp-day_selected { font-weight: 800 !important; color: white !important; }
            .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end) { background-color: var(--rdp-background-color) !important; color: var(--rdp-accent-color) !important; }
            @media (min-width: 768px) { .rdp { --rdp-cell-size: 44px; } }
          `}} />
          <DayPicker mode="range" selected={dateRange} onSelect={setDateRange} disabled={isDateBlocked} locale={es} />
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Tus Datos</h2>
          <p className="text-sm text-gray-500 mb-4">Información requerida para confirmar.</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
          <input
            type="text" required placeholder="Ej. Juan Pérez"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email" required placeholder="juan@ejemplo.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel" required placeholder="+51 999 888 777"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
              value={telefono} onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-start text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total a Pagar</p>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none">$50.00</p>
        </div>
        <button
          type="submit" disabled={isSubmitting}
          className="px-8 py-3 bg-[#EE744B] hover:bg-[#d45e36] text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
        </button>
      </div>

    </form>
  );
}
