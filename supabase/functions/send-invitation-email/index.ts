import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Verify the request is from your Next.js app
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    const serviceRoleKey = authHeader.replace('Bearer ', '');
    // Verify this is a valid service role key
    if (serviceRoleKey !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Invalid service role key');
    }
    // Get the invitation data from the request
    const { invitationId, toEmail, fromUserName, fromUserEmail } = await req.json();
    if (!invitationId || !toEmail || !fromUserName || !fromUserEmail) {
      throw new Error('Missing required fields');
    }
    // Create the invitation link
    const invitationLink = `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/api/invite/accept/${invitationId}`;
    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>SplitSave Partnership Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #4f46e5; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤝 SplitSave Partnership Invitation</h1>
        </div>
        
        <div class="content">
          <h2>You're invited to join SplitSave!</h2>
          
          <p><strong>${fromUserName}</strong> (${fromUserEmail}) has invited you to be their financial partner on SplitSave.</p>
          
          <div class="highlight">
            <strong>What is SplitSave?</strong><br>
            SplitSave helps partners manage shared expenses, track savings goals, and build financial transparency together.
          </div>
          
          <p>To accept this invitation and create your account:</p>
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation & Join SplitSave</a>
          </div>
          
          <p><strong>Or copy this link:</strong><br>
          <a href="${invitationLink}">${invitationLink}</a></p>
          
          <p><em>This invitation expires in 7 days.</em></p>
          
          <p>If you have any questions, please contact ${fromUserEmail}.</p>
        </div>
        
        <div class="footer">
          <p>SplitSave - Building financial partnerships together</p>
          <p>This email was sent by SplitSave on behalf of ${fromUserName}</p>
        </div>
      </body>
      </html>
    `;
    const emailText = `
SplitSave Partnership Invitation

You're invited to join SplitSave!

${fromUserName} (${fromUserEmail}) has invited you to be their financial partner on SplitSave.

What is SplitSave?
SplitSave helps partners manage shared expenses, track savings goals, and build financial transparency together.

To accept this invitation and create your account, visit:
${invitationLink}

This invitation expires in 7 days.

If you have any questions, please contact ${fromUserEmail}.

---
SplitSave - Building financial partnerships together
This email was sent by SplitSave on behalf of ${fromUserName}
    `;
    // Send email using Resend
    console.log('About to send email via Resend...')
    console.log('From address:', 'onboarding@resend.dev')
    console.log('To email:', toEmail)
    console.log('Subject:', `${fromUserName} invited you to join SplitSave`)
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [toEmail],
        subject: `${fromUserName} invited you to join SplitSave`,
        html: emailHtml,
        text: emailText,
      }),
    })

    console.log('Resend response status:', emailResponse.status)
    console.log('Resend response headers:', Object.fromEntries(emailResponse.headers.entries()))

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email sending failed - Status:', emailResponse.status)
      console.error('Email sending failed - Response:', errorData)
      console.error('Email sending failed - Headers:', Object.fromEntries(emailResponse.headers.entries()))
      throw new Error(`Failed to send email: ${emailResponse.status} - ${errorData}`)
    }
    const emailResult = await emailResponse.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation email sent successfully',
      emailId: emailResult.id,
      invitationLink: invitationLink,
      toEmail: toEmail,
      fromUserName: fromUserName
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in invitation email function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process invitation email'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
