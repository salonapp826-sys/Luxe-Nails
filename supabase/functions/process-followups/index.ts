import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WA_API_URL = Deno.env.get('WHATSAPP_API_URL') || '';
const WA_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN') || '';

// ─── WhatsApp Send Helper ────────────────────────────────────────────────────
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const normalizedPhone = phone.replace(/[\s\-()]/g, '').startsWith('+')
    ? phone.replace(/[\s\-()]/g, '')
    : `+91${phone.replace(/[\s\-()]/g, '')}`;

  console.log(`📤 Sending WhatsApp to ${normalizedPhone}`);

  if (!WA_API_URL || !WA_API_TOKEN) {
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
      console.error('WhatsApp API error:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('WhatsApp send error:', err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending follow-ups that are due
    const { data: followups, error } = await supabase
      .from('whatsapp_followups')
      .select(`
        *,
        whatsapp_leads (
          id,
          phone,
          name,
          city,
          requirement,
          status
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50);

    if (error) throw error;

    console.log(`📅 Processing ${followups?.length || 0} follow-ups`);

    const results = [];

    for (const followup of followups || []) {
      // ── Appointment Reminder (no lead association) ──────────────────────────
      if (followup.followup_type === 'appointment_reminder') {
        const meta = followup.metadata as any || {};
        const {
          phone, customerName, bookingId, serviceName,
          technicianName, appointmentDate, appointmentTime,
          visitType, address, totalPrice, advanceAmount,
        } = meta;

        if (!phone || !bookingId) {
          await supabase
            .from('whatsapp_followups')
            .update({ status: 'skipped', sent_at: new Date().toISOString() })
            .eq('id', followup.id);
          continue;
        }

        // Check if booking still exists and is confirmed
        const { data: booking } = await supabase
          .from('bookings')
          .select('booking_status')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (!booking || booking.booking_status === 'cancelled') {
          await supabase
            .from('whatsapp_followups')
            .update({ status: 'skipped', sent_at: new Date().toISOString() })
            .eq('id', followup.id);
          console.log(`⏭️ Skipping reminder for cancelled booking ${bookingId}`);
          continue;
        }

        // Format date
        const formattedDate = appointmentDate
          ? new Date(appointmentDate).toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long',
            })
          : '';

        // Format time 24h → 12h
        const formattedTime = (() => {
          if (!appointmentTime) return '';
          const [h, m] = appointmentTime.split(':').map(Number);
          const d = new Date(); d.setHours(h, m);
          return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        })();

        const remainingAmount = totalPrice && advanceAmount ? totalPrice - advanceAmount : 0;

        const message = `⏰ *Appointment Reminder!*

Namaste ${customerName} ji! 🙏

Aapka appointment *kal* hai — just a reminder!

━━━━━━━━━━━━━━━━
📋 *Booking Details*
━━━━━━━━━━━━━━━━
🆔 Booking ID: *${bookingId}*
💆 Service: *${serviceName}*${technicianName ? `\n👩‍🎨 Artist: *${technicianName}*` : ''}
📅 Date: *${formattedDate}*
🕐 Time: *${formattedTime}*
📍 Type: *${visitType === 'home' ? '🏠 Home Service' : '🏪 Salon Visit'}*${address ? `\n🗺️ Address: ${address}` : ''}

━━━━━━━━━━━━━━━━
💰 *Remaining Payment*
━━━━━━━━━━━━━━━━
Advance already paid: ✅
Remaining to pay after service: *₹${remainingAmount}*

━━━━━━━━━━━━━━━━
⚠️ *Cancellation Policy*
━━━━━━━━━━━━━━━━
• Cancellation within 24 hours = *50% charge*
• No-shows are *non-refundable*
• To reschedule, reply here or call us

❓ Koi sawaal? Reply karein ya call karein:
📞 *+91 6376539366*

Hum aapka intezaar kar rahe hain! 💅✨
_Nails by Uma_`;

        const sent = await sendWhatsAppMessage(phone, message);

        // Log the message
        await supabase.from('whatsapp_conversations').insert({
          phone,
          message,
          direction: 'outgoing',
          is_bot_reply: true,
        });

        await supabase.from('whatsapp_logs').insert({
          booking_id: null,
          phone_number: phone,
          message_type: 'appointment_reminder',
          message_status: sent ? 'sent' : 'logged',
        });

        await supabase
          .from('whatsapp_followups')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', followup.id);

        results.push({ type: 'appointment_reminder', phone, bookingId, sent });
        console.log(`✅ Appointment reminder sent to ${phone} for booking ${bookingId}`);
        continue;
      }

      // ── Lead Follow-ups (2_hour / 24_hour) ─────────────────────────────────
      const lead = followup.whatsapp_leads as any;
      if (!lead) {
        await supabase
          .from('whatsapp_followups')
          .update({ status: 'skipped', sent_at: new Date().toISOString() })
          .eq('id', followup.id);
        continue;
      }

      if (lead.status === 'converted' || lead.status === 'lost') {
        await supabase
          .from('whatsapp_followups')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', followup.id);
        continue;
      }

      let message = '';

      if (followup.followup_type === '2_hour') {
        message = `Namaste ${lead.name}! 🙏

Aapne ${lead.requirement} ke liye inquiry ki thi. Kya aap booking confirm karna chahenge?

Hum aapki appointment jaldi se jaldi schedule kar sakte hain! 💅✨

Reply karein ya call karein: +91 6376539366`;
      } else if (followup.followup_type === '24_hour') {
        message = `Hi ${lead.name}! 👋

Kal aapne hamare ${lead.requirement} service ke baare mein pucha tha. Kya aapko koi aur help chahiye?

Hum yahan hain aapki service ke liye! Book karein aur special discount paayen! 🎁

WhatsApp ya call karein: +91 6376539366`;
      }

      if (message) {
        const sent = await sendWhatsAppMessage(lead.phone, message);

        await supabase.from('whatsapp_conversations').insert({
          phone: lead.phone,
          message,
          direction: 'outgoing',
          is_bot_reply: true,
        });

        results.push({
          leadId: lead.id,
          phone: lead.phone,
          type: followup.followup_type,
          sent,
        });

        console.log(`✅ Lead follow-up sent to ${lead.phone} (${followup.followup_type})`);
      }

      await supabase
        .from('whatsapp_followups')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', followup.id);
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, followups: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error processing follow-ups:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
