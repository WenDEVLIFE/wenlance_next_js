import { NextResponse } from 'next/server';

/**
 * Example API route for backend logic.
 * 
 * Put any logic that needs to run on the server here:
 * - Database operations (if not using Firebase directly from client)
 * - Accessing hidden environment variables / API keys
 * - Complex calculations you don't want to expose to the client
 * - Server-side validation
 */
export async function GET() {
  try {
    // In a real scenario, you might fetch data from a database or another API
    const userData = {
      id: '123',
      role: 'developer',
      stats: {
        projects: 15,
        rating: 4.8
      }
    };

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Example: Saving user preferences to a database
  console.log('Received data for backend processing:', body);
  
  return NextResponse.json({ 
    message: 'Data processed successfully on the server',
    receivedData: body 
  });
}
