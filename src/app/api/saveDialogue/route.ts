import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, conceptId, messages } = body;

    if (!sessionId || !conceptId || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call Convex mutation to save dialogue
    await convex.mutation(api.mutations.saveDialogue, {
      sessionId,
      conceptId,
      messages,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving dialogue:', error);
    return NextResponse.json(
      { error: 'Failed to save dialogue' },
      { status: 500 }
    );
  }
}
