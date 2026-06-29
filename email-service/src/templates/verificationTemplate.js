export const getVerificationEmailTemplate = (userId, token) => {
  // point to frontend URL
  const verificationLink = `http://localhost:3000/verify-email?userId=${userId}&token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Welcome to Bind! 🚀</h2>
      <p style="color: #555; font-size: 16px;">
        Thank you for registering. We are excited to have you on board! Before you can start chatting, you need to verify your email address.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          Verify My Email
        </a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  `;
};
