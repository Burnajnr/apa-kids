// api/submit.js
// Vercel Serverless Function to process contact and waitlist submissions via Resend API

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Reject non-POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    if (!data) {
      return res.status(400).json({ success: false, error: 'Empty request body' });
    }

    const { formType, website } = data;

    // 1. Honeypot Spam Protection Check
    // If the hidden 'website' input field contains value, it's a bot submission
    if (website && website.trim() !== '') {
      console.warn('[Spam Detected] Honeypot field filled. Silently discarding submission.');
      // Return 200 success to trick the bot into thinking it succeeded
      return res.status(200).json({ 
        success: true, 
        message: 'Submission received successfully (spam-discarded).' 
      });
    }

    // 2. Perform Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formType === 'contact') {
      const { name, email, phone, subject, message } = data;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Full Name is required.' });
      }
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, error: 'A valid email address is required.' });
      }
      if (!subject || !subject.trim()) {
        return res.status(400).json({ success: false, error: 'Subject is required.' });
      }
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message content is required.' });
      }

      // Format Contact Email HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #0B2240; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #DECDBE; border-radius: 8px; overflow: hidden; }
            .header { background-color: #0B2240; color: #FFFFFF; padding: 20px; text-align: center; border-bottom: 4px solid #C5A059; }
            .header h2 { margin: 0; font-family: 'Georgia', serif; font-weight: normal; }
            .content { padding: 30px; background-color: #FAF8F5; }
            .field-row { margin-bottom: 20px; border-bottom: 1px dashed #DECDBE; padding-bottom: 10px; }
            .field-label { font-weight: bold; color: #C5A059; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
            .field-value { font-size: 1rem; color: #0B2240; margin-top: 5px; white-space: pre-wrap; }
            .footer { background-color: #EFEAE0; color: #718096; text-align: center; padding: 15px; font-size: 0.8rem; border-top: 1px solid #DECDBE; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Website Message</h2>
              <p style="margin: 5px 0 0 0; color: #DDC595; font-size: 0.9rem;">APA Prep Academy Contact Form</p>
            </div>
            <div class="content">
              <div class="field-row">
                <div class="field-label">Full Name</div>
                <div class="field-value">${escapeHtml(name)}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Email Address</div>
                <div class="field-value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
              </div>
              <div class="field-row">
                <div class="field-label">Phone Number</div>
                <div class="field-value">${phone ? escapeHtml(phone) : 'Not Provided'}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Subject</div>
                <div class="field-value">${escapeHtml(subject)}</div>
              </div>
              <div class="field-row" style="border: none; padding-bottom: 0;">
                <div class="field-label">Message</div>
                <div class="field-value">${escapeHtml(message)}</div>
              </div>
            </div>
            <div class="footer">
              Sent in real-time from the APA Prep Academy contact form.
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        subject: `[Contact Form] ${subject.trim()}`,
        replyTo: `${name.trim()} <${email.trim()}>`,
        html: htmlContent,
        text: `New message from ${name.trim()} (${email.trim()}).\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}`,
        res,
        req
      });

    } else if (formType === 'inquiry') {
      const { parentName, parentPhone, parentEmail, childName, childAge, startDate, notes } = data;

      if (!parentName || !parentName.trim()) {
        return res.status(400).json({ success: false, error: 'Parent / Guardian Name is required.' });
      }
      if (!parentPhone || !parentPhone.trim()) {
        return res.status(400).json({ success: false, error: 'Phone Number is required.' });
      }
      if (!parentEmail || !emailRegex.test(parentEmail.trim())) {
        return res.status(400).json({ success: false, error: 'A valid email address is required.' });
      }
      if (!childAge) {
        return res.status(400).json({ success: false, error: "Child's Age Group is required." });
      }
      if (!startDate) {
        return res.status(400).json({ success: false, error: 'Desired Start Date is required.' });
      }

      // Format Inquiry Email HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #0B2240; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #DECDBE; border-radius: 8px; overflow: hidden; }
            .header { background-color: #0B2240; color: #FFFFFF; padding: 20px; text-align: center; border-bottom: 4px solid #C5A059; }
            .header h2 { margin: 0; font-family: 'Georgia', serif; font-weight: normal; }
            .content { padding: 30px; background-color: #FAF8F5; }
            .field-row { margin-bottom: 20px; border-bottom: 1px dashed #DECDBE; padding-bottom: 10px; }
            .field-label { font-weight: bold; color: #C5A059; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
            .field-value { font-size: 1rem; color: #0B2240; margin-top: 5px; white-space: pre-wrap; }
            .badge { display: inline-block; background-color: #0B2240; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold; text-transform: uppercase; }
            .footer { background-color: #EFEAE0; color: #718096; text-align: center; padding: 15px; font-size: 0.8rem; border-top: 1px solid #DECDBE; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Waitlist Inquiry</h2>
              <p style="margin: 5px 0 0 0; color: #DDC595; font-size: 0.9rem;">APA Prep Academy Interest Registration</p>
            </div>
            <div class="content">
              <div class="field-row">
                <div class="field-label">Parent / Guardian Name</div>
                <div class="field-value">${escapeHtml(parentName)}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Email Address</div>
                <div class="field-value"><a href="mailto:${escapeHtml(parentEmail)}">${escapeHtml(parentEmail)}</a></div>
              </div>
              <div class="field-row">
                <div class="field-label">Phone Number</div>
                <div class="field-value">${escapeHtml(parentPhone)}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Child's Name</div>
                <div class="field-value">${childName ? escapeHtml(childName) : 'Not Provided'}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Child's Age Group</div>
                <div class="field-value"><span class="badge">${escapeHtml(childAge)}</span></div>
              </div>
              <div class="field-row">
                <div class="field-label">Desired Start Date</div>
                <div class="field-value">${escapeHtml(startDate)}</div>
              </div>
              <div class="field-row" style="border: none; padding-bottom: 0;">
                <div class="field-label">Additional Notes / Special Needs Focus</div>
                <div class="field-value">${notes ? escapeHtml(notes) : 'None Provided'}</div>
              </div>
            </div>
            <div class="footer">
              Sent in real-time from the APA Prep Academy waitlist inquiry form.
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        subject: `[Waitlist Inquiry] New Interest from ${parentName.trim()}`,
        replyTo: `${parentName.trim()} <${parentEmail.trim()}>`,
        html: htmlContent,
        text: `New waitlist inquiry from ${parentName.trim()} (${parentEmail.trim()}).\nPhone: ${parentPhone}\nChild Age: ${childAge}\nStart Date: ${startDate}\nNotes: ${notes || 'None'}`,
        res,
        req
      });

    } else {
      return res.status(400).json({ success: false, error: 'Invalid formType specified.' });
    }

  } catch (err) {
    console.error('Submit API Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// Helper function to send email via Resend
async function sendEmail({ subject, replyTo, html, text, res, req }) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipientEmail = process.env.CONTACT_EMAIL || 'Dynamickidzplaycorner@gmail.com';
  const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

  // Check if running in local environment (development)
  const isLocalhost = req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'));
  const isDev = process.env.NODE_ENV !== 'production' || isLocalhost;

  // Local development fallback mode
  if (!apiKey) {
    if (isDev) {
      console.log('====== [DEV MODE - SIMULATING EMAIL SUBMISSION] ======');
      console.log('Recipient Email (CONTACT_EMAIL):', recipientEmail);
      console.log('Sender Email (SENDER_EMAIL):', senderEmail);
      console.log('Reply To:', replyTo);
      console.log('Subject:', subject);
      console.log('Text Content:\n', text);
      console.log('======================================================');

      return res.status(200).json({
        success: true,
        message: 'Dev Mode: Submission simulated and details logged to server console successfully.',
        devMode: true
      });
    } else {
      // Production without api key is configuration error
      console.error('[Configuration Error] RESEND_API_KEY is not defined in production.');
      return res.status(500).json({
        success: false,
        error: 'Email service configuration error. Please ensure RESEND_API_KEY is configured on the backend.'
      });
    }
  }

  // Call Resend API via HTTPS fetch (Node.js 18 native global fetch)
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `APA Prep Academy Website <${senderEmail}>`,
      to: recipientEmail,
      reply_to: replyTo,
      subject: subject,
      html: html,
      text: text
    })
  });

  const resendData = await resendResponse.json();

  if (resendResponse.ok) {
    return res.status(200).json({
      success: true,
      message: 'Email delivered successfully.'
    });
  } else {
    console.error('[Resend API Error]:', resendData);
    return res.status(500).json({
      success: false,
      error: resendData.message || 'Error occurred while delivering the email via Resend API.'
    });
  }
}

// Simple HTML escaping to protect against XSS injection in HTML email templates
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
