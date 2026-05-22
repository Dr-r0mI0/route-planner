import 'dotenv/config';
import { checkBalance } from './server/services/authenticaService.js';

console.log('AUTHENTICA_API_KEY:', process.env.AUTHENTICA_API_KEY ? 'SET (' + process.env.AUTHENTICA_API_KEY.substring(0, 10) + '...)' : 'NOT SET');

try {
  const balance = await checkBalance();
  console.log('Balance check:', balance);
} catch (e) {
  console.error('Balance error:', e.message);
}