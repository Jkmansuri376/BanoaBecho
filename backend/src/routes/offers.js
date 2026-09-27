const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { emitThreadEvent, emitUserEvent } = require('../socket');

// 1. Fetch Full Negotiation Thread between Buyer & Producer for a Listing
router.get('/thread/:listingId/:buyerId', async (req, res) => {
  try {
    const { listingId, buyerId } = req.params;

    // Fetch listing + producer
    const listingRes = await query(`
      SELECT l.*, u.name as producer_name, u.business_name as producer_business_name, 
             u.phone as producer_phone, u.address_text as producer_address, u.verified as producer_verified,
             u.rating_avg as producer_rating_avg
      FROM listings l
      JOIN users u ON l.producer_id = u.id
      WHERE l.id = $1
    `, [listingId]);

    if (listingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingRes.rows[0];
    try {
      listing.price_tiers = typeof listing.price_tiers === 'string' ? JSON.parse(listing.price_tiers) : listing.price_tiers;
      listing.photo_urls = typeof listing.photo_urls === 'string' ? JSON.parse(listing.photo_urls) : listing.photo_urls;
    } catch (e) {}

    // Fetch buyer
    const buyerRes = await query('SELECT * FROM users WHERE id = $1', [buyerId]);
    const buyer = buyerRes.rows[0] || null;

    // Fetch all offers in this conversation thread
    const offersRes = await query(`
      SELECT o.*, 
             CASE WHEN o.created_by_role = 'buyer' THEN b.name ELSE p.name END as creator_name,
             CASE WHEN o.created_by_role = 'buyer' THEN b.business_name ELSE p.business_name END as creator_business
      FROM offers o
      JOIN users b ON o.buyer_id = b.id
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON l.producer_id = p.id
      WHERE o.listing_id = $1 AND o.buyer_id = $2
      ORDER BY o.created_at ASC
    `, [listingId, buyerId]);

    // Check if an order already exists for this thread
    const orderRes = await query(`
      SELECT * FROM orders 
      WHERE listing_id = $1 AND buyer_id = $2 AND status != 'cancelled'
      ORDER BY created_at DESC LIMIT 1
    `, [listingId, buyerId]);

    res.json({
      success: true,
      listing,
      buyer,
      offers: offersRes.rows,
      existingOrder: orderRes.rows[0] || null
    });
  } catch (err) {
    console.error('Error fetching negotiation thread:', err);
    res.status(500).json({ error: 'Failed to fetch negotiation thread' });
  }
});

// 2. Submit New Offer (Buyer or Producer counter initial)
router.post('/', async (req, res) => {
  try {
    const {
      listing_id,
      buyer_id,
      parent_offer_id,
      quantity,
      offered_price_per_unit,
      notes,
      created_by_role
    } = req.body;

    if (!listing_id || !buyer_id || !quantity || !offered_price_per_unit) {
      return res.status(400).json({ error: 'Missing required offer fields' });
    }

    const offerId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const role = created_by_role || 'buyer';

    // If counter offering, mark parent as countered
    if (parent_offer_id) {
      await query('UPDATE offers SET status = $1 WHERE id = $2', ['countered', parent_offer_id]);
    }

    await query(`
      INSERT INTO offers (
        id, listing_id, buyer_id, parent_offer_id, quantity, offered_price_per_unit, notes, status, created_by_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
    `, [
      offerId, listing_id, buyer_id, parent_offer_id || null,
      parseFloat(quantity), parseFloat(offered_price_per_unit), notes || '', role
    ]);

    // Fetch newly created offer with joined user details
    const newOfferRes = await query(`
      SELECT o.*, 
             CASE WHEN o.created_by_role = 'buyer' THEN b.name ELSE p.name END as creator_name,
             CASE WHEN o.created_by_role = 'buyer' THEN b.business_name ELSE p.business_name END as creator_business,
             l.producer_id
      FROM offers o
      JOIN users b ON o.buyer_id = b.id
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON l.producer_id = p.id
      WHERE o.id = $1
    `, [offerId]);

    const createdOffer = newOfferRes.rows[0];

    // Real-time broadcast to negotiation room
    emitThreadEvent(listing_id, buyer_id, 'new_offer', {
      offer: createdOffer,
      timestamp: new Date().toISOString()
    });

    // Notify opposite party
    const targetUserId = role === 'buyer' ? createdOffer.producer_id : buyer_id;
    emitUserEvent(targetUserId, 'notification', {
      title: 'New Offer Received',
      message: `${createdOffer.creator_business} sent an offer of ₹${offered_price_per_unit}/unit for ${quantity} units`,
      listingId: listing_id,
      buyerId: buyer_id,
      offerId: offerId
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully!',
      offer: createdOffer
    });
  } catch (err) {
    console.error('Error submitting offer:', err);
    res.status(500).json({ error: 'Failed to submit offer' });
  }
});

// 3. Counter Offer Action
router.post('/:id/counter', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, offered_price_per_unit, notes, created_by_role } = req.body;

    const parentOfferRes = await query('SELECT * FROM offers WHERE id = $1', [id]);
    if (parentOfferRes.rows.length === 0) {
      return res.status(404).json({ error: 'Original offer not found' });
    }
    const parentOffer = parentOfferRes.rows[0];

    // Mark previous offer as countered
    await query('UPDATE offers SET status = $1 WHERE id = $2', ['countered', id]);

    const counterOfferId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const finalQty = quantity !== undefined ? parseFloat(quantity) : parentOffer.quantity;
    const finalPrice = offered_price_per_unit !== undefined ? parseFloat(offered_price_per_unit) : parentOffer.offered_price_per_unit;

    await query(`
      INSERT INTO offers (
        id, listing_id, buyer_id, parent_offer_id, quantity, offered_price_per_unit, notes, status, created_by_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
    `, [
      counterOfferId, parentOffer.listing_id, parentOffer.buyer_id, id,
      finalQty, finalPrice, notes || '', created_by_role || 'producer'
    ]);

    const counterRes = await query(`
      SELECT o.*, 
             CASE WHEN o.created_by_role = 'buyer' THEN b.name ELSE p.name END as creator_name,
             CASE WHEN o.created_by_role = 'buyer' THEN b.business_name ELSE p.business_name END as creator_business,
             l.producer_id
      FROM offers o
      JOIN users b ON o.buyer_id = b.id
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON l.producer_id = p.id
      WHERE o.id = $1
    `, [counterOfferId]);

    const counterOffer = counterRes.rows[0];

    // Real-time broadcast
    emitThreadEvent(parentOffer.listing_id, parentOffer.buyer_id, 'counter_offer', {
      offer: counterOffer,
      parentOfferId: id
    });

    const targetUserId = created_by_role === 'buyer' ? counterOffer.producer_id : parentOffer.buyer_id;
    emitUserEvent(targetUserId, 'notification', {
      title: 'Counter Offer Received',
      message: `Counter offer: ₹${finalPrice}/unit for ${finalQty} units`,
      listingId: parentOffer.listing_id,
      buyerId: parentOffer.buyer_id
    });

    res.json({
      success: true,
      message: 'Counter offer submitted!',
      offer: counterOffer
    });
  } catch (err) {
    console.error('Error countering offer:', err);
    res.status(500).json({ error: 'Failed to submit counter offer' });
  }
});

