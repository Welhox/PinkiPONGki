import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendResetPasswordEmail(email, resetToken) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const resetUrl = isDevelopment ? 'http://localhost:5173' : 'https://localhost:8443';

  const resetLink = `${resetUrl}/reset-password?token=${resetToken}`;

  const subject = 'Password Reset Request';
  const html = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
}