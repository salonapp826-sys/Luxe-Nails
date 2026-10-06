import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_PHONE = '+917073741421';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, phone, name, city, requirement } = await req.json();

    console.log('📢 Sending admin notification for lead:', leadId);

    const message = `🔔 *New Website Lead*

👤 *Name:* ${name}
📍 *City:* ${city}
🎯 *Service:* ${requirement}
📱 *Phone:* ${phone}

_Received via WhatsApp Bot_
_Time:_ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    // TODO: Call WhatsApp API to send notification
    // This will be configured in n8n workflow
    // For now, log the notification
    console.log('Admin notification message:', message);

    // You can also send via email or other notification service here
    
    return new Response(
      JSON.stringify({ success: true, message: 'Notification queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
