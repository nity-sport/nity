import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { sendEmail } from '../../../src/lib/resend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Encontrar usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return res.status(200).json({
        message:
          'If this email exists in our system, you will receive a password reset link shortly.',
      });
    }

    // Gerar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash do código para armazenar no banco
    const hashedCode = await bcrypt.hash(resetCode, 10);

    // Token expira em 15 minutos
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Salvar no banco
    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Enviar email com o código
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4da6ff; }
          .code-box { 
            background: #f8f9fa; 
            border: 2px solid #4da6ff; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0; 
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #4da6ff; 
            letter-spacing: 5px; 
            font-family: monospace; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 14px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NITY</div>
            <h2>Password Reset Request</h2>
          </div>
          
          <p>Hello ${user.name},</p>
          
          <p>You have requested to reset your password. Use the verification code below to proceed:</p>
          
          <div class="code-box">
            <div class="code">${resetCode}</div>
          </div>
          
          <p><strong>This code will expire in 15 minutes.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Nity Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Password Reset Code - Nity',
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.status(200).json({
      message:
        'If this email exists in our system, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
