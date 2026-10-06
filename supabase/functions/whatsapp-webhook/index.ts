import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY')!;
const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL')!;

// ─── WhatsApp Send Helper ────────────────────────────────────────────────────
// Sends an outbound WhatsApp message (Meta Cloud API or Cloudflare Gateway)
// Falls back to logging if no provider API key is configured.
const WA_API_URL = Deno.env.get('WHATSAPP_API_URL') || '';       // e.g. https://graph.facebook.com/v18.0/<PHONE_ID>/messages
const WA_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN') || '';   // Bearer token

async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  // Normalize phone: remove spaces/dashes, ensure +91 prefix
  const normalizedPhone = phone.replace(/[\s\-()]/g, '').startsWith('+')
    ? phone.replace(/[\s\-()]/g, '')
    : `+91${phone.replace(/[\s\-()]/g, '')}`;

  console.log(`📤 Sending WhatsApp to ${normalizedPhone}:\n${message}`);

  if (!WA_API_URL || !WA_API_TOKEN) {
    // No provider configured — log for now (n8n or manual follow-up)
    console.log('ℹ️ WhatsApp API not configured. Message logged only.');
    return false;
  }

  try {
    const res = await fetch(WA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('WhatsApp API error:', errText);
      return false;
    }

    console.log('✅ WhatsApp message sent via API');
    return true;
  } catch (err) {
    console.error('WhatsApp send error:', err);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    // ── Outbound: Booking Confirmation WhatsApp ──────────────────────────────
    if (body.action === 'send_booking_confirmation') {
      const {
        phone, customerName, bookingId, serviceName,
        technicianName, appointmentDate, appointmentTime,
        advanceAmount, totalPrice, visitType,
      } = body;

      if (!phone || !bookingId) {
        return new Response(
          JSON.stringify({ error: 'phone and bookingId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Format date nicely
      const formattedDate = appointmentDate
        ? new Date(appointmentDate).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })
        : '';

      // Format time (24h → 12h)
      const formattedTime = (() => {
        if (!appointmentTime) return '';
        const [h, m] = appointmentTime.split(':').map(Number);
        const d = new Date(); d.setHours(h, m);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      })();

      const trackingUrl = `https://nailsbyuma.com/booking-status/${bookingId}`;

      const message = `💅 *Booking Received!*

Namaste ${customerName} ji! 🙏

Aapki booking successfully submit ho gayi hai.

━━━━━━━━━━━━━━━━
📋 *Booking Details*
━━━━━━━━━━━━━━━━
🆔 Booking ID: *${bookingId}*
💆 Service: *${serviceName}*${technicianName ? `\n👩‍🎨 Artist: *${technicianName}*` : ''}
📅 Date: *${formattedDate}*
🕐 Time: *${formattedTime}*
📍 Type: *${visitType === 'home' ? '🏠 Home Service' : '🏪 Salon Visit'}*

━━━━━━━━━━━━━━━━
💰 *Payment Summary*
━━━━━━━━━━━━━━━━
Total: *₹${totalPrice}*
Advance Paid: *₹${advanceAmount}*
Remaining: *₹${totalPrice - advanceAmount}* (after service)

⏳ *Status:* Payment verification pending. Confirmation aapko 2-4 ghante mein milegi.

🔗 *Track Booking:*
${trackingUrl}

❓ Koi sawaal? WhatsApp karein: +91 6376539366

_Nails by Uma_ 💅✨`;

      const sent = await sendWhatsAppMessage(phone, message);

      // Log outbound message
      await supabase.from('whatsapp_logs').insert({
        booking_id: null,
        phone_number: phone,
        message_type: 'booking_confirmation',
        message_status: sent ? 'sent' : 'logged',
      }).then(({ error }) => { if (error) console.error('Log error:', error); });

      // Also save to whatsapp_conversations for history
      await supabase.from('whatsapp_conversations').insert({
        phone,
        message,
        direction: 'outgoing',
        is_bot_reply: true,
      }).then(({ error }) => { if (error) console.error('Conversation log error:', error); });

      return new Response(
        JSON.stringify({ success: true, sent, message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Inbound: Handle Incoming WhatsApp Message ────────────────────────────
    const { phone, message, name } = body;

    console.log('📱 Received WhatsApp message:', { phone, message, name });

    // Save incoming message
    await supabase.from('whatsapp_conversations').insert({
      phone,
      message,
      direction: 'incoming',
      is_bot_reply: false,
    });

    // Get or create lead
    const { data: existingLead } = await supabase
      .from('whatsapp_leads')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    let lead = existingLead;

    if (!lead) {
      const { data: newLead } = await supabase
        .from('whatsapp_leads')
        .insert({ phone, name: name || null })
        .select()
        .single();
      lead = newLead;
    } else {
      // Update last message time
      await supabase
        .from('whatsapp_leads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', lead.id);
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: true })
      .limit(10);

    // Get website knowledge
    const { data: knowledge } = await supabase
      .from('website_knowledge')
      .select('content')
      .limit(100);

    const websiteContext = knowledge?.map(k => k.content).join('\n\n') || '';

    // Build AI context
    const conversationHistory = history?.map(h => 
      `${h.direction === 'incoming' ? 'Customer' : 'You'}: ${h.message}`
    ).join('\n') || '';

    const leadInfo = lead ? `
Customer Name: ${lead.name || 'Unknown'}
City: ${lead.city || 'Not provided'}
Previous Requirement: ${lead.requirement || 'None'}
Status: ${lead.status}
` : '';

    // Check if this is a booking/pricing inquiry
    const isBookingInquiry = /price|booking|join|contact|appointment|service|cost|charge/i.test(message);

    // Build AI prompt
    const systemPrompt = `You are a helpful WhatsApp assistant for a beauty salon/nail service website.

WEBSITE INFORMATION:
${websiteContext}

CUSTOMER INFORMATION:
${leadInfo}

CONVERSATION HISTORY:
${conversationHistory}

RULES:
1. Reply ONLY in Hinglish (Hindi + English mix)
2. Answer ONLY from the website information provided above
3. Be friendly, helpful and professional
4. Keep responses short (2-3 sentences max)
5. If asked about price/booking/joining/contact, ask for:
   - Name (if not known)
   - City
   - Specific requirement
6. Never make up prices or services not in the website data
7. If you don't know something, say "Main aapke liye check kar leta/leti hun, please call us at +91 6376539366"
8. Always encourage them to book an appointment

${isBookingInquiry ? `
IMPORTANT: The customer is asking about booking/pricing. You MUST:
1. Acknowledge their interest
2. Ask for their name (if not provided): "Aapka naam kya hai?"
3. Ask for their city: "Aap kahan se hain?"
4. Ask what specific service they need: "Aapko kaun si service chahiye?"
5. Once you have all info, say: "Perfect! Main aapki booking confirm kar raha/rahi hun. Aapko call/message milega shortly. Thank you!"
` : ''}`;

    // Call OnSpace AI
    const aiResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const botReply = aiData.choices[0]?.message?.content || 'Sorry, main abhi available nahi hun. Please call +91 6376539366';

    console.log('🤖 AI Response:', botReply);

    // Save bot reply
    await supabase.from('whatsapp_conversations').insert({
      phone,
      message: botReply,
      direction: 'outgoing',
      is_bot_reply: true,
    });

    // Extract lead information from conversation
    const extractedInfo = extractLeadInfo(message, history || []);
    
    if (extractedInfo.name || extractedInfo.city || extractedInfo.requirement) {
      const updateData: any = {};
      if (extractedInfo.name && !lead?.name) updateData.name = extractedInfo.name;
      if (extractedInfo.city) updateData.city = extractedInfo.city;
      if (extractedInfo.requirement) updateData.requirement = extractedInfo.requirement;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('whatsapp_leads')
          .update(updateData)
          .eq('id', lead!.id);

        console.log('📝 Updated lead info:', updateData);
      }

      // Check if we have complete lead info
      const updatedLead = { ...lead, ...updateData };
      if (updatedLead.name && updatedLead.city && updatedLead.requirement) {
        // Send admin notification
        await fetch(`${supabaseUrl}/functions/v1/send-lead-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId: lead!.id,
            phone,
            name: updatedLead.name,
            city: updatedLead.city,
            requirement: updatedLead.requirement,
          }),
        });

        // Schedule follow-ups
        const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const twentyFourHoursLater = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await supabase.from('whatsapp_followups').insert([
          {
            lead_id: lead!.id,
            followup_type: '2_hour',
            scheduled_at: twoHoursLater.toISOString(),
          },
          {
            lead_id: lead!.id,
            followup_type: '24_hour',
            scheduled_at: twentyFourHoursLater.toISOString(),
          },
        ]);

        console.log('✅ Complete lead captured, follow-ups scheduled');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: botReply,
        leadCaptured: !!(extractedInfo.name || extractedInfo.city || extractedInfo.requirement),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to extract lead information
function extractLeadInfo(message: string, history: any[]) {
  const result: { name?: string; city?: string; requirement?: string } = {};

  // Extract name (if message looks like a name)
  const namePatterns = [
    /my name is (\w+)/i,
    /mera naam (\w+) hai/i,
    /main (\w+) hun/i,
    /^(\w+)$/i, // Single word response might be name
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      result.name = match[1];
      break;
    }
  }

  // Extract city
  const cityPatterns = [
    /from (\w+)/i,
    /(\w+) se hun/i,
    /(\w+) mein rehta/i,
    /city (\w+)/i,
  ];

  for (const pattern of cityPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      result.city = match[1];
      break;
    }
  }

  // Extract requirement/service
  const serviceKeywords = ['manicure', 'pedicure', 'nail', 'facial', 'hair', 'makeup', 'bridal', 'mehndi', 'wax'];
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of serviceKeywords) {
    if (lowerMessage.includes(keyword)) {
      result.requirement = message;
      break;
    }
  }

  return result;
}
