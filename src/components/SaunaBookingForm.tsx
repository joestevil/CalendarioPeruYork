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
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Horario del Sauna</h2>
        <p className="text-sm text-gray-500 mb-5">Reserva por las horas que necesites.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input
              type="date" required min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
              value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Inicio</label>
              <select
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
                value={startTime} onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="" disabled>--:--</option>
                {availableHours.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Horas</label>
              <select
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
                value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={1}>1 Hora</option>
                <option value={2}>2 Horas</option>
                <option value={3}>3 Horas</option>
                <option value={4}>4 Horas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 mb-8" />

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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo</label>
            <input
              type="email" required placeholder="juan@ejemplo.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
              value={correo} onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel" required placeholder="Ej. 999888777" maxLength={9} pattern="[0-9]{9}"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#EE744B] focus:border-transparent transition-all bg-white text-gray-900"
              value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-start text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total a Pagar</p>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none">${(duration * 20).toFixed(2)}</p>
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
