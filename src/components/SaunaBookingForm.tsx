'use client';

import { useState } from 'react';
import { addHours } from 'date-fns';
import { createBookingAction } from '@/app/reservar/[sedeId]/actions';
import { toast } from 'sonner';

type ExistingBooking = {
  fecha_entrada: string;
  fecha_salida: string;
};

export default function SaunaBookingForm({ sedeId, existingBookings }: { sedeId: string; existingBookings: ExistingBooking[]; }) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPrice = (hours: number) => {
    switch (hours) {
      case 1: return 60;
      case 2: return 120;
      case 3: return 135;
      default: return 60;
    }
  };
  const totalPrice = getPrice(duration);

  const availableHours = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !startTime) return toast.error('Selecciona la fecha y hora de inicio.');
    if (!nombre || !correo || !telefono) return toast.error('Completa todos los datos.');

    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = addHours(startDateTime, duration);

    const isOverlap = existingBookings.some((b) => {
      const bStart = new Date(b.fecha_entrada);
      const bEnd = new Date(b.fecha_salida);
      return (startDateTime < bEnd && endDateTime > bStart);
    });

    if (isOverlap) return toast.error('El horario seleccionado ya está reservado.');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('sedeId', sedeId);
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('telefono', telefono);
    formData.append('fechaEntrada', startDateTime.toISOString());
    formData.append('fechaSalida', endDateTime.toISOString());
    formData.append('isHourly', 'true');

    const result = await createBookingAction(formData);

    if (result.success) {
      toast.success('¡Reserva confirmada!');
      setSelectedDate(''); setStartTime(''); setNombre(''); setCorreo(''); setTelefono('');
    } else {
      toast.error(result.error || 'Error al procesar la reserva.');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleBooking} className="flex flex-col">
      
      {/* Horario Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Horario del Sauna</h2>
        <p className="text-sm text-gray-500 mb-5">Reserva por las horas que necesites.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
            <input
              type="date" required min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium cursor-pointer"
              style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
              value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Inicio</label>
              <select
                required
                className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium cursor-pointer"
                style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
                value={startTime} onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="" disabled>--:--</option>
                {availableHours.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Horas</label>
              <select
                required
                className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium cursor-pointer"
                style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
                value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={1}>1 Hora</option>
                <option value={2}>2 Horas</option>
                <option value={3}>3 Horas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 mb-10" />

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
            style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
            value={nombre} onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Correo</label>
            <input
              type="email" required placeholder="juan@ejemplo.com"
              className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium placeholder-gray-400"
              style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel" required placeholder="Ej. 999888777" maxLength={9} pattern="[0-9]{9}"
              className="w-full rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#49369b] transition-all bg-white text-gray-900 shadow-sm tracking-wide font-medium placeholder-gray-400"
              style={{ padding: '1rem 1.25rem', minHeight: '3.5rem', fontSize: '1.05rem' }}
              value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div 
        className="flex items-center justify-between gap-6 border-t border-gray-100"
        style={{ marginTop: '3rem', paddingTop: '2.5rem' }}
      >
        <div className="flex flex-col items-start text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total a Pagar</p>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none">S/ {totalPrice.toFixed(2)}</p>
        </div>
        <button
          type="submit" disabled={isSubmitting}
          className="relative rounded-2xl transition-all duration-500 w-full md:w-auto flex items-center justify-center overflow-hidden group/formbtn shadow-[0_8px_20px_rgba(238,116,75,0.25)] hover:shadow-[0_15px_30px_rgba(238,116,75,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none border-0"
          style={{ padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 5vw, 3rem)' }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EE744B] via-[#f75e2f] to-[#49369b] bg-[length:200%_auto] bg-left group-hover/formbtn:bg-right transition-all duration-500"></div>
          {/* Shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover/formbtn:opacity-20 bg-gradient-to-t from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/formbtn:animate-[shimmer_1s_ease-in-out]"></div>
          
          <span className="relative z-10 font-black text-base sm:text-xl uppercase tracking-widest text-white text-shadow-sm whitespace-nowrap">
            {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
          </span>
        </button>
      </div>

    </form>
  );
}
