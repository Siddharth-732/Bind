import sgMail from '@sendgrid/mail';
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM_ADDRESS, // Use the verified Single Sender address
      subject,
      html: htmlContent,
    };
    
    const [response] = await sgMail.send(msg);
    console.log(` Email sent to ${to}: ${response.statusCode}`);
    return response;
  } catch (error) {
    console.error(` Failed to send email to ${to}:`, error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};
