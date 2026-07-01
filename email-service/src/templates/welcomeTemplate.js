export const getWelcomeEmailTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4A90E2; font-size: 32px; margin-bottom: 10px;">Welcome to Bind! 🎉</h1>
        <p style="color: #555; font-size: 18px;">Hi <strong>${name}</strong>,</p>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Your registration is completely verified and finished. We are absolutely thrilled to have you join our community!
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Bind is a place where you can connect, discover, and share with others. 
          To get started, why not set up your profile banner and send your first peer request?
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://yourbindapp.com/discover" style="display: inline-block; padding: 12px 30px; background-color: #4A90E2; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px;">
          Explore Bind
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Bind. All rights reserved.<br/>
        You are receiving this email because you signed up for a Bind account.
      </p>
    </div>
  `;
};
