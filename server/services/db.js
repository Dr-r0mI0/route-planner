import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST || '172.19.0.2',
  port: 5432,
  database: 'routplanner',
  user: 'admin',
  password: 'rout2024secure'
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// User queries
export async function getUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserByPhone(phone) {
  const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
  return result.rows[0];
}

export async function getUserById(id) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getUserByConfirmationToken(token) {
  const result = await query('SELECT * FROM users WHERE confirmation_token = $1', [token]);
  return result.rows[0];
}

// For admin: get all users (without password)
export async function getAllUsers() {
  const result = await query('SELECT id, email, name, phone, role, is_active, email_confirmed, created_at, updated_at FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function createUser(user) {
  const result = await query(
    `INSERT INTO users (id, email, password, name, phone, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [user.id, user.email, user.password, user.name, user.phone, user.role || 'user', true]
  );
  return result.rows[0];
}

export async function updateUser(id, updates) {
  const sets = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = Object.values(updates);
  const result = await query(
    `UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

export async function setUserOtp(userId, otp, expiresAt) {
  const result = await query(
    `UPDATE users SET otp_pending = $2, otp_expires_at = $3 WHERE id = $1 RETURNING *`,
    [userId, otp, expiresAt]
  );
  return result.rows[0];
}

export async function clearUserOtp(userId) {
  const result = await query(
    `UPDATE users SET otp_pending = NULL, otp_expires_at = NULL WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
}

export async function getUserWithValidOtp(phone, otp) {
  const result = await query(
    `SELECT * FROM users WHERE phone = $1 AND otp_pending = $2 AND otp_expires_at > NOW()`,
    [phone, otp]
  );
  return result.rows[0];
}

// ============ ADMIN HELPERS (for adminController.js) ============ //

// Read users - for admin compatibility
export async function readUsers() {
  const users = await getAllUsers();
  // Add properties expected by admin
  return users.map(u => ({
    ...u,
    banned: false,
    deleted: false,
    createdAt: u.created_at,
    updatedAt: u.updated_at
  }));
}

// Write users - for admin compatibility (updates role/banned status)
export async function writeUsers(users) {
  for (const user of users) {
    await updateUser(user.id, {
      role: user.role,
      is_active: !user.banned
    });
  }
  return true;
}

export default pool;