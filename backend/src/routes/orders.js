const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { emitUserEvent } = require('../socket');

// 1. Buy Now at Listed Price (Instant checkout matching price tier)
router.post('/buy-now', async (req, res) => {
  try {
    const { listing_id, buyer_id, quantity, notes } = req.body;

    if (!listing_id || !buyer_id || !quantity) {
      return res.status(400).json({ error: 'listing_id, buyer_id, and quantity are required' });
    }

    const listingRes = await query(`
      SELECT l.*, p.address_text as producer_address, p.name as producer_name
      FROM listings l
      JOIN users p ON l.producer_id = p.id
      WHERE l.id = $1
    `, [listing_id]);

    if (listingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingRes.rows[0];
    let tiers = [];
    try {
      tiers = typeof listing.price_tiers === 'string' ? JSON.parse(listing.price_tiers) : listing.price_tiers;
    } catch (e) {
      tiers = [];
    }

    const qty = parseFloat(quantity);
    let matchedTier = tiers.find(t => qty >= t.min_qty && qty <= t.max_qty);

    if (!matchedTier && tiers.length > 0) {
      // If higher than max tier, use the highest tier rate
      const sortedTiers = [...tiers].sort((a, b) => b.min_qty - a.min_qty);
      if (qty >= sortedTiers[0].min_qty) {
        matchedTier = sortedTiers[0];
      } else {
        // Fallback to first tier
        matchedTier = tiers[0];
      }
    }

    const unitPrice = matchedTier ? parseFloat(matchedTier.price_per_unit) : 100;
    const totalAmount = qty * unitPrice;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    await query(`
      INSERT INTO orders (
        id, offer_id, listing_id, buyer_id, producer_id,
        final_price_per_unit, final_quantity, total_amount, status, notes, pickup_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', $9, $10)
    `, [
      orderId, null, listing_id, buyer_id, listing.producer_id,
      unitPrice, qty, totalAmount,
      notes || 'Direct Buy Now order placed at listed bulk tier rate.',
      listing.producer_address
    ]);

    // Update deals count
    await query('UPDATE users SET deals_completed = deals_completed + 1 WHERE id = $1 OR id = $2', [
      listing.producer_id, buyer_id
    ]);

    const orderRes = await query(`
      SELECT o.*, 
             l.title as listing_title, l.unit,
             p.name as producer_name, p.business_name as producer_business_name, p.phone as producer_phone, p.address_text as producer_address,
             b.name as buyer_name, b.business_name as buyer_business_name, b.phone as buyer_phone, b.address_text as buyer_address
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON o.producer_id = p.id
      JOIN users b ON o.buyer_id = b.id
      WHERE o.id = $1
    `, [orderId]);

    const order = orderRes.rows[0];

    emitUserEvent(listing.producer_id, 'order_confirmed', {
      orderId: order.id,
      message: `🎉 Instant Buy Now order received for ${qty} ${listing.unit} of ${listing.title}!`
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully via Buy Now!',
      order
    });
  } catch (err) {
    console.error('Error placing Buy Now order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 2. Get User Orders
router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let sql = '';
    if (role === 'producer') {
      sql = `
        SELECT o.*, 
               l.title as listing_title, l.unit, l.category,
               b.name as buyer_name, b.business_name as buyer_business_name, b.phone as buyer_phone, b.address_text as buyer_address,
               (SELECT COUNT(*) FROM ratings r WHERE r.order_id = o.id AND r.from_user_id = o.producer_id) as producer_rated
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        JOIN users b ON o.buyer_id = b.id
        WHERE o.producer_id = $1
        ORDER BY o.created_at DESC
      `;
    } else {
      sql = `
        SELECT o.*, 
               l.title as listing_title, l.unit, l.category,
               p.name as producer_name, p.business_name as producer_business_name, p.phone as producer_phone, p.address_text as producer_address,
               (SELECT COUNT(*) FROM ratings r WHERE r.order_id = o.id AND r.from_user_id = o.buyer_id) as buyer_rated
        FROM orders o
        JOIN listings l ON o.listing_id = l.id
        JOIN users p ON o.producer_id = p.id
        WHERE o.buyer_id = $1
        ORDER BY o.created_at DESC
      `;
    }

    const result = await query(sql, [userId]);
    res.json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 3. Single Order Detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT o.*, 
             l.title as listing_title, l.unit, l.category, l.photo_urls,
             p.name as producer_name, p.business_name as producer_business_name, p.phone as producer_phone, p.address_text as producer_address, p.rating_avg as producer_rating_avg,
             b.name as buyer_name, b.business_name as buyer_business_name, b.phone as buyer_phone, b.address_text as buyer_address, b.rating_avg as buyer_rating_avg
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON o.producer_id = p.id
      JOIN users b ON o.buyer_id = b.id
      WHERE o.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    try {
      order.photo_urls = typeof order.photo_urls === 'string' ? JSON.parse(order.photo_urls) : order.photo_urls;
    } catch (e) {}

    // Fetch existing ratings for this order
    const ratingsRes = await query('SELECT * FROM ratings WHERE order_id = $1', [id]);
    order.ratings = ratingsRes.rows;

    res.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order detail:', err);
    res.status(500).json({ error: 'Failed to fetch order detail' });
  }
});

// 4. Update Order Status (e.g. confirmed -> picked_up -> completed)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'picked_up', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    await query('UPDATE orders SET status = $1, updated_at = datetime(\'now\') WHERE id = $2', [status, id]);

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = orderRes.rows[0];

    emitUserEvent(order.producer_id, 'order_status_change', { orderId: id, status });
    emitUserEvent(order.buyer_id, 'order_status_change', { orderId: id, status });

    res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
