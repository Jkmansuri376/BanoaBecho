const express = require('express');
const router = express.Router();
const { query } = require('../db');

// 1. Submit Rating for Order
router.post('/', async (req, res) => {
  try {
    const { order_id, from_user_id, to_user_id, score, comment } = req.body;

    if (!order_id || !from_user_id || !to_user_id || !score) {
      return res.status(400).json({ error: 'order_id, from_user_id, to_user_id, and score (1-5) are required' });
    }

    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 1 || numScore > 5) {
      return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
    }

    // Check if already rated by this user
    const existing = await query(
      'SELECT id FROM ratings WHERE order_id = $1 AND from_user_id = $2',
      [order_id, from_user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a rating for this order.' });
    }

    const ratingId = `rat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    await query(`
      INSERT INTO ratings (id, order_id, from_user_id, to_user_id, score, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [ratingId, order_id, from_user_id, to_user_id, numScore, comment || '']);

    // Recompute target user's average rating and count
    const statsRes = await query(`
      SELECT AVG(score) as new_avg, COUNT(score) as total_count 
      FROM ratings 
      WHERE to_user_id = $1
    `, [to_user_id]);

    const newAvg = parseFloat(statsRes.rows[0].new_avg || numScore).toFixed(1);
    const totalCount = parseInt(statsRes.rows[0].total_count || 1, 10);

    await query(`
      UPDATE users 
      SET rating_avg = $1, rating_count = $2 
      WHERE id = $3
    `, [parseFloat(newAvg), totalCount, to_user_id]);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: {
        id: ratingId,
        score: numScore,
        comment,
        target_user_new_avg: parseFloat(newAvg),
        target_user_rating_count: totalCount
      }
    });
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// 2. Fetch User Reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(`
      SELECT r.*, u.name as reviewer_name, u.business_name as reviewer_business_name, u.role as reviewer_role
      FROM ratings r
      JOIN users u ON r.from_user_id = u.id
      WHERE r.to_user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      reviews: result.rows
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
