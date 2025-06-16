import nodemailer from 'nodemailer';

const sendEmail = async options => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Ensure the reset URL is absolute
    const resetUrl = options.resetUrl.startsWith('http') 
      ? options.resetUrl 
      : `https://to-do-frontend-ljd2.vercel.app${options.resetUrl}`;

    console.log('Sending email with reset URL:', resetUrl);

    // 2) Define the email options
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This link will expire in 10 minutes.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            ${resetUrl}
          </p>
        </div>
      `
    };

    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;