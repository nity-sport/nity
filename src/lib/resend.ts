import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  try {
    const emailData = {
      from:
        options.from ||
        process.env.RESEND_FROM_EMAIL ||
        'Nity <noreply@nity.com.br>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const result = await resend.emails.send(emailData);

    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
};
