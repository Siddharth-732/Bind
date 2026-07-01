export const getOTPEmailTemplate = (otpCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6; text-align: center;">
        Welcome to Bind! Please use the following 6-digit code to verify your email address and complete your registration.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <span style="display: inline-block; font-size: 36px; font-weight: bold; color: #4A90E2; padding: 20px 40px; background-color: #f4f8ff; border: 2px dashed #4A90E2; border-radius: 12px; letter-spacing: 8px;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #777; font-size: 14px; text-align: center; margin-bottom: 30px;">
        This code will expire in exactly <strong>5 minutes</strong>. <br/>If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Bind. All rights reserved.
      </p>
    </div>
  `;
};
