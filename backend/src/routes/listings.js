const express = require('express');
const router = express.Router();
const { query, haversineCalc } = require('../db');

// 1. Discovery & Search Listings with Distance, Categories, Radius, Producer Type, Rating Filters
router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      radius,
      lat,
      lng,
      producer_type,
      min_price,
      max_price,
      min_rating,
      in_stock_only,
      producer_id,
      sort
    } = req.query;

    const buyerLat = lat ? parseFloat(lat) : 18.5362; // Default buyer location (Pune Center)
    const buyerLng = lng ? parseFloat(lng) : 73.8298;

    let sql = `
      SELECT 
        l.*,
        u.name as producer_name,
        u.business_name as producer_business_name,
        u.role as producer_role,
        u.verified as producer_verified,
        u.rating_avg as producer_rating_avg,
        u.rating_count as producer_rating_count,
        u.deals_completed as producer_deals_completed,
        u.location_lat as producer_lat,
        u.location_lng as producer_lng,
        u.address_text as producer_address,
        u.phone as producer_phone
      FROM listings l
      JOIN users u ON l.producer_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (producer_id) {
      params.push(producer_id);
      sql += ` AND l.producer_id = $${params.length}`;
    }

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND LOWER(l.category) = LOWER($${params.length})`;
    }

    if (producer_type && producer_type !== 'All') {
      params.push(producer_type);
      sql += ` AND u.role = $${params.length}`;
    }

    if (in_stock_only === 'true' || in_stock_only === true) {
      sql += ` AND l.availability_status = 'in_stock'`;
    }

    if (min_rating) {
      params.push(parseFloat(min_rating));
      sql += ` AND u.rating_avg >= $${params.length}`;
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      params.push(searchTerm);
      sql += ` AND (LOWER(l.title) LIKE $${params.length} OR LOWER(l.description) LIKE $${params.length} OR LOWER(l.category) LIKE $${params.length} OR LOWER(u.business_name) LIKE $${params.length})`;
    }

    const result = await query(sql, params);
    
    // Process and enrich listing rows (JSON parsing & Distance calculation)
    let processed = result.rows.map(row => {
      let tiers = [];
      try {
        tiers = typeof row.price_tiers === 'string' ? JSON.parse(row.price_tiers) : row.price_tiers;
      } catch (e) {
        tiers = [];
      }

      let photos = [];
      try {
        photos = typeof row.photo_urls === 'string' ? JSON.parse(row.photo_urls) : row.photo_urls;
      } catch (e) {
        photos = [];
      }

      // Calculate starting/base price from tiers
      const prices = tiers.map(t => Number(t.price_per_unit)).filter(p => !isNaN(p));
      const minTierPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxTierPrice = prices.length > 0 ? Math.max(...prices) : 0;

      // Calculate distance in km
      const distance = haversineCalc(buyerLat, buyerLng, row.producer_lat, row.producer_lng);

      return {
        ...row,
        price_tiers: tiers,
        photo_urls: photos,
        starting_price: minTierPrice,
        max_price: maxTierPrice,
        distance_km: distance
      };
    });

    // Distance Radius Filter
    if (radius && radius !== 'all' && !isNaN(parseFloat(radius))) {
      const maxRadiusKm = parseFloat(radius);
      processed = processed.filter(item => item.distance_km <= maxRadiusKm);
    }

    // Price Range Filter
    if (min_price && !isNaN(parseFloat(min_price))) {
      processed = processed.filter(item => item.starting_price >= parseFloat(min_price));
    }
    if (max_price && !isNaN(parseFloat(max_price))) {
      processed = processed.filter(item => item.starting_price <= parseFloat(max_price));
    }

    // Sorting
    if (sort === 'price_asc') {
      processed.sort((a, b) => a.starting_price - b.starting_price);
    } else if (sort === 'price_desc') {
      processed.sort((a, b) => b.starting_price - a.starting_price);
    } else if (sort === 'rating_desc') {
      processed.sort((a, b) => (b.producer_rating_avg || 0) - (a.producer_rating_avg || 0));
    } else if (sort === 'newest') {
      processed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Default: sort by distance (Hyperlocal discovery)
      processed.sort((a, b) => a.distance_km - b.distance_km);
    }

    res.json({
      success: true,
      count: processed.length,
      buyerLocation: { lat: buyerLat, lng: buyerLng },
      listings: processed
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// 2. Single Listing Detail Page
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;
    const buyerLat = lat ? parseFloat(lat) : 18.5362;
    const buyerLng = lng ? parseFloat(lng) : 73.8298;

    const sql = `
      SELECT 
        l.*,
        u.name as producer_name,
        u.business_name as producer_business_name,
        u.role as producer_role,
        u.verified as producer_verified,
        u.certificate_url as producer_certificate_url,
        u.rating_avg as producer_rating_avg,
        u.rating_count as producer_rating_count,
        u.deals_completed as producer_deals_completed,
        u.location_lat as producer_lat,
        u.location_lng as producer_lng,
        u.address_text as producer_address,
        u.phone as producer_phone
      FROM listings l
      JOIN users u ON l.producer_id = u.id
      WHERE l.id = $1
    `;

    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const row = result.rows[0];
    let tiers = [];
    try {
      tiers = typeof row.price_tiers === 'string' ? JSON.parse(row.price_tiers) : row.price_tiers;
    } catch (e) {
      tiers = [];
    }

    let photos = [];
    try {
      photos = typeof row.photo_urls === 'string' ? JSON.parse(row.photo_urls) : row.photo_urls;
    } catch (e) {
      photos = [];
    }

    const distance = haversineCalc(buyerLat, buyerLng, row.producer_lat, row.producer_lng);

    // Also fetch reviews for this producer
    const reviewsRes = await query(`
      SELECT r.*, u.name as reviewer_name, u.business_name as reviewer_business_name
      FROM ratings r
      JOIN users u ON r.from_user_id = u.id
      WHERE r.to_user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [row.producer_id]);

    res.json({
      success: true,
      listing: {
        ...row,
        price_tiers: tiers,
        photo_urls: photos,
        distance_km: distance,
        reviews: reviewsRes.rows
      }
    });
  } catch (err) {
    console.error('Error fetching listing detail:', err);
    res.status(500).json({ error: 'Failed to fetch listing detail' });
  }
});

// 3. Create New Listing (Producer)
router.post('/', async (req, res) => {
  try {
    const {
      producer_id,
      title,
      category,
      description,
      photo_urls,
      quantity_available,
      unit,
      price_tiers,
      availability_status
    } = req.body;

    if (!producer_id || !title || !category || !quantity_available || !unit || !price_tiers) {
      return res.status(400).json({ error: 'Missing required listing fields' });
    }

    const listingId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const photosJson = JSON.stringify(photo_urls || []);
    const tiersJson = typeof price_tiers === 'string' ? price_tiers : JSON.stringify(price_tiers);
    const status = availability_status || 'in_stock';

    await query(`
      INSERT INTO listings (
        id, producer_id, title, category, description, photo_urls,
        quantity_available, unit, price_tiers, availability_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      listingId, producer_id, title, category, description || '', photosJson,
      parseFloat(quantity_available), unit, tiersJson, status
    ]);

    const newListing = await query('SELECT * FROM listings WHERE id = $1', [listingId]);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully!',
      listing: newListing.rows[0]
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// 4. Update Listing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      photo_urls,
      quantity_available,
      unit,
      price_tiers,
      availability_status
    } = req.body;

    const current = await query('SELECT * FROM listings WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const existing = current.rows[0];
    const newTitle = title !== undefined ? title : existing.title;
    const newCategory = category !== undefined ? category : existing.category;
    const newDesc = description !== undefined ? description : existing.description;
    const newPhotos = photo_urls !== undefined ? JSON.stringify(photo_urls) : existing.photo_urls;
    const newQty = quantity_available !== undefined ? parseFloat(quantity_available) : existing.quantity_available;
    const newUnit = unit !== undefined ? unit : existing.unit;
    const newTiers = price_tiers !== undefined ? (typeof price_tiers === 'string' ? price_tiers : JSON.stringify(price_tiers)) : existing.price_tiers;
    const newStatus = availability_status !== undefined ? availability_status : existing.availability_status;

    await query(`
      UPDATE listings SET
        title = $1,
        category = $2,
        description = $3,
        photo_urls = $4,
        quantity_available = $5,
        unit = $6,
        price_tiers = $7,
        availability_status = $8,
        updated_at = datetime('now')
      WHERE id = $9
    `, [newTitle, newCategory, newDesc, newPhotos, newQty, newUnit, newTiers, newStatus, id]);

    res.json({ success: true, message: 'Listing updated successfully' });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// 5. Delete Listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM listings WHERE id = $1', [id]);
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
