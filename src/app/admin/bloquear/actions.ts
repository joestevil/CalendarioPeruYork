'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { addDays, format, parseISO } from 'date-fns';

export async function blockDaysAction(formData: FormData) {
  try {
    const sede_id = formData.get('sedeId') as string;
    const fecha_inicio = formData.get('fechaInicio') as string;
    const fecha_fin_seleccionado = formData.get('fechaFin') as string;
    const motivo = (formData.get('motivo') as string) || 'Reserva directa (boca a boca)';

    if (!sede_id || !fecha_inicio || !fecha_fin_seleccionado) {
      return { success: false, error: 'Faltan datos requeridos.' };
    }

    // Sumar 1 día al fin para que el último día seleccionado quede bloqueado completo.
    // Ejemplo: usuario selecciona días 5,6,7 → guardamos fecha_salida = día 8.
    // La lógica de bloqueo usa d >= inicio && d < salida, así los 3 días quedan grises.
    const fecha_fin = format(addDays(parseISO(fecha_fin_seleccionado), 1), 'yyyy-MM-dd');

    if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
      return { success: false, error: 'La fecha final debe ser posterior a la fecha inicial.' };
    }

    // Check for overlapping blocks/bookings
    const { data: overlapping } = await (supabase.from('reservas') as any)
      .select('id')
      .eq('sede_id', sede_id)
      .in('estado', ['pendiente', 'confirmado', 'pagado', 'Pagado', 'bloqueado'])
      .lt('fecha_entrada', fecha_fin)
      .gt('fecha_salida', fecha_inicio);

    if (overlapping && overlapping.length > 0) {
      return { success: false, error: 'Ya existe una reserva o bloqueo en ese período.' };
    }

    const { error: insertError } = await (supabase.from('reservas') as any).insert({
      sede_id,
      cliente_nombre: motivo,
      correo: 'bloqueo@admin.peruyork',
      cliente_telefono: '000000000',
      fecha_entrada: fecha_inicio,
      fecha_salida: fecha_fin,
      estado: 'bloqueado',
      monto_total: 0,
      adelanto_pagado: 0,
    });

    if (insertError) throw new Error(insertError.message);

    revalidatePath('/admin/bloquear');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error inesperado.' };
  }
}

export async function unblockDayAction(reservaId: string) {
  try {
    const { error } = await (supabase.from('reservas') as any)
      .delete()
      .eq('id', reservaId)
      .eq('estado', 'bloqueado');

    if (error) throw new Error(error.message);

    revalidatePath('/admin/bloquear');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al desbloquear.' };
  }
}

export async function getSedesAction() {
  const { data, error } = await (supabase.from('sedes') as any)
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');
  if (error) return [];
  return data || [];
}

export async function getBlockedDaysAction(sedeId?: string) {
  let query = (supabase.from('reservas') as any)
    .select('id, sede_id, cliente_nombre, fecha_entrada, fecha_salida, estado')
    .eq('estado', 'bloqueado')
    .order('fecha_entrada');

  if (sedeId) query = query.eq('sede_id', sedeId);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}
