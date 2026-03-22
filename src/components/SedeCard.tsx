import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Database } from '@/types/supabase';

type Sede = Database['public']['Tables']['sedes']['Row'];

export default function SedeCard({ sede }: { sede: Sede }) {
  if (!sede.activo) return null;
  
  const isSauna = sede.nombre.toLowerCase().includes('sauna');
  
  let imageUrl = null;
  let direccion = (sede as any).direccion;
  
  if (sede.nombre.toLowerCase().includes('sol de pimentel')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=690,fit=crop/C5tK1MdBFcE0xoxN/sala-ysu7Dvj1w3qfkFi3.png';
    direccion = direccion || 'Condominio Sol de Pimentel, Chiclayo';
  } else if (sede.nombre.toLowerCase().includes('españa')) {
    imageUrl = 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=564,fit=crop/C5tK1MdBFcE0xoxN/comedor-cocina-fuHN4NfGZaF38gc2.png';
    direccion = direccion || 'Avenida España, Trujillo Centro';
  } else if (isSauna) {
    imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyLeTURtVV8WGEBQ4nkbVHAAzmI1WSVcsZLg&s';
    direccion = direccion || 'Zona Exclusiva SPA, Sede Central';
  }

  direccion = direccion || 'Ubicación Premium';

  // Determinar un gradiente basado en si es sauna o no para darle identidad temática
  const gradientClass = isSauna 
    ? 'from-[#EE744B]/90 to-[#EE744B]/40' 
    : 'from-[#49369b]/90 to-[#49369b]/40';

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_24px_50px_rgba(73,54,155,0.12)] border border-gray-100/80 flex flex-col relative hover:-translate-y-2">
      
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
      <div className="flex-grow p-6 md:p-8 flex flex-col relative bg-white">
        
        {/* Icono flotante superpuesto - Letra Inicial */}
        {/* This section is now handled by the banner above if no image is present */}
        {imageUrl && (
          <div className="absolute -top-10 right-8 w-16 h-16 bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-50 flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 z-10">
            <span className={`text-4xl font-black ${isSauna ? 'text-[#EE744B]' : 'text-[#49369b]'}`}>
              {sede.nombre.charAt(0)}
            </span>
          </div>
        )}

        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 tracking-tight group-hover:text-[#49369b] transition-colors pr-16 leading-tight">
          {sede.nombre}
        </h3>
        <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5 opacity-80">
          <MapPin className="w-4 h-4 text-[#EE744B]" /> {direccion}
        </p>
        
        {!isSauna && (
          <p className="text-sm font-medium text-gray-500 mb-8 h-10 leading-relaxed max-w-[90%]">
            Tu espacio reservado ideal, con horarios fijos de check-in y check-out.
          </p>
        )}
        
        {/* Info de horas simplificada y elegante */}
        <div className="mb-8 mt-auto">
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
        <div>
          <Link
            href={`/reservar/${sede.id}`}
            className="w-full py-4 px-6 text-center font-bold text-white bg-gray-900 hover:bg-[#49369b] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-gray-900/10 hover:shadow-xl hover:shadow-[#49369b]/30 group/btn"
          >
            Configurar Reserva
            <ArrowRight className="w-5 h-5 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
