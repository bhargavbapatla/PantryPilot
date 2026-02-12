import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export const sendOrderConfirmation = async (
  to, 
  customerName, 
  totalAmount,
  orderId
) => {
  try {
    // 1. Sanitize Phone Number
    // Remove all non-numeric characters
    console.log(`Raw input: ${to}`);
    let formattedPhone = to.replace(/\D/g, ''); 
    
    // If number is just 10 digits (e.g., 9876543210), add 91 (India code)
    if (formattedPhone.length === 10) {
        formattedPhone = '91' + formattedPhone; 
    }

    console.log(`📨 Sending WhatsApp to: +${formattedPhone}`);

    // 2. Send Message (Using "body" for Sandbox Freeform text)
    const message = await client.messages.create({
      body: `Hello ${customerName}! 🍪\n\nYour order #${orderId.slice(-6)} is confirmed.\nTotal: ₹${totalAmount}\n\nWe will notify you when it's ready!`,
      from: fromNumber,
      to: `whatsapp:+${formattedPhone}`,
    });

    console.log(`✅ WhatsApp Sent! Message SID: ${message.sid}`);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp:", error.message);
  }
};