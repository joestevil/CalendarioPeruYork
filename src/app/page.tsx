import { supabase } from '@/lib/supabase';
import SedeCard from '@/components/SedeCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: sedes, error } = await supabase
    .from('sedes')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  return (
    <main className="w-full bg-[#f8f9fa] min-h-screen text-gray-900 flex flex-col items-center justify-center px-6 md:px-12 py-24 pb-36">
      <div className="max-w-7xl w-full flex flex-col items-center">
        {/* Brand visual focus - Dark badge to contrast the light logo */}
        <a href="https://peruyork.com/" target="_blank" rel="noopener noreferrer" className="block w-auto h-32 md:h-40 mb-8 bg-[#49369b] p-4 md:p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(73,54,155,0.4)] border-4 border-white hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
          <img 
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/C5tK1MdBFcE0xoxN/disea--o-sin-tatulo-7-NV9ysWCBXslY3SWD.png" 
            alt="Peruyork Airbnb Logo" 
            className="h-full w-auto object-contain drop-shadow-sm"
          />
        </a>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 tracking-tighter text-[#49369b] text-center drop-shadow-sm">
          PERUYORK AIRBNB
        </h1>
        <p className="text-gray-500 mb-16 text-lg md:text-2xl font-medium max-w-2xl text-center leading-relaxed">
          Vive diferente. Descansa mejor. Repite. <br/>
          <span className="text-[#EE744B] font-bold">Selecciona una locación para reservar.</span>
        </p>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-2xl w-full max-w-md text-center shadow-sm">
            Error al cargar las locaciones. Por favor intenta de nuevo.
          </div>
        )}

        <div className="grid w-full gap-10 md:gap-14 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mt-4">
          {(sedes as any[] | null)?.map((sede) => (
            <SedeCard key={sede.id} sede={sede} />
          ))}
          {sedes?.length === 0 && !error && (
            <p className="col-span-full text-gray-500 py-12 text-lg text-center bg-white rounded-3xl border border-dashed border-gray-300">
              No hay locaciones disponibles.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
