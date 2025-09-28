// Deno.serve kullan, import etme

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface EmailRequest {
  email: string
  couponCode: string
  couponDescription: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  gameType: string
}

Deno.serve(async (req: Request) => {
  console.log('🔍 Email function called')
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { email, couponCode, couponDescription, discountType, discountValue, gameType }: EmailRequest = await req.json()

    console.log('📧 Email request data:', { email, couponCode, gameType })

    // Validate input
    if (!email || !couponCode) {
      return new Response(
        JSON.stringify({ error: "Email ve kupon kodu gerekli" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Geçersiz email formatı" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Create HTML email template
    const discountText = discountType === 'percentage' ? `%${discountValue}` : `${discountValue}₺`
    const gameTypeText = gameType === 'timing' ? 'Zamanlama Oyunu' : 'Hafıza Oyunu'
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kupon Kazandınız!</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .coupon-box { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0; }
            .coupon-code { font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 10px 0; }
            .discount { font-size: 24px; margin: 10px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .game-info { background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Tebrikler!</h1>
                <p>Booste oyununda kupon kazandınız!</p>
            </div>
            
            <div class="content">
                <div class="game-info">
                    <h3>🎮 ${gameTypeText}</h3>
                    <p>Harika bir performans sergileyerek kupon kazandınız!</p>
                </div>
                
                <div class="coupon-box">
                    <h2>🎁 Kupon Kodunuz</h2>
                    <div class="coupon-code">${couponCode}</div>
                    <div class="discount">${discountText} İndirim</div>
                    <p>${couponDescription}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h3>📝 Nasıl Kullanılır?</h3>
                    <ol style="text-align: left; display: inline-block;">
                        <li>Alışveriş sepetinize ürünleri ekleyin</li>
                        <li>Ödeme sayfasında kupon kodu alanını bulun</li>
                        <li>Kupon kodunuzu girin: <strong>${couponCode}</strong></li>
                        <li>İndiriminiz otomatik olarak uygulanacak</li>
                    </ol>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>⚠️ Önemli:</strong> Bu kupon kodunu güvenli bir yerde saklayın. Tekrar gönderilmeyecektir.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Bu email Booste oyun platformu tarafından gönderilmiştir.</p>
                <p>© 2024 Booste. Tüm hakları saklıdır.</p>
                <p style="font-size: 12px; color: #999;">
                    Bu otomatik bir emaildir, lütfen yanıtlamayın.
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    // Send email using Resend (you can also use SendGrid, Mailgun, etc.)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    console.log('🔑 Resend API Key exists:', !!resendApiKey)
    console.log('🔑 API Key length:', resendApiKey?.length || 0)
    
    if (!resendApiKey) {
      // Fallback: Log email instead of sending (for development)
      console.log('📧 Email would be sent to:', email)
      console.log('🎁 Coupon:', couponCode)
      console.log('💰 Discount:', discountText)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email gönderildi (development mode)",
          email: email,
          coupon: couponCode
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Send actual email with Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Booste <onboarding@resend.dev>',
        to: [email],
        subject: `🎉 Kupon Kazandınız! ${couponCode} - ${discountText} İndirim`,
        html: htmlContent,
      }),
    })

    console.log('📤 Email API response status:', emailResponse.status)
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('❌ Email send error:', errorData)
      
      return new Response(
        JSON.stringify({ error: "Email gönderilemedi" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('✅ Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email başarıyla gönderildi",
        emailId: emailResult.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ error: "Sunucu hatası" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})