// 4. Accept Offer & Auto-Generate Confirmed Order
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { accepted_by_role } = req.body;

    const offerRes = await query(`
      SELECT o.*, l.producer_id, l.title as listing_title, l.unit,
             p.address_text as producer_address, p.name as producer_name, p.phone as producer_phone,
             b.name as buyer_name, b.phone as buyer_phone, b.address_text as buyer_address
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users p ON l.producer_id = p.id
      JOIN users b ON o.buyer_id = b.id
      WHERE o.id = $1
    `, [id]);

    if (offerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const offer = offerRes.rows[0];

    // Update offer status
    await query('UPDATE offers SET status = $1 WHERE id = $2', ['accepted', id]);

    // Create Order automatically
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const totalAmount = parseFloat(offer.quantity) * parseFloat(offer.offered_price_per_unit);

    await query(`
      INSERT INTO orders (
        id, offer_id, listing_id, buyer_id, producer_id,
        final_price_per_unit, final_quantity, total_amount, status, notes, pickup_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', $9, $10)
    `, [
      orderId, id, offer.listing_id, offer.buyer_id, offer.producer_id,
      offer.offered_price_per_unit, offer.quantity, totalAmount,
      `Deal negotiated & accepted on BanaoBecho. Both parties' contact details are now unlocked.`,
      offer.producer_address
    ]);

    // Update deals count
    await query('UPDATE users SET deals_completed = deals_completed + 1 WHERE id = $1 OR id = $2', [
      offer.producer_id, offer.buyer_id
    ]);

    const createdOrderRes = await query(`
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

    const order = createdOrderRes.rows[0];

    // Real-time broadcast
    emitThreadEvent(offer.listing_id, offer.buyer_id, 'offer_accepted', {
      offerId: id,
      order: order
    });

    emitUserEvent(offer.producer_id, 'order_confirmed', { orderId: order.id, message: 'New order confirmed!' });
    emitUserEvent(offer.buyer_id, 'order_confirmed', { orderId: order.id, message: 'Your offer was accepted! Order confirmed.' });

    res.json({
      success: true,
      message: 'Offer accepted! Order successfully created.',
      order: order
    });
  } catch (err) {
    console.error('Error accepting offer:', err);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// 5. Reject Offer
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const offerRes = await query('SELECT * FROM offers WHERE id = $1', [id]);
    if (offerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    const offer = offerRes.rows[0];

    await query('UPDATE offers SET status = $1 WHERE id = $2', ['rejected', id]);

    emitThreadEvent(offer.listing_id, offer.buyer_id, 'offer_rejected', { offerId: id });

    res.json({ success: true, message: 'Offer rejected' });
  } catch (err) {
    console.error('Error rejecting offer:', err);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

// 6. My Offers (Producer incoming or Buyer outgoing)
router.get('/my-offers', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let sql = '';
    let params = [userId];

    if (role === 'buyer') {
      sql = `
        SELECT o.*, 
               l.title as listing_title, l.unit, l.category,
               p.name as producer_name, p.business_name as producer_business_name, p.phone as producer_phone
        FROM offers o
        JOIN listings l ON o.listing_id = l.id
        JOIN users p ON l.producer_id = p.id
        WHERE o.buyer_id = $1
        ORDER BY o.created_at DESC
      `;
    } else {
      // Producer
      sql = `
        SELECT o.*, 
               l.title as listing_title, l.unit, l.category,
               b.name as buyer_name, b.business_name as buyer_business_name, b.phone as buyer_phone
        FROM offers o
        JOIN listings l ON o.listing_id = l.id
        JOIN users b ON o.buyer_id = b.id
        WHERE l.producer_id = $1
        ORDER BY o.created_at DESC
      `;
    }

    const result = await query(sql, params);

    // Group offers by status
    const pending = result.rows.filter(o => o.status === 'pending');
    const accepted = result.rows.filter(o => o.status === 'accepted');
    const rejected = result.rows.filter(o => o.status === 'rejected');
    const countered = result.rows.filter(o => o.status === 'countered');

    res.json({
      success: true,
      all: result.rows,
      grouped: {
        pending,
        accepted,
        rejected,
        countered
      }
    });
  } catch (err) {
    console.error('Error fetching my offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

module.exports = router;
