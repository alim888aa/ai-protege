import type { Metadata } from 'next';
import { DashboardClient, DashboardHeader } from './_components';

export const metadata: Metadata = {
  title: 'Dashboard | AI Protégé',
  description: 'Manage your learning sessions and start new lessons',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      <DashboardHeader />
      <DashboardClient />
    </div>
  );
}
