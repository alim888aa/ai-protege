import type { Metadata } from 'next';
import { DashboardClient, DashboardHeader } from './_components';
import { SubscriptionGate } from '@/app/components/billing';

export const metadata: Metadata = {
  title: 'Dashboard | AI Protégé',
  description: 'Manage your learning sessions and start new lessons',
};

interface DashboardPageProps {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { checkout } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <DashboardHeader />
      <SubscriptionGate checkoutPending={checkout === 'success'}>
        <DashboardClient />
      </SubscriptionGate>
    </div>
  );
}
