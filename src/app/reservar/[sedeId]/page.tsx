import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import BookingForm from '../../../components/BookingForm';
import SaunaBookingForm from '../../../components/SaunaBookingForm';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReservarPage({ params }: { params: Promise<{ sedeId: string }> }) {
  const { sedeId } = await params;

  const { data: sede, error: sedeError } = await supabase
    .from('sedes')
    .select('*')
    .eq('id', sedeId)
    .single();

  if (sedeError || !sede) {
    notFound();
  }

  const { data: reservas } = await (supabase.from('reservas') as any)
    .select('fecha_entrada, fecha_salida')
    .eq('sede_id', sedeId)
    .in('estado', ['pendiente', 'confirmado']);

  const existingBookings = reservas || [];
  const isSauna = sede.nombre.toLowerCase().includes('sauna');

  let imageUrl = null;
  let direccion = (sede as any).direccion;
  let mapaUrl = null;

  if (sede.nombre.toLowerCase().includes('sol de pimentel')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=690,fit=crop/C5tK1MdBFcE0xoxN/sala-ysu7Dvj1w3qfkFi3.png';
    direccion = direccion || 'Condominio Sol de Pimentel, Chiclayo';
    mapaUrl = 'https://maps.app.goo.gl/CUpUKXf2n2eYJ9Ty6';
  } else if (sede.nombre.toLowerCase().includes('españa')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=564,fit=crop/C5tK1MdBFcE0xoxN/comedor-cocina-fuHN4NfGZaF38gc2.png';
    direccion = direccion || 'Avenida España, Trujillo Centro (2do piso)';
    mapaUrl = 'https://maps.app.goo.gl/A4qtDw3oqcDxU3QLA';
  } else if (isSauna) {
    imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyLeTURtVV8WGEBQ4nkbVHAAzmI1WSVcsZLg&s';
    direccion = direccion || 'Avenida España, Trujillo Centro (3er piso)';
    mapaUrl = 'https://maps.app.goo.gl/A4qtDw3oqcDxU3QLA';
  }

  direccion = direccion || 'Ubicación Premium';

  return (
    <main className="w-full min-h-screen bg-[#f8f9fa] text-gray-900 font-sans selection:bg-[#49369b] selection:text-white flex flex-col items-center px-6 sm:px-10 md:px-16 lg:px-20 py-10 md:py-16">
      <div className="max-w-6xl w-full flex flex-col">

        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:text-[#49369b] hover:border-[#49369b] shadow-sm transition-colors w-fit">
            &larr; Volver al inicio
          </Link>
          <a href="https://peruyork.com/" target="_blank" rel="noopener noreferrer" className="bg-[#49369b] p-2 md:p-2.5 rounded-xl shadow-md border-2 border-white hover:scale-105 transition-transform cursor-pointer">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/C5tK1MdBFcE0xoxN/disea--o-sin-tatulo-7-NV9ysWCBXslY3SWD.png"
              alt="Peruyork Logo"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </a>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-12 items-start w-full">

          {/* Left Column (Location Details) - 1/3 width */}
          <div className="md:col-span-1 flex flex-col gap-6 md:sticky md:top-12">
            {imageUrl && (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex-shrink-0">
                <img src={imageUrl} alt={sede.nombre} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 text-xs font-bold rounded-lg text-[#EE744B] bg-[#EE744B]/10 uppercase tracking-widest border border-[#EE744B]/20">
                <MapPin className="w-3.5 h-3.5" />
                {isSauna ? 'RESERVA POR HORAS' : 'RESERVA DE ESTADÍA'}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
                {sede.nombre}
              </h1>
              {mapaUrl ? (
                <a href={mapaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-[#EE744B] mb-4 font-medium transition-colors w-fit">
                  <MapPin className="w-4 h-4 text-[#EE744B]" />
                  <span className="underline decoration-transparent hover:decoration-[#EE744B] underline-offset-4 transition-all">{direccion}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 mb-4 font-medium">
                  <MapPin className="w-4 h-4 text-[#EE744B]" />
                  <span>{direccion}</span>
                </div>
              )}
              <p className="text-base text-gray-600 leading-relaxed">
                Vive diferente. Descansa mejor. Repite. Prepárate para una experiencia inolvidable con el confort que mereces.
              </p>
            </div>

            <div className="w-full h-px bg-gray-200 my-2" />

            {!isSauna && (
              <div className="mt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Detalles del Horario</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Entrada</span>
                    <span className="text-xl font-bold text-gray-900">{sede.hora_entrada.slice(0, 5)}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Salida</span>
                    <span className="text-xl font-bold text-gray-900">{sede.hora_salida.slice(0, 5)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Main Booking Card) - 2/3 width */}
          <div className="md:col-span-2 w-full mt-8 md:mt-0 md:ml-4 lg:ml-12 xl:ml-16">
            <div className="p-5 sm:p-8 md:p-10 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100/80 relative overflow-hidden">
              {/* Decorative border top */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#49369b] to-[#EE744B]"></div>

              {isSauna ? (
                <SaunaBookingForm sedeId={sede.id} existingBookings={existingBookings} />
              ) : (
                <BookingForm
                  sedeId={sede.id}
                  existingBookings={existingBookings}
                  basePrice={sede.nombre.toLowerCase().includes('sol de pimentel') ? 180 : 150}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
