import { notFound } from 'next/navigation';
import { ConceptReviewClient } from './_components';
import { SubscriptionGate } from '@/app/components/billing';

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function ConceptReviewPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    notFound();
  }

  return (
    <SubscriptionGate>
      <ConceptReviewClient sessionId={sessionId} />
    </SubscriptionGate>
  );
}
