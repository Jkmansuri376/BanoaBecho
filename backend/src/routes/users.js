const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../db');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 1. File / Photo / Certificate Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename
  });
});

// 2. Get User Profile & Dashboard Summary
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    try {
      user.preferred_categories = typeof user.preferred_categories === 'string' ? JSON.parse(user.preferred_categories) : user.preferred_categories;
    } catch (e) {}

    // If producer, get listing summary & recent offers
    if (user.role !== 'buyer') {
      const listingsRes = await query('SELECT * FROM listings WHERE producer_id = $1 ORDER BY created_at DESC', [id]);
      const offersRes = await query(`
        SELECT o.*, l.title as listing_title, b.name as buyer_name, b.business_name as buyer_business_name
        FROM offers o
        JOIN listings l ON o.listing_id = l.id
        JOIN users b ON o.buyer_id = b.id
        WHERE l.producer_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [id]);

      const ordersRes = await query(`
        SELECT o.*, l.title as listing_title, b.business_name as buyer_business_name
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        JOIN users b ON o.buyer_id = b.id
        WHERE o.producer_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [id]);

      return res.json({
        success: true,
        user,
        listings: listingsRes.rows.map(l => ({
          ...l,
          price_tiers: typeof l.price_tiers === 'string' ? JSON.parse(l.price_tiers) : l.price_tiers,
          photo_urls: typeof l.photo_urls === 'string' ? JSON.parse(l.photo_urls) : l.photo_urls
        })),
        recentOffers: offersRes.rows,
        recentOrders: ordersRes.rows
      });
    }

    // If buyer, get recent orders and sent offers
    const sentOffersRes = await query(`
      SELECT o.*, l.title as listing_title, p.business_name as producer_business_name
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON l.producer_id = p.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [id]);

    const buyerOrdersRes = await query(`
      SELECT o.*, l.title as listing_title, p.business_name as producer_business_name
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON o.producer_id = p.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      user,
      recentOffers: sentOffersRes.rows,
      recentOrders: buyerOrdersRes.rows
    });
  } catch (err) {
    console.error('Error fetching user summary:', err);
    res.status(500).json({ error: 'Failed to fetch user summary' });
  }
});

// 3. Update User Profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_name, address_text, location_lat, location_lng, preferred_categories, verified } = req.body;

    const prefCatJson = preferred_categories ? JSON.stringify(preferred_categories) : null;

    await query(`
      UPDATE users SET
        name = COALESCE($1, name),
        business_name = COALESCE($2, business_name),
        address_text = COALESCE($3, address_text),
        location_lat = COALESCE($4, location_lat),
        location_lng = COALESCE($5, location_lng),
        preferred_categories = COALESCE($6, preferred_categories),
        verified = COALESCE($7, verified)
      WHERE id = $8
    `, [name, business_name, address_text, location_lat, location_lng, prefCatJson, verified, id]);

    const updatedUser = await query('SELECT * FROM users WHERE id = $1', [id]);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
