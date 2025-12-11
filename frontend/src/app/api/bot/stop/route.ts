import { NextResponse } from 'next/server';
import { botService } from '@/lib/bot-service';

/**
 * POST /api/bot/stop
 * Stops the bot service
 */
export async function POST() {
  try {
    await botService.stop();

    return NextResponse.json({
      success: true,
      message: 'Bot stopped successfully',
      status: botService.getStatus(),
      stats: botService.getStats(),
    });
  } catch (error) {
    console.error('Error stopping bot:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: botService.getStatus(),
      },
      { status: 500 }
    );
  }
}
