'use server';

import { supabase } from '@/lib/supabase';
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';

export async function createBookingAction(formData: FormData) {
  try {
    const sede_id = formData.get('sedeId') as string;
    const cliente_nombre = formData.get('nombre') as string;
    const cliente_correo = formData.get('correo') as string;
    const cliente_telefono = formData.get('telefono') as string;
    const fecha_entrada = formData.get('fechaEntrada') as string;
    const fecha_salida = formData.get('fechaSalida') as string;
    const isHourly = formData.get('isHourly') === 'true';

    if (!sede_id || !cliente_nombre || !cliente_correo || !cliente_telefono || !fecha_entrada || !fecha_salida) {
      return { success: false, error: 'Faltan datos requeridos.' };
    }

    const start = parseISO(fecha_entrada);
    const end = parseISO(fecha_salida);
    
    if (end <= start) {
      return { success: false, error: 'La fecha de salida debe ser posterior a la fecha de entrada.' };
    }

    let monto_total = 0;
    
    if (isHourly) {
       const hours = differenceInHours(end, start);
       monto_total = Math.max(0, hours * 20); // $20/hr tarifa base sauna
    } else {
       const nights = differenceInDays(end, start);
       monto_total = Math.max(0, nights * 50); // $50/noche tarifa default
    }

    // Overlap Check 
    // Para asegurar precisión con el API sin estricto tipado, hacemos cast
    const { data: overlappingBookings, error: overlapError } = await (supabase.from('reservas') as any)
      .select('id')
      .eq('sede_id', sede_id)
      .in('estado', ['pendiente', 'confirmado'])
      .lt('fecha_entrada', fecha_salida)
      .gt('fecha_salida', fecha_entrada);

    if (overlapError) throw new Error(overlapError.message);

    if (overlappingBookings && overlappingBookings.length > 0) {
      return { success: false, error: 'El horario seleccionado ya no está disponible.' };
    }

    const { data: insertedData, error: insertError } = await (supabase.from('reservas') as any)
      .insert({
        sede_id,
        cliente_nombre,
        cliente_correo,
        cliente_telefono,
        fecha_entrada,
        fecha_salida,
        estado: 'pendiente',
        monto_total,
        adelanto_pagado: 0.00
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: insertedData.id,
            cliente_nombre,
            cliente_correo,
            cliente_telefono,
            fecha_entrada,
            fecha_salida,
            monto_total
          })
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error action:', error);
    return { success: false, error: 'Ocurrió un error inesperado al procesar la reserva.' };
  }
}
