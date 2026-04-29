import { NextResponse } from 'next/server';

// WhatsApp Bot Integration API
// This endpoint receives webhook messages from Twilio/WhatsApp
// and processes commands from users

interface WhatsAppMessage {
  From: string;
  Body: string;
  ProfileName?: string;
  WaId?: string;
}

// Command handlers
const commands: Record<string, (phone: string, args: string) => Promise<string>> = {
  'status': async (phone: string) => {
    // In production, look up user by phone and return their application status
    return `📋 *InternLink Status*\n\nTo check your application status, please log in at internlink.cm\n\nCommands:\n• STATUS - Check applications\n• APPLY <id> - Apply for offer\n• REPORT [week] - View report feedback\n• HELP - Show all commands`;
  },

  'help': async () => {
    return `🤖 *InternLink WhatsApp Bot*\n\nAvailable commands:\n\n📋 *STATUS* - Check your application status\n💼 *APPLY <offer_id>* - Get link to apply for an offer\n📝 *REPORT [week]* - View your latest report feedback\n✅ *VALIDATE <id> APPROVE* - Supervisor: approve report\n🔄 *VALIDATE <id> REVISE <feedback>* - Supervisor: request revision\n🔍 *SEARCH <keyword>* - Search for offers\n\n📞 For support: support@internlink.cm`;
  },

  'apply': async (phone: string, args: string) => {
    const offerId = args.trim();
    if (!offerId) {
      return '❌ Please provide an offer ID.\n\nUsage: APPLY <offer_id>\n\nExample: APPLY abc123';
    }
    return `💼 *Apply for Offer*\n\nTo apply for offer #${offerId}, please visit:\nhttps://internlink.cm/offers/${offerId}\n\nYou'll need to log in to submit your application.`;
  },

  'report': async (phone: string, args: string) => {
    const week = args.trim();
    const weekText = week ? ` for Week ${week}` : '';
    return `📝 *Report Status${weekText}*\n\nTo view your report feedback, please log in at:\nhttps://internlink.cm/reports\n\nYour supervisor will be notified when you submit a new report.`;
  },

  'validate': async (phone: string, args: string) => {
    const parts = args.trim().split(' ');
    const reportId = parts[0];
    const action = parts[1]?.toUpperCase();

    if (!reportId || !action) {
      return '❌ Invalid format.\n\nUsage:\n• VALIDATE <report_id> APPROVE\n• VALIDATE <report_id> REVISE <feedback>';
    }

    if (action === 'APPROVE') {
      return `✅ *Report Validation*\n\nTo approve report #${reportId}, please visit:\nhttps://internlink.cm/reports/${reportId}\n\nThe student will be notified automatically.`;
    }

    if (action === 'REVISE') {
      const feedback = parts.slice(2).join(' ') || 'No feedback provided';
      return `🔄 *Request Revision*\n\nTo request revision for report #${reportId} with feedback:\n"${feedback}"\n\nPlease visit:\nhttps://internlink.cm/reports/${reportId}`;
    }

    return '❌ Invalid action. Use APPROVE or REVISE.';
  },

  'search': async (phone: string, args: string) => {
    const keyword = args.trim();
    if (!keyword) {
      return '🔍 Please provide a search keyword.\n\nExample: SEARCH marketing';
    }
    return `🔍 *Search Results for "${keyword}"*\n\nTo browse offers, visit:\nhttps://internlink.cm/offers?search=${encodeURIComponent(keyword)}`;
  },

  'register': async (phone: string) => {
    return `👋 *Welcome to InternLink!*\n\nTo create your account, please visit:\nhttps://internlink.cm/register\n\nYou can register as a Student or Company.\n\n📞 Use your phone number ${phone} during registration to enable WhatsApp notifications.`;
  },
};

// POST /api/whatsapp - Webhook endpoint for Twilio WhatsApp API
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let body: WhatsAppMessage;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Twilio sends as form-urlencoded
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = {
        From: params.get('From') || '',
        Body: params.get('Body') || '',
        ProfileName: params.get('ProfileName') || '',
        WaId: params.get('WaId') || '',
      };
    }

    const { From, Body } = body;
    const phone = From.replace('whatsapp:', '').trim();
    const messageBody = Body.trim();

    if (!messageBody) {
      return new Response('', { status: 200 });
    }

    // Parse command
    const parts = messageBody.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    // Find matching command handler
    let response: string;

    if (commands[command]) {
      response = await commands[command](phone, args);
    } else {
      response = `🤖 I didn't understand that command.\n\nType *HELP* to see available commands.\n\nOr visit internlink.cm for the full experience.`;
    }

    // Return TwiML response for Twilio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET /api/whatsapp - Verify webhook (for Twilio setup)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // In production, verify the token matches your verify token
  if (mode === 'subscribe' && token === 'internlink_verify_token') {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    success: true,
    message: 'InternLink WhatsApp Bot API',
    commands: Object.keys(commands),
    documentation: {
      STATUS: 'Check application status',
      HELP: 'Show available commands',
      APPLY: 'APPLY <offer_id> - Get link to apply',
      REPORT: 'REPORT [week] - View report feedback',
      VALIDATE: 'VALIDATE <id> APPROVE/REVISE - Supervisor actions',
      SEARCH: 'SEARCH <keyword> - Search offers',
      REGISTER: 'Get registration link',
    },
    setup: {
      twilio: 'Configure webhook URL in Twilio console',
      ngrok: 'Use ngrok for local testing: ngrok http 3000',
      sandbox: 'Join Twilio sandbox by sending JOIN <code> to +1 415 523 8886',
    },
  });
}
