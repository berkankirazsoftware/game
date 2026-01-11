
import { Resend } from "npm:resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validate Method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    // 3. Check API Key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY');
      throw new Error('Server configuration error')
    }

    const resend = new Resend(resendApiKey);

    // 4. Parse Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error('Invalid JSON body')
    }

    const { email, couponCode, discountValue, discountType, gameType } = body;

    if (!email || !couponCode) {
      throw new Error('Email and couponCode are required')
    }

    const gameNames: Record<string, string> = {
      snake: 'Yılan Oyunu',
      wheel: 'Çarkıfelek',
      memory: 'Hafıza Oyunu'
    }

    const gameName = gameNames[gameType] || 'Şans Oyunu';
    const discountText = discountType === 'percentage'
      ? `%${discountValue}`
      : `${discountValue}₺`;

    // 5. Generate Email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: #fdfdfd; padding: 30px; border-radius: 12px; border: 1px solid #eaeaea; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 2px; margin: 20px 0; background: #EEF2FF; padding: 15px; border-radius: 8px; display: inline-block; }
            .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>Tebrikler! 🎉</h1>
              <p><strong>${gameName}</strong> oynayarak harika bir indirim kazandınız!</p>
              
              <p>İşte kupon kodunuz:</p>
              <div class="code">${couponCode}</div>
              
              <p>Bu kodu sepetinizde kullanarak <strong>${discountText}</strong> indirimden yararlanabilirsiniz.</p>
              
              <br/>
              <a href="#" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Hemen Alışverişe Başla</a>
            </div>
            
            <div class="footer">
              <p>Bu email Booste Widget tarafından gönderilmiştir.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // 6. Send Email
    const data = await resend.emails.send({
      from: 'Booste Game <onboarding@resend.dev>',
      to: email,
      subject: `🎉 Tebrikler! ${discountText} İndirim Kuponunuz`,
      html: html,
    })

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 7. Success Response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})