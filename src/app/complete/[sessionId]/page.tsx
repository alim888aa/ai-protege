import { notFound } from 'next/navigation';
import { CompletionClient } from './_components';
import { SubscriptionGate } from '@/app/components/billing';

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function CompletionPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    notFound();
  }

  return (
    <SubscriptionGate>
      <CompletionClient sessionId={sessionId} />
    </SubscriptionGate>
  );
}
