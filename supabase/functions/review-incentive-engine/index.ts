import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateCouponCode(prefix: string = 'NAIL'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix + '-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getSettings() {
  const { data, error } = await supabase.from('review_incentive_settings').select('*');
  if (error) throw error;
  const settings: Record<string, any> = {};
  (data || []).forEach((row) => { settings[row.setting_key] = row.setting_value; });
  return settings;
}

async function generateCoupon(params: {
  phone: string;
  customerName: string;
  bookingId?: string;
  reviewId?: string;
  couponType: 'review_incentive' | 'photo_review_bonus' | 'manual';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  expiryDays?: number;
}) {
  const { data: existing } = await supabase
    .from('review_coupons')
    .select('id')
    .eq('phone', params.phone)
    .eq('coupon_type', params.couponType)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existing) {
    console.log(`Customer ${params.phone} already has an active ${params.couponType} coupon`);
    return null;
  }

  const expiryDays = params.expiryDays || 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  let couponCode = generateCouponCode(params.couponType === 'review_incentive' ? 'REV' : 'BONUS');
  let attempts = 0;
  while (attempts < 5) {
    const { data: dup } = await supabase
      .from('review_coupons').select('id').eq('coupon_code', couponCode).maybeSingle();
    if (!dup) break;
    couponCode = generateCouponCode(params.couponType === 'review_incentive' ? 'REV' : 'BONUS');
    attempts++;
  }

  const { data, error } = await supabase
    .from('review_coupons')
    .insert({
      coupon_code: couponCode,
      phone: params.phone,
      customer_name: params.customerName,
      booking_id: params.bookingId || null,
      review_id: params.reviewId || null,
      coupon_type: params.couponType,
      discount_type: params.discountType,
      discount_value: params.discountValue,
      min_order_amount: params.minOrderAmount || 0,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Email Generators ────────────────────────────────────────────────────────

function generateBookingConfirmationHTML(p: {
  bookingId: string;
  customerName: string;
  serviceName: string;
  technicianName?: string;
  estimatedDurationMinutes?: number;
  appointmentDate: string;
  appointmentTime: string;
  visitType: string;
  address?: string;
  totalPrice: number;
  advanceAmount: number;
  remainingAmount: number;
  couponCode?: string;
  couponSavings?: number;
  upiTransactionId?: string;
}): string {
  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const formatDuration = (mins: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m} mins`;
  };

  const formattedDate = p.appointmentDate
    ? new Date(p.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const d = new Date(); d.setHours(h, m);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formattedTime = formatTime(p.appointmentTime);

  const estimatedEnd = p.appointmentTime && p.estimatedDurationMinutes
    ? (() => {
        const [h, m] = p.appointmentTime.split(':').map(Number);
        const d = new Date(); d.setHours(h, m + p.estimatedDurationMinutes);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      })()
    : null;

  const originalPrice = p.totalPrice + (p.couponSavings || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Booking Confirmed - Nails by Uma</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fdf2f8;color:#1a1a1a}
.wrap{max-width:620px;margin:0 auto;padding:24px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(219,39,119,.12)}
.hdr{background:linear-gradient(135deg,#db2777 0%,#f97316 100%);padding:40px 32px;text-align:center}
.hdr-icon{width:72px;height:72px;background:rgba(255,255,255,.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:16px}
.hdr h1{color:#fff;font-size:26px;font-weight:700;margin-bottom:6px}
.hdr p{color:rgba(255,255,255,.85);font-size:15px}
.bid-box{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:10px 20px;display:inline-block;margin-top:16px}
.bid-box span{color:#fff;font-size:12px;opacity:.8;display:block;margin-bottom:2px}
.bid-box strong{color:#fff;font-size:20px;font-family:monospace;letter-spacing:2px}
.body{padding:32px}
.greeting{font-size:15px;color:#4b5563;margin-bottom:24px;line-height:1.7}
.status-pill{display:inline-flex;align-items:center;gap:6px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:50px;padding:6px 18px;font-size:13px;font-weight:600}
.svc-box{background:linear-gradient(135deg,#fdf2f8,#fff7ed);border:2px solid #fce7f3;border-radius:14px;padding:20px 24px;margin:20px 0}
.svc-name{font-size:22px;font-weight:700;color:#db2777;margin-bottom:4px}
.svc-meta{font-size:13px;color:#9ca3af;line-height:1.7}
.section{background:#f9fafb;border-radius:14px;padding:20px 24px;margin-bottom:18px}
.sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:12px}
.row{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid #f3f4f6}
.row:last-child{border-bottom:none}
.rl{font-size:13px;color:#6b7280}
.rv{font-size:13px;font-weight:600;color:#111827;text-align:right;max-width:60%}
.price-card{background:linear-gradient(135deg,#1f2937,#374151);border-radius:14px;padding:24px;margin-bottom:18px;color:#fff}
.pr{display:flex;justify-content:space-between;padding:5px 0;font-size:14px;color:rgba(255,255,255,.7)}
.pr.total{border-top:1px solid rgba(255,255,255,.2);margin-top:8px;padding-top:14px}
.pr.total .pl{color:#fff;font-weight:700;font-size:16px}
.pr.total .pv{color:#fb923c;font-weight:800;font-size:24px}
.adv-box{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:12px}
.adv-box .al{color:rgba(255,255,255,.8);font-size:13px}
.adv-box .av{color:#4ade80;font-size:22px;font-weight:800}
.save-tag{margin-top:10px;padding:10px 16px;background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.3);border-radius:8px;display:flex;justify-content:space-between}
.save-tag span{color:#4ade80;font-size:13px}
.save-tag strong{color:#4ade80;font-weight:700}
.cta-btn{display:block;background:linear-gradient(135deg,#db2777,#f97316);color:#fff!important;text-decoration:none;text-align:center;padding:16px 32px;border-radius:50px;font-size:16px;font-weight:700;margin:24px 0}
.steps{list-style:none}
.step{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f3f4f6}
.step:last-child{border-bottom:none}
.step-n{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#db2777,#f97316);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.step-t strong{display:block;font-size:13px;color:#111827;margin-bottom:2px}
.step-t span{font-size:12px;color:#6b7280}
.policy-box{background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:16px 20px;margin-top:4px}
.policy-box p{font-size:12px;color:#b45309;line-height:1.6}
.footer{background:#fdf2f8;padding:24px 32px;text-align:center}
.footer p{font-size:12px;color:#9ca3af;line-height:1.8}
.footer a{color:#db2777;text-decoration:none}
.contacts{display:flex;justify-content:center;gap:24px;margin-bottom:12px}
.contacts span{font-size:13px;color:#6b7280}
</style>
</head>
<body>
<div class="wrap">
<div class="card">

<div class="hdr">
  <div class="hdr-icon">💅</div>
  <h1>Booking Confirmed!</h1>
  <p>We're excited to see you soon at Nails by Uma</p>
  <div class="bid-box">
    <span>Your Booking ID</span>
    <strong>${p.bookingId}</strong>
  </div>
</div>

<div class="body">
  <p class="greeting">
    Dear <strong>${p.customerName}</strong>,<br/><br/>
    Your appointment has been received and is <strong>pending payment verification</strong>.
    Our team will confirm your booking within a few hours after reviewing your payment screenshot. 💕
  </p>

  <div style="text-align:center;margin-bottom:24px">
    <span class="status-pill">⏳ Pending Payment Verification</span>
  </div>

  <div class="svc-box">
    <div class="sec-title">Your Service</div>
    <div class="svc-name">${p.serviceName}</div>
    <div class="svc-meta">
      ${p.estimatedDurationMinutes ? `⏱️ Estimated duration: <strong>${formatDuration(p.estimatedDurationMinutes)}</strong>${estimatedEnd ? ` &nbsp;·&nbsp; ends ~${estimatedEnd}` : ''}` : ''}
      <br/>
      👩‍🎨 Artist: <strong>${p.technicianName || 'Best available artist'}</strong>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">Appointment Details</div>
    <div class="row">
      <span class="rl">📅 Date</span>
      <span class="rv">${formattedDate}</span>
    </div>
    <div class="row">
      <span class="rl">🕐 Time</span>
      <span class="rv">${formattedTime}${estimatedEnd ? ` → ~${estimatedEnd}` : ''}</span>
    </div>
    <div class="row">
      <span class="rl">📍 Visit Type</span>
      <span class="rv">${p.visitType === 'home' ? '🏠 Home Service' : '🏪 Salon Visit'}</span>
    </div>
    ${p.address ? `<div class="row">
      <span class="rl">🗺️ Address</span>
      <span class="rv">${p.address}</span>
    </div>` : ''}
  </div>

  <div class="price-card">
    <div class="sec-title" style="color:rgba(255,255,255,.5)">Payment Summary</div>
    <div class="pr">
      <span>Service Amount</span>
      <span>${formatINR(originalPrice)}</span>
    </div>
    ${p.couponCode && p.couponSavings ? `<div class="pr" style="color:#4ade80">
      <span>🎟️ Coupon (${p.couponCode})</span>
      <span>− ${formatINR(p.couponSavings)}</span>
    </div>` : ''}
    <div class="pr total">
      <span class="pl">Total Amount</span>
      <span class="pv">${formatINR(p.totalPrice)}</span>
    </div>
    <div class="adv-box">
      <div>
        <div class="al">Advance Paid (50%)</div>
        <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:2px">Remaining ${formatINR(p.remainingAmount)} — pay after service</div>
      </div>
      <div class="av">${formatINR(p.advanceAmount)}</div>
    </div>
    ${p.couponCode && p.couponSavings ? `<div class="save-tag">
      <span>🎉 You saved with coupon!</span>
      <strong>${formatINR(p.couponSavings)}</strong>
    </div>` : ''}
  </div>

  ${p.upiTransactionId ? `<div class="section">
    <div class="sec-title">Payment Reference</div>
    <div class="row">
      <span class="rl">UPI Transaction ID</span>
      <span class="rv" style="font-family:monospace">${p.upiTransactionId}</span>
    </div>
    <div class="row">
      <span class="rl">Amount Paid</span>
      <span class="rv" style="color:#16a34a">${formatINR(p.advanceAmount)}</span>
    </div>
    <div class="row">
      <span class="rl">Payment Status</span>
      <span class="rv" style="color:#d97706">⏳ Verification Pending</span>
    </div>
  </div>` : ''}

  <a href="https://nailsbyuma.com/booking-status/${p.bookingId}" class="cta-btn">
    Track Your Booking Status →
  </a>

  <div class="section">
    <div class="sec-title">What Happens Next?</div>
    <ul class="steps">
      <li class="step">
        <div class="step-n">1</div>
        <div class="step-t">
          <strong>Payment Verification</strong>
          <span>Our team reviews your UPI screenshot within a few hours</span>
        </div>
      </li>
      <li class="step">
        <div class="step-n">2</div>
        <div class="step-t">
          <strong>Booking Confirmation</strong>
          <span>You'll receive a WhatsApp message once confirmed</span>
        </div>
      </li>
      <li class="step">
        <div class="step-n">3</div>
        <div class="step-t">
          <strong>Appointment Day</strong>
          <span>${p.visitType === 'home' ? 'Our artist will arrive at your address on time' : 'Visit us at our salon — we\'ll be ready for you!'}</span>
        </div>
      </li>
      <li class="step">
        <div class="step-n">4</div>
        <div class="step-t">
          <strong>Earn Review Rewards</strong>
          <span>After your visit, share your experience and get exclusive discount coupons!</span>
        </div>
      </li>
    </ul>
  </div>

  <div class="policy-box">
    <p style="font-weight:600;color:#92400e;margin-bottom:4px">⚠️ Cancellation Policy</p>
    <p>
      Free cancellation <strong>24+ hours before</strong> your appointment.
      Cancellations within 24 hours incur a <strong>50% charge</strong>.
      No-shows are non-refundable. To reschedule, WhatsApp us at +91 6376539366.
    </p>
  </div>
</div>

<div class="footer">
  <div class="contacts">
    <span>📱 <a href="https://wa.me/916376539366">+91 6376539366</a></span>
    <span>🌐 <a href="https://nailsbyuma.com">nailsbyuma.com</a></span>
  </div>
  <p>
    Nails by Uma · Rajasthan, India<br/>
    <a href="https://nailsbyuma.com/booking-status/${p.bookingId}">Track Booking</a>
    &nbsp;·&nbsp;
    <a href="https://wa.me/916376539366">WhatsApp Us</a>
  </p>
</div>

</div>
</div>
</body>
</html>`;
}

function generateReminderEmailHTML(params: {
  customerName: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  expiryDate: string;
  serviceName?: string;
}) {
  const discountText = params.discountType === 'percentage'
    ? `${params.discountValue}% OFF`
    : `₹${params.discountValue} OFF`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #fdf2f8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(219,39,119,0.15); }
    .header { background: linear-gradient(135deg, #db2777, #f97316); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .coupon-box { background: linear-gradient(135deg, #fdf2f8, #fff7ed); border: 2px dashed #db2777; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
    .coupon-code { font-family: monospace; font-size: 32px; font-weight: bold; color: #db2777; letter-spacing: 4px; }
    .discount-badge { display: inline-block; background: linear-gradient(135deg, #db2777, #f97316); color: white; padding: 8px 20px; border-radius: 50px; font-size: 18px; font-weight: bold; margin-bottom: 12px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #db2777, #f97316); color: white !important; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px; }
    .footer { background: #fdf2f8; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💅 Nails by Uma</h1>
      <p>We'd love to hear about your experience!</p>
    </div>
    <div class="content">
      <p>Hello <strong>${params.customerName}</strong>,</p>
      <p>We hope you loved your ${params.serviceName ? `<strong>${params.serviceName}</strong>` : 'recent beauty service'} with us!</p>
      <div class="coupon-box">
        <div class="discount-badge">${discountText}</div>
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Your Exclusive Coupon Code</p>
        <div class="coupon-code">${params.couponCode}</div>
        <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">Valid until ${params.expiryDate}</p>
      </div>
      <p><strong>Earn an EXTRA ₹100 bonus coupon</strong> if you include a photo with your review!</p>
      <div style="text-align: center;">
        <a href="https://nailsbyuma.com/reviews" class="cta-btn">Write Your Review Now →</a>
      </div>
    </div>
    <div class="footer">
      <p>Nails by Uma | +91 6376539366 | Rajasthan, India</p>
    </div>
  </div>
</body>
</html>`;
}

function generateThankYouEmailHTML(params: {
  customerName: string;
  bonusCouponCode: string;
  bonusDiscountValue: number;
  bonusDiscountType: string;
  expiryDate: string;
}) {
  const discountText = params.bonusDiscountType === 'percentage'
    ? `${params.bonusDiscountValue}% OFF`
    : `₹${params.bonusDiscountValue} OFF`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #fdf2f8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(219,39,119,0.15); }
    .header { background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center; color: white; }
    .coupon-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px dashed #059669; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
    .coupon-code { font-family: monospace; font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 4px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 8px 20px; border-radius: 50px; font-size: 18px; font-weight: bold; margin-bottom: 12px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #db2777, #f97316); color: white !important; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; }
    .footer { background: #fdf2f8; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Thank You!</h1>
      <p>Your amazing review + photo has earned you a bonus!</p>
    </div>
    <div style="padding: 30px;">
      <p>Dear <strong>${params.customerName}</strong>,</p>
      <p>Thank you for your wonderful review! We especially love that you included a photo.</p>
      <div class="coupon-box">
        <div class="badge">BONUS: ${discountText}</div>
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Your Photo Review Bonus Code</p>
        <div class="coupon-code">${params.bonusCouponCode}</div>
        <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">Valid until ${params.expiryDate}</p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://nailsbyuma.com/book" class="cta-btn">Book Your Next Appointment →</a>
      </div>
    </div>
    <div class="footer">Nails by Uma | +91 6376539366 | Rajasthan, India</div>
  </div>
</body>
</html>`;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // ── Send Booking Confirmation Email ──────────────────────────────────────
    if (action === 'send_booking_confirmation') {
      const {
        bookingId, customerName, customerEmail, customerPhone,
        serviceName, technicianName, estimatedDurationMinutes,
        appointmentDate, appointmentTime, visitType, address,
        totalPrice, advanceAmount, remainingAmount,
        couponCode, couponSavings, upiTransactionId,
      } = body;

      if (!bookingId || !customerName || !serviceName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: bookingId, customerName, serviceName' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailHTML = generateBookingConfirmationHTML({
        bookingId, customerName, serviceName,
        technicianName: technicianName || undefined,
        estimatedDurationMinutes: estimatedDurationMinutes || undefined,
        appointmentDate, appointmentTime,
        visitType: visitType || 'salon',
        address: address || undefined,
        totalPrice: totalPrice || 0,
        advanceAmount: advanceAmount || 0,
        remainingAmount: remainingAmount || 0,
        couponCode: couponCode || undefined,
        couponSavings: couponSavings || undefined,
        upiTransactionId: upiTransactionId || undefined,
      });

      // Log the confirmation attempt
      await supabase.from('review_email_reminders').insert({
        phone: customerPhone || '',
        customer_email: customerEmail || null,
        customer_name: customerName,
        reminder_type: 'booking_confirmation',
        scheduled_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: customerEmail ? 'sent' : 'skipped',
        error_message: customerEmail ? null : 'No email address provided',
      }).then(({ error }) => {
        if (error) console.error('Failed to log confirmation email:', error);
      });

      console.log(`Booking confirmation email generated for ${customerName} (${bookingId}), email: ${customerEmail || 'none'}`);

      return new Response(
        JSON.stringify({ success: true, emailHTML, emailSent: !!customerEmail }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Process Pending Review Reminders ─────────────────────────────────────
    if (action === 'process_reminders') {
      const now = new Date().toISOString();
      const settings = await getSettings();
      const reminderConfig = settings['reminder_schedule'] || { enabled: true, days_after_delivery: 7 };
      const incentiveConfig = settings['first_review_incentive'] || { enabled: true, discount_type: 'percentage', discount_value: 15, expiry_days: 30 };

      if (!reminderConfig.enabled || !incentiveConfig.enabled) {
        return new Response(JSON.stringify({ message: 'Reminders disabled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: reminders, error: remErr } = await supabase
        .from('review_email_reminders')
        .select('*, booking:bookings(customer_email, customer_phone, service_name, customer_name)')
        .eq('status', 'pending')
        .lte('scheduled_at', now)
        .eq('reminder_type', 'review_reminder')
        .limit(50);

      if (remErr) throw remErr;

      let processed = 0;
      let failed = 0;

      for (const reminder of (reminders || [])) {
        try {
          const { data: existingReview } = await supabase
            .from('customer_reviews')
            .select('id')
            .eq('customer_phone', reminder.phone)
            .maybeSingle();

          if (existingReview) {
            await supabase.from('review_email_reminders')
              .update({ status: 'skipped', sent_at: now })
              .eq('id', reminder.id);
            continue;
          }

          const coupon = await generateCoupon({
            phone: reminder.phone,
            customerName: reminder.customer_name,
            bookingId: reminder.booking_id,
            couponType: 'review_incentive',
            discountType: incentiveConfig.discount_type,
            discountValue: incentiveConfig.discount_value,
            minOrderAmount: incentiveConfig.min_order_amount,
            expiryDays: incentiveConfig.expiry_days,
          });

          const expiryDate = coupon?.expires_at
            ? new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : '30 days from today';

          generateReminderEmailHTML({
            customerName: reminder.customer_name,
            couponCode: coupon?.coupon_code || 'REVIEW15',
            discountType: incentiveConfig.discount_type,
            discountValue: incentiveConfig.discount_value,
            expiryDate,
            serviceName: (reminder.booking as any)?.service_name,
          });

          await supabase.from('review_email_reminders')
            .update({ status: 'sent', sent_at: now, coupon_id: coupon?.id || null })
            .eq('id', reminder.id);

          if (coupon) {
            await supabase.from('review_coupons')
              .update({ email_sent: true, email_sent_at: now })
              .eq('id', coupon.id);
          }

          processed++;
          console.log(`Processed reminder for ${reminder.customer_name} (${reminder.phone})`);
        } catch (err) {
          console.error(`Failed to process reminder ${reminder.id}:`, err);
          await supabase.from('review_email_reminders')
            .update({ status: 'failed', error_message: String(err) })
            .eq('id', reminder.id);
          failed++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed, failed, total: reminders?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Schedule Reminder ────────────────────────────────────────────────────
    if (action === 'schedule_reminder') {
      const { bookingId, phone, customerName, customerEmail, serviceName } = body;

      if (!bookingId || !phone || !customerName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const settings = await getSettings();
      const reminderConfig = settings['reminder_schedule'] || { days_after_delivery: 7 };
      const daysAfter = reminderConfig.days_after_delivery || 7;

      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + daysAfter);

      const { data: existing } = await supabase
        .from('review_email_reminders')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('reminder_type', 'review_reminder')
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ success: true, message: 'Reminder already scheduled', existing: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('review_email_reminders')
        .insert({
          booking_id: bookingId,
          phone,
          customer_email: customerEmail || null,
          customer_name: customerName,
          reminder_type: 'review_reminder',
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, reminder: data, scheduledAt: scheduledAt.toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Process Photo Bonus ──────────────────────────────────────────────────
    if (action === 'process_photo_bonus') {
      const { reviewId, phone, customerName, customerEmail } = body;

      if (!reviewId || !phone || !customerName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const settings = await getSettings();
      const bonusConfig = settings['photo_review_bonus'] || { enabled: true, discount_type: 'fixed', discount_value: 100, expiry_days: 45 };

      if (!bonusConfig.enabled) {
        return new Response(
          JSON.stringify({ success: false, message: 'Photo bonus disabled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const coupon = await generateCoupon({
        phone, customerName, reviewId,
        couponType: 'photo_review_bonus',
        discountType: bonusConfig.discount_type,
        discountValue: bonusConfig.discount_value,
        minOrderAmount: bonusConfig.min_order_amount,
        expiryDays: bonusConfig.expiry_days,
      });

      if (!coupon) {
        return new Response(
          JSON.stringify({ success: false, message: 'Customer already has bonus coupon' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const expiryDate = new Date(coupon.expires_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const emailHTML = generateThankYouEmailHTML({
        customerName,
        bonusCouponCode: coupon.coupon_code,
        bonusDiscountValue: bonusConfig.discount_value,
        bonusDiscountType: bonusConfig.discount_type,
        expiryDate,
      });

      await supabase.from('review_email_reminders').insert({
        phone,
        customer_email: customerEmail || null,
        customer_name: customerName,
        reminder_type: 'thank_you_bonus',
        scheduled_at: new Date().toISOString(),
        status: 'sent',
        sent_at: new Date().toISOString(),
        coupon_id: coupon.id,
      });

      await supabase.from('review_coupons')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('id', coupon.id);

      return new Response(
        JSON.stringify({ success: true, coupon, emailHTML }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Validate Coupon ──────────────────────────────────────────────────────
    if (action === 'validate_coupon') {
      const { couponCode, phone, orderAmount } = body;

      const { data: coupon, error } = await supabase
        .from('review_coupons')
        .select('*')
        .eq('coupon_code', couponCode.toUpperCase())
        .eq('is_used', false)
        .maybeSingle();

      if (error || !coupon) {
        return new Response(
          JSON.stringify({ valid: false, message: 'Invalid coupon code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, message: 'Coupon has expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (coupon.phone !== phone) {
        return new Response(
          JSON.stringify({ valid: false, message: 'Coupon not valid for this phone number' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (orderAmount && coupon.min_order_amount > orderAmount) {
        return new Response(
          JSON.stringify({ valid: false, message: `Minimum order ₹${coupon.min_order_amount} required` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const discountAmount = coupon.discount_type === 'percentage'
        ? Math.round((orderAmount || 0) * coupon.discount_value / 100)
        : coupon.discount_value;

      return new Response(
        JSON.stringify({ valid: true, coupon, discountAmount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Redeem Coupon ────────────────────────────────────────────────────────
    if (action === 'redeem_coupon') {
      const { couponCode, phone, bookingId } = body;

      const { data: coupon } = await supabase
        .from('review_coupons')
        .select('*')
        .eq('coupon_code', couponCode.toUpperCase())
        .eq('phone', phone)
        .eq('is_used', false)
        .maybeSingle();

      if (!coupon) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid or already used coupon' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('review_coupons')
        .update({ is_used: true, used_at: new Date().toISOString(), used_booking_id: bookingId || null })
        .eq('id', coupon.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Coupon redeemed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Get Coupons ──────────────────────────────────────────────────────────
    if (action === 'get_coupons') {
      const { phone } = body;

      const { data, error } = await supabase
        .from('review_coupons')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, coupons: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Get Analytics ────────────────────────────────────────────────────────
    if (action === 'get_analytics') {
      const [couponsResult, remindersResult] = await Promise.all([
        supabase.from('review_coupons').select('*'),
        supabase.from('review_email_reminders').select('*'),
      ]);

      const coupons = couponsResult.data || [];
      const reminders = remindersResult.data || [];

      const totalCoupons = coupons.length;
      const usedCoupons = coupons.filter(c => c.is_used).length;
      const activeCoupons = coupons.filter(c => !c.is_used && c.expires_at && new Date(c.expires_at) > new Date()).length;
      const expiredCoupons = coupons.filter(c => !c.is_used && c.expires_at && new Date(c.expires_at) < new Date()).length;
      const redemptionRate = totalCoupons > 0 ? Math.round((usedCoupons / totalCoupons) * 100) : 0;
      const incentiveCoupons = coupons.filter(c => c.coupon_type === 'review_incentive').length;
      const photoBonusCoupons = coupons.filter(c => c.coupon_type === 'photo_review_bonus').length;

      const reviewReminders = reminders.filter(r => r.reminder_type === 'review_reminder');
      const totalReminders = reviewReminders.length;
      const sentReminders = reviewReminders.filter(r => r.status === 'sent').length;
      const skippedReminders = reviewReminders.filter(r => r.status === 'skipped').length;
      const pendingReminders = reviewReminders.filter(r => r.status === 'pending').length;
      const conversionRate = totalReminders > 0 ? Math.round((skippedReminders / totalReminders) * 100) : 0;

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            coupons: { total: totalCoupons, used: usedCoupons, active: activeCoupons, expired: expiredCoupons, redemptionRate },
            byType: { reviewIncentive: incentiveCoupons, photoBonus: photoBonusCoupons },
            reminders: { total: totalReminders, sent: sentReminders, skipped: skippedReminders, pending: pendingReminders, conversionRate },
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Review incentive engine error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
