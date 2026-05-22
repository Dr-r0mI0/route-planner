// Authentica Service - OTP via SMS/WhatsApp/Email
const AUTHENTICA_BASE_URL = process.env.AUTHENTICA_BASE_URL || 'https://api.authentica.sa/api/v2';
const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || '';

// Send OTP
export async function sendOtp(method, recipient, templateId = 31) {
  if (!AUTHENTICA_API_KEY) {
    throw new Error('AUTHENTICA_API_KEY not configured');
  }

  const body = method === 'email' 
    ? { method, email: recipient, template_id: templateId }
    : { method, phone: recipient, template_id: templateId };

  const res = await fetch(`${AUTHENTICA_BASE_URL}/send-otp`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': AUTHENTICA_API_KEY
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  
  return json; // { success: true, message: 'OTP send successfully' }
}

// Verify OTP
export async function verifyOtp(recipient, otp) {
  if (!AUTHENTICA_API_KEY) {
    throw new Error('AUTHENTICA_API_KEY not configured');
  }

  const body = recipient.includes('@') 
    ? { email: recipient, otp }
    : { phone: recipient, otp };

  const res = await fetch(`${AUTHENTICA_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authorization': AUTHENTICA_API_KEY
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  
  return json; // { status: true, message: 'OTP verified successfully' }
}

// Check balance
export async function checkBalance() {
  if (!AUTHENTICA_API_KEY) {
    throw new Error('AUTHENTICA_API_KEY not configured');
  }

  const res = await fetch(`${AUTHENTICA_BASE_URL}/balance`, {
    headers: {
      'Accept': 'application/json',
      'X-Authorization': AUTHENTICA_API_KEY
    }
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  
  return json; // { data: { balance: 21934 } }
}

export default { sendOtp, verifyOtp, checkBalance };