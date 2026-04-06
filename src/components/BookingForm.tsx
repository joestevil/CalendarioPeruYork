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
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Fechas de estadía</h2>
        <p className="text-sm text-gray-500 mb-5">Selecciona tu rango de días.</p>
        
        <div 
          className="w-full border border-gray-100 rounded-xl overflow-x-auto custom-calendar-wrapper"
          style={{ padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .custom-calendar-wrapper { display: block; text-align: center; }
            .rdp { 
              --rdp-cell-size: min(12vw, 40px); 
              --rdp-accent-color: #EE744B; 
              --rdp-background-color: #fff0ec; 
              margin: 0 auto; 
              display: inline-block;
            }
            .rdp-day_selected { font-weight: 800 !important; color: white !important; }
            .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end) { 
              background-color: var(--rdp-background-color) !important; 
              color: var(--rdp-accent-color) !important; 
            }
            @media (min-width: 768px) { .rdp { --rdp-cell-size: 48px; } }
          `}} />
          <DayPicker mode="range" selected={dateRange} onSelect={setDateRange} disabled={isDateBlocked} locale={es} />
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-8 mt-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Tus Datos</h2>
          <p className="text-base font-medium text-gray-500 mb-4 tracking-wide">Información requerida para confirmar.</p>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo</label>
          <input
            type="text" required placeholder="Ej. Juan Pérez"
            className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium placeholder-gray-400"
            style={{ padding: '1cqw 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
            value={nombre} onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email" required placeholder="juan@ejemplo.com"
              className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium placeholder-gray-400"
              style={{ padding: '1cqw 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel" required placeholder="Ej. 999888777" maxLength={9} pattern="[0-9]{9}"
              className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium placeholder-gray-400"
              style={{ padding: '1cqw 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
              value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
            />
          </div>
          <div className="sm:col-span-2 mt-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Número de Huéspedes</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/80 p-3 sm:p-2 rounded-2xl border border-gray-200 shadow-inner">
              <input
                type="number" min="1" max="15" required
                className="w-full sm:w-28 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 text-center font-black shadow-sm"
                style={{ padding: '0.75rem 1rem', minHeight: '3.5rem', fontSize: '1.5rem' }}
                value={huespedes} onChange={(e) => setHuespedes(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <span className="text-sm text-gray-600 font-medium leading-relaxed sm:pr-4 text-center sm:text-left">
                Hasta 4 huéspedes incluidos. <br className="hidden lg:block" />A partir del 5to, se aplica un recargo de <strong className="text-[#EE744B] font-bold whitespace-nowrap">S/ 25 por persona / noche</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div 
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t border-gray-100"
        style={{ marginTop: '3rem', paddingTop: '2.5rem' }}
      >
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
          className={`relative w-full md:w-auto rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group/formbtn tracking-wider border-0 ${totalPrice === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'shadow-[0_8px_20px_rgba(238,116,75,0.25)] hover:shadow-[0_15px_30px_rgba(238,116,75,0.4)] hover:-translate-y-1'}`}
          style={{ padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 5vw, 3rem)' }}
        >
          {totalPrice > 0 && (
            <>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#EE744B] via-[#f75e2f] to-[#49369b] bg-[length:200%_auto] bg-left group-hover/formbtn:bg-right transition-all duration-500"></div>
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover/formbtn:opacity-20 bg-gradient-to-t from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/formbtn:animate-[shimmer_1s_ease-in-out]"></div>
            </>
          )}
          <span className={`relative z-10 font-black text-base sm:text-xl uppercase tracking-widest whitespace-nowrap ${totalPrice > 0 ? 'text-white text-shadow-sm' : ''}`}>
            {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
          </span>
        </button>
      </div>

    </form>
  );
}
