const express = require('express');
const router = express.Router();
const { query } = require('../db');

// In-memory OTP storage for rapid verification
const otpStore = new Map();

// 1. Send Mock OTP
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit OTP (for prototype convenience default or randomized)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phone, { otp, expiresAt });
    console.log(`\n========================================`);
    console.log(`📱 [BanaoBecho OTP Service]`);
    console.log(`📞 Phone: ${phone}`);
    console.log(`🔑 Verification Code (OTP): ${otp}`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${phone}`,
      debugOtp: otp // handy for automated browser tests & UI demo banner
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 2. Verify OTP and login if user exists
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const storedData = otpStore.get(phone);
    const isMockBypass = otp === '123456' || (storedData && storedData.otp === otp);

    if (!isMockBypass) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Use the code logged in console or 123456' });
    }

    // Check if user exists in database
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return res.json({
        success: true,
        isExistingUser: true,
        user: {
          ...user,
          preferred_categories: user.preferred_categories ? JSON.parse(user.preferred_categories) : []
        }
      });
    }

    // If new user, prompt registration
    return res.json({
      success: true,
      isExistingUser: false,
      phone
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 3. Complete Registration for Producer or Buyer
router.post('/register', async (req, res) => {
  try {
    const {
      role,
      name,
      business_name,
      phone,
      location_lat,
      location_lng,
      address_text,
      verified,
      certificate_url,
      producer_category,
      preferred_categories
    } = req.body;

    if (!role || !name || !business_name || !phone) {
      return res.status(400).json({ error: 'Role, name, business name, and phone are required' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const prefCatJson = preferred_categories ? JSON.stringify(preferred_categories) : null;
    const isVerified = verified ? 1 : (certificate_url ? 1 : 0);

    // Default Pune center if location not provided
    const lat = location_lat || 18.5204;
    const lng = location_lng || 73.8567;
    const address = address_text || 'Pune Agro Cluster, Maharashtra';

    await query(`
      INSERT INTO users (
        id, role, name, business_name, phone, location_lat, location_lng, address_text,
        verified, certificate_url, producer_category, preferred_categories, rating_avg, rating_count, deals_completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      userId, role, name, business_name, phone, lat, lng, address,
      isVerified, certificate_url || null, producer_category || null, prefCatJson,
      5.0, 0, 0
    ]);

    const newUserRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = newUserRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      user: {
        ...user,
        preferred_categories: user.preferred_categories ? JSON.parse(user.preferred_categories) : []
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 4. Demo Users for 1-Click Quick Testing & Switching
router.get('/demo-users', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at ASC');
    const users = result.rows.map(u => ({
      ...u,
      preferred_categories: u.preferred_categories ? JSON.parse(u.preferred_categories) : []
    }));
    res.json({ users });
  } catch (err) {
    console.error('Error fetching demo users:', err);
    res.status(500).json({ error: 'Failed to fetch demo users' });
  }
});

// 5. Switch Active User
router.post('/switch-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        ...user,
        preferred_categories: user.preferred_categories ? JSON.parse(user.preferred_categories) : []
      }
    });
  } catch (err) {
    console.error('Error switching user:', err);
    res.status(500).json({ error: 'Failed to switch user' });
  }
});

module.exports = router;
