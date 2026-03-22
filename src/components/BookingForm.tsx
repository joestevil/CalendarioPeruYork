'use client';

import { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, isWithinInterval, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { createBookingAction } from '../app/reservar/[sedeId]/actions';
import { toast } from 'sonner';

type ExistingBooking = {
  fecha_entrada: string;
  fecha_salida: string;
};

export default function BookingForm({ sedeId, existingBookings, basePrice = 150 }: { sedeId: string; existingBookings: ExistingBooking[]; basePrice?: number; }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [huespedes, setHuespedes] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nights = dateRange?.from && dateRange?.to ? Math.max(1, differenceInDays(dateRange.to, dateRange.from)) : 0;
  const extraPersonCost = Math.max(0, huespedes - 4) * 25;
  const totalPrice = nights > 0 ? nights * (basePrice + extraPersonCost) : 0;
  const adelanto = totalPrice / 2;

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
    formData.append('huespedes', huespedes.toString());
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
        
        <div className="w-full flex justify-center border border-gray-100 rounded-xl p-2 sm:p-5 overflow-x-auto">
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Huéspedes</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="number" min="1" max="15" required
                className="w-full sm:w-24 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900 text-center font-bold text-lg"
                value={huespedes} onChange={(e) => setHuespedes(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <span className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex-1">
                Hasta 4 huéspedes incluidos. A partir del quinto se aplica un recargo de <strong className="text-gray-900">S/ 25 por persona / noche</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col w-full md:w-auto text-left gap-3">
          {totalPrice > 0 ? (
            <>
              <div className="flex justify-between items-end gap-6 border-b border-gray-100 pb-3">
                <span className="text-sm font-medium text-gray-500">Total por {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                <span className="text-lg font-extrabold text-gray-900 leading-none">S/ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#EE744B] rounded-full"></div>
                <div className="flex justify-between items-center gap-6 pl-2">
                  <span className="text-xs font-bold text-[#EE744B] uppercase tracking-wider">Adelanto (50%)</span>
                  <span className="text-xl font-extrabold text-[#EE744B] leading-none">S/ {adelanto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center gap-6 pl-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pago presencial</span>
                  <span className="text-sm font-bold text-gray-500 leading-none">S/ {adelanto.toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-2">
              <p className="text-sm text-gray-500 italic">Selecciona fechas de tu estadía para ver el total.</p>
            </div>
          )}
        </div>
        <button
          type="submit" disabled={isSubmitting || totalPrice === 0}
          className="w-full md:w-auto px-8 py-4 bg-[#EE744B] hover:bg-[#d45e36] text-white rounded-xl font-bold shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5"
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
        </button>
      </div>

    </form>
  );
}
