import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Database } from '@/types/supabase';

type Sede = Database['public']['Tables']['sedes']['Row'];

export default function SedeCard({ sede }: { sede: Sede }) {
  if (!sede.activo) return null;
  
  const isSauna = sede.nombre.toLowerCase().includes('sauna');
  
  let imageUrl = null;
  let direccion = (sede as any).direccion;
  let mapaUrl = null;
  
  if (sede.nombre.toLowerCase().includes('sol de pimentel')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=690,fit=crop/C5tK1MdBFcE0xoxN/sala-ysu7Dvj1w3qfkFi3.png';
    direccion = direccion || 'Sol de Pimentel, Chiclayo';
    mapaUrl = 'https://maps.app.goo.gl/CUpUKXf2n2eYJ9Ty6';
  } else if (sede.nombre.toLowerCase().includes('españa')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=564,fit=crop/C5tK1MdBFcE0xoxN/comedor-cocina-fuHN4NfGZaF38gc2.png';
    direccion = direccion || 'Calle España, Chiclayo (2do piso)';
    mapaUrl = 'https://maps.app.goo.gl/A4qtDw3oqcDxU3QLA';
  } else if (isSauna) {
    imageUrl = 'https://res.cloudinary.com/dpxslk02r/image/upload/v1776058334/a526acf6-e399-4556-b451-0c8cceb469ff.png';
    direccion = direccion || 'Calle España, Chiclayo (3er piso)';
    mapaUrl = 'https://maps.app.goo.gl/A4qtDw3oqcDxU3QLA';
  }

  direccion = direccion || 'Ubicación Premium';

  // Determinar un gradiente basado en si es sauna o no para darle identidad temática
  const gradientClass = isSauna 
    ? 'from-[#EE744B]/90 to-[#EE744B]/40' 
    : 'from-[#49369b]/90 to-[#49369b]/40';

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_24px_50px_rgba(73,54,155,0.12)] border border-gray-100/80 flex flex-col relative hover:-translate-y-2">
      
      {/* Banner principal */}
      <div className={`h-48 sm:h-56 w-full relative overflow-hidden transition-all duration-700 ${
        isSauna 
          ? 'bg-gradient-to-br from-[#EE744B] via-[#EE744B]/90 to-[#49369b]' 
          : 'bg-gradient-to-br from-[#49369b] via-[#49369b]/90 to-[#EE744B]'
      }`}>
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={sede.nombre} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          </>
        ) : (
          <>
            {/* Decorative graphic overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            {/* Fallback pattern instead of image */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
          </>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute top-4 sm:top-5 right-4 sm:right-5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl z-20">
          {isSauna ? 'Sauna SPA' : 'Estadía'}
        </div>

        {!imageUrl && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[35%] z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex items-center justify-center border-b-4 border-gray-100/50 group-hover:-translate-y-2 transition-transform duration-500">
              <span className="text-4xl sm:text-5xl font-black text-[#49369b] tracking-tighter">
                {sede.nombre.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Contenido de la Tarjeta */}
      <div 
        className="flex-grow flex flex-col relative bg-white"
        style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)', flexGrow: 1 }}
      >
        
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-normal group-hover:text-[#49369b] transition-colors pr-12 leading-snug">
          {sede.nombre}
        </h3>
        {mapaUrl ? (
          <a href={mapaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#EE744B] font-medium mb-4 flex items-center gap-1.5 opacity-80 transition-colors">
            <MapPin className="w-4 h-4 text-[#EE744B]" /> {direccion}
          </a>
        ) : (
          <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5 opacity-80">
            <MapPin className="w-4 h-4 text-[#EE744B]" /> {direccion}
          </p>
        )}
        
        {!isSauna && (
          <p className="text-sm font-medium text-gray-500 mb-8 leading-loose tracking-wide">
            Tu espacio reservado ideal, con horarios fijos de check-in y check-out.
          </p>
        )}
        
        {/* Info de horas simplificada y elegante */}
        <div className="mb-8">
          {!isSauna ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/80 rounded-[1.25rem] p-4 border border-gray-100 group-hover:bg-[#f3f0ff]/50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrada</span>
                </div>
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">{sede.hora_entrada.slice(0, 5)}</span>
              </div>
              
              <div className="bg-gray-50/80 rounded-[1.25rem] p-4 border border-gray-100 group-hover:bg-[#fff0ec]/50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#EE744B]/60" />
                  <span className="text-[10px] font-black text-[#EE744B] uppercase tracking-widest">Salida</span>
                </div>
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">{sede.hora_salida.slice(0, 5)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#EE744B]/5 rounded-[1.25rem] p-4 border border-[#EE744B]/10 flex items-center justify-center">
              <span className="font-bold text-sm text-[#EE744B]">Horarios Flexibles a Elección</span>
            </div>
          )}
        </div>

        {/* Botón Reservar */}
        <div className="mt-auto" style={{ marginTop: 'auto' }}>
          <Link
            href={`/reservar/${sede.id}`}
            className="relative w-full py-4 px-6 font-extrabold text-white rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group/btn shadow-[0_8px_20px_rgba(73,54,155,0.2)] hover:shadow-[0_15px_30px_rgba(238,116,75,0.3)] hover:-translate-y-1"
          >
            {/* Fondo dinámico animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#49369b] via-[#6a53d8] to-[#EE744B] bg-[length:200%_auto] bg-left group-hover/btn:bg-right transition-all duration-500"></div>
            
            {/* Brillo */}
            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-t from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:animate-[shimmer_1s_ease-in-out]"></div>

            <span className="relative z-10 text-[15px] sm:text-base uppercase tracking-widest text-shadow-sm">Configurar Reserva</span>
            <ArrowRight className="relative z-10 w-6 h-6 transform group-hover/btn:translate-x-1.5 scale-90 group-hover/btn:scale-100 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
