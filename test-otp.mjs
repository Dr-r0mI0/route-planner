// Quick test script
import 'dotenv/config';
import { sendOtp } from './server/services/authenticaService.js';

console.log('AUTH_KEY:', process.env.AUTHENTICA_API_KEY ? 'SET' : 'NOT SET');
console.log('Testing Authentica OTP...');

try {
  const result = await sendOtp('sms', '+966551234567');
  console.log('Success:', result);
} catch (err) {
  console.error('Error:', err.message);
}

process.exit(0);