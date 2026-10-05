const nodemailer = require('nodemailer');
const environment = require('../config/environment');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: environment.smtp.host,
      port: environment.smtp.port,
      secure: environment.smtp.port === 465, // true for 465, false for other ports
      auth: {
        user: environment.smtp.user,
        pass: environment.smtp.pass,
      },
    });
  }

  async sendPasswordResetEmail(toEmail, resetToken) {
    if (!environment.smtp.user || !environment.smtp.pass) {
      console.warn('SMTP credentials not configured. Skipping email send.');
      console.warn('Reset Token:', resetToken);
      return false;
    }

    const resetUrl = `${environment.clientUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `Plywood OS <${environment.smtp.fromEmail}>`,
      to: toEmail,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link, or paste this into your browser to complete the process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e09f3e; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 0.9em; color: #555;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
  async sendLowStockAlertEmail(adminEmail, productName, branchName, currentQuantity) {
    if (!environment.smtp.user || !environment.smtp.pass) {
      console.warn('SMTP credentials not configured. Skipping low stock alert.');
      return false;
    }

    const mailOptions = {
      from: `Plywood OS <${environment.smtp.fromEmail}>`,
      to: adminEmail,
      subject: `🚨 Low Stock Alert: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #d9534f;">Low Stock Alert</h2>
          <p>This is an automated alert from your inventory system.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Product:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Branch:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${branchName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Current Quantity:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #d9534f; font-weight: bold;">${currentQuantity}</td>
            </tr>
          </table>
          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Please re-stock this item to avoid running out of inventory.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending low stock email:', error);
      // We don't throw error here to avoid breaking the stockOut transaction
      return false;
    }
  }
}

module.exports = new EmailService();
