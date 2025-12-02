import { notFound } from 'next/navigation';
import { ConceptReviewClient } from './_components';

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

  return <ConceptReviewClient sessionId={sessionId} />;
}
