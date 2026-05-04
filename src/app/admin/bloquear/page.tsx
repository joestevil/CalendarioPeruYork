import type { Metadata } from 'next';
import { getSedesAction, getBlockedDaysAction } from './actions';
import BlockDaysPanel from '@/components/BlockDaysPanel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bloquear Días — Admin | Peruyork',
  description: 'Panel de administración para bloquear días del calendario.',
};

export default async function BlockDaysPage() {
  const [sedes, blocked] = await Promise.all([
    getSedesAction(),
    getBlockedDaysAction(),
  ]);

  return <BlockDaysPanel sedes={sedes} initialBlocked={blocked} />;
}
