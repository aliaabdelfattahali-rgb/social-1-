export interface EmailTemplateData {
  otp: string;
  name: string;
  expiresIn: string;
}

export const emailVerificationTemplate = (data: EmailTemplateData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .otp { font-size: 32px; font-weight: bold; color: #4a90e2; text-align: center; padding: 20px; background-color: #e8f0fe; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Social-App</h1>
            <h2>Email Verification</h2>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>Thank you for registering with Social-App. Please use the following OTP to verify your email address:</p>
            <div class="otp">${data.otp}</div>
            <p>This OTP will expire in ${data.expiresIn}.</p>
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Social-App. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const passwordResetTemplate = (data: EmailTemplateData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
          .otp { font-size: 32px; font-weight: bold; color: #e74c3c; text-align: center; padding: 20px; background-color: #fdedec; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Social-App</h1>
            <h2>Password Reset</h2>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>You requested a password reset. Please use the following OTP to reset your password:</p>
            <div class="otp">${data.otp}</div>
            <p>This OTP will expire in ${data.expiresIn}.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Social-App. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
