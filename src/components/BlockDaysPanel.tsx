'use client';

import { useState, useTransition } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { blockDaysAction, unblockDayAction } from '@/app/admin/bloquear/actions';
import { toast } from 'sonner';

type Sede = { id: string; nombre: string };
type BlockedDay = {
  id: string;
  sede_id: string;
  cliente_nombre: string;
  fecha_entrada: string;
  fecha_salida: string;
  estado: string;
};

interface Props {
  sedes: Sede[];
  initialBlocked: BlockedDay[];
}

export default function BlockDaysPanel({ sedes, initialBlocked }: Props) {
  const [selectedSedeId, setSelectedSedeId] = useState(sedes[0]?.id || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [motivo, setMotivo] = useState('Reserva directa (boca a boca)');
  const [blocked, setBlocked] = useState<BlockedDay[]>(initialBlocked);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredBlocked = blocked.filter((b) => b.sede_id === selectedSedeId);

  const blockedIntervals = filteredBlocked.map((b) => ({
    start: startOfDay(parseISO(b.fecha_entrada)),
    end: startOfDay(parseISO(b.fecha_salida)),
  }));

  const isBlocked = (date: Date) =>
    blockedIntervals.some((interval) =>
      isWithinInterval(startOfDay(date), { start: interval.start, end: interval.end })
    );

  const handleBlock = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return toast.error('Selecciona un rango de fechas.');
    }
    if (!selectedSedeId) return toast.error('Selecciona una locación.');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('sedeId', selectedSedeId);
      formData.append('fechaInicio', format(dateRange.from!, 'yyyy-MM-dd'));
      formData.append('fechaFin', format(dateRange.to!, 'yyyy-MM-dd'));
      formData.append('motivo', motivo || 'Reserva directa (boca a boca)');

      const result = await blockDaysAction(formData);
      if (result.success) {
        toast.success('✅ Días bloqueados correctamente.');
        setBlocked((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sede_id: selectedSedeId,
            cliente_nombre: motivo || 'Reserva directa (boca a boca)',
            fecha_entrada: format(dateRange.from!, 'yyyy-MM-dd'),
            fecha_salida: format(dateRange.to!, 'yyyy-MM-dd'),
            estado: 'bloqueado',
          },
        ]);
        setDateRange(undefined);
        setMotivo('Reserva directa (boca a boca)');
      } else {
        toast.error(result.error || 'Error al bloquear.');
      }
    });
  };

  const handleUnblock = (id: string) => {
    startTransition(async () => {
      const result = await unblockDayAction(id);
      if (result.success) {
        toast.success('🔓 Bloqueo eliminado.');
        setBlocked((prev) => prev.filter((b) => b.id !== id));
        setConfirmDelete(null);
      } else {
        toast.error(result.error || 'Error al desbloquear.');
      }
    });
  };

  const selectedSede = sedes.find((s) => s.id === selectedSedeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-20 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Inicio
            </a>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EE744B] to-[#49369b] flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">Bloquear Días</h1>
                <p className="text-xs text-white/50 font-medium">Panel de administración</p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#EE744B]/20 text-[#EE744B] border border-[#EE744B]/30">
            Admin
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* LEFT PANEL — Form */}
        <div className="lg:col-span-3 space-y-6">

          {/* Sede Selector */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Locación
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sedes.map((sede) => (
                <button
                  key={sede.id}
                  type="button"
                  onClick={() => { setSelectedSedeId(sede.id); setDateRange(undefined); }}
                  className={`px-4 py-3 rounded-xl text-left font-semibold text-sm transition-all duration-200 border ${
                    selectedSedeId === sede.id
                      ? 'bg-gradient-to-r from-[#EE744B] to-[#f75e2f] border-transparent text-white shadow-[0_4px_20px_rgba(238,116,75,0.4)]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {sede.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Rango de fechas a bloquear
            </label>
            <div className="flex justify-center">
              <style dangerouslySetInnerHTML={{__html: `
                .admin-rdp .rdp {
                  --rdp-cell-size: min(11vw, 44px);
                  --rdp-accent-color: #EE744B;
                  --rdp-background-color: rgba(238,116,75,0.18);
                  margin: 0 auto;
                  display: inline-block;
                }
                .admin-rdp .rdp-months { gap: 1rem; }
                .admin-rdp .rdp-head_cell,
                .admin-rdp .rdp-caption_label { color: rgba(255,255,255,0.7); font-weight: 700; }
                .admin-rdp .rdp-nav_button { color: rgba(255,255,255,0.6); }
                .admin-rdp .rdp-nav_button:hover { background-color: rgba(255,255,255,0.1); }
                .admin-rdp .rdp-day { color: rgba(255,255,255,0.85); border-radius: 8px; transition: all 0.15s ease; }
                .admin-rdp .rdp-day:hover:not([disabled]) { background-color: rgba(255,255,255,0.1); transform: scale(1.08); }
                .admin-rdp .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 800 !important; }
                .admin-rdp .rdp-day_range_middle { background-color: rgba(238,116,75,0.2) !important; color: white !important; border-radius: 0 !important; }
                .admin-rdp .rdp-day_range_start, .admin-rdp .rdp-day_range_end { background-color: var(--rdp-accent-color) !important; color: white !important; }
                .admin-rdp .rdp-day_disabled { color: rgba(255,255,255,0.2) !important; background-color: rgba(255,0,0,0.12) !important; text-decoration: line-through; }
                @media (min-width: 768px) { .admin-rdp .rdp { --rdp-cell-size: 46px; } }
              `}} />
              <div className="admin-rdp">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={isBlocked}
                  locale={es}
                  numberOfMonths={1}
                  fromDate={new Date()}
                />
              </div>
            </div>
            {dateRange?.from && dateRange?.to && (
              <div className="mt-4 bg-[#EE744B]/10 border border-[#EE744B]/30 rounded-xl px-4 py-3 text-sm text-[#EE744B] font-semibold text-center">
                📅 {format(dateRange.from, 'd MMM yyyy', { locale: es })} → {format(dateRange.to, 'd MMM yyyy', { locale: es })}
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Motivo del bloqueo
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Reserva directa cliente X"
              className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 font-medium focus:outline-none focus:border-[#EE744B] focus:ring-1 focus:ring-[#EE744B]/40 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleBlock}
            disabled={isPending || !dateRange?.from || !dateRange?.to}
            className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
              dateRange?.from && dateRange?.to && !isPending
                ? 'bg-gradient-to-r from-[#EE744B] to-[#49369b] text-white shadow-[0_8px_30px_rgba(238,116,75,0.35)] hover:shadow-[0_12px_40px_rgba(238,116,75,0.5)] hover:-translate-y-1'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {isPending ? 'Bloqueando...' : 'Bloquear Días'}
          </button>
        </div>

        {/* RIGHT PANEL — Blocked list */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-base tracking-tight">Días Bloqueados</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {selectedSede?.nombre || 'Locación'}
                </p>
              </div>
              <span className="min-w-[2rem] h-8 rounded-full bg-[#EE744B]/20 border border-[#EE744B]/30 text-[#EE744B] text-sm font-black flex items-center justify-center px-2">
                {filteredBlocked.length}
              </span>
            </div>

            {filteredBlocked.length === 0 ? (
              <div className="text-center py-10 text-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Sin días bloqueados</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                {filteredBlocked.map((block) => (
                  <li
                    key={block.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-red-400/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Motivo</p>
                        <p className="text-sm font-semibold text-white/90 truncate">{block.cliente_nombre}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#EE744B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-white/50 font-medium">
                            {format(parseISO(block.fecha_entrada), 'd MMM', { locale: es })} →&nbsp;
                            {format(parseISO(block.fecha_salida), 'd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>

                      {confirmDelete === block.id ? (
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleUnblock(block.id)}
                            disabled={isPending}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isPending ? '...' : 'Sí, borrar'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs text-white/40 hover:text-white/70 font-medium px-2 py-1 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(block.id)}
                          className="text-white/20 hover:text-red-400 transition-colors shrink-0 p-1 rounded-lg hover:bg-red-400/10"
                          title="Eliminar bloqueo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
