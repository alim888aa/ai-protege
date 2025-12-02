import { notFound } from 'next/navigation';
import { CompletionClient } from './_components';

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

  return <CompletionClient sessionId={sessionId} />;
}
