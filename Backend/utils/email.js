import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Use etheral email or real ones via env vars
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || 'test@ethereal.email',
      pass: process.env.SMTP_PASSWORD || 'password123'
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'HealthConnect'} <${process.env.FROM_EMAIL || 'noreply@healthconnect.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch(error) {
    console.error('Error sending email', error);
  }
};
