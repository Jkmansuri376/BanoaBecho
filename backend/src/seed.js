const { initDb, query, getDbType } = require('./db');

async function seed() {
  console.log('🌱 Initializing Database for Seeding...');
  initDb();

  // Clear existing data in correct order
  console.log('🧹 Cleaning old data...');
  try {
    await query('DELETE FROM ratings');
    await query('DELETE FROM orders');
    await query('DELETE FROM offers');
    await query('DELETE FROM listings');
    await query('DELETE FROM users');
  } catch (err) {
    console.log('Tables ready for new seed.');
  }

  console.log('👥 Inserting Users (Producers & Buyers)...');

  // Base coordinate: Pune Agri-Industrial Cluster (18.5204, 73.8567)
  const users = [
    // --- PRODUCERS ---
    {
      id: 'prod_1',
      role: 'farmer_small',
      name: 'Ramesh Patil',
      business_name: 'Sahyadri Organic Farm',
      phone: '+919876543210',
      location_lat: 18.5312,
      location_lng: 73.8445,
      address_text: 'Shivajinagar Agri Zone, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Vegetables',
      rating_avg: 4.8,
      rating_count: 24,
      deals_completed: 18
    },
    {
      id: 'prod_2',
      role: 'farmer_large_fpo',
      name: 'Kisan Vikas FPO (Anand Rao)',
      business_name: 'Western Ghats Farmers Producer Co.',
      phone: '+919876543211',
      location_lat: 18.5793,
      location_lng: 73.7428,
      address_text: 'Hinjawadi Agro Cluster, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Grains',
      rating_avg: 4.9,
      rating_count: 56,
      deals_completed: 42
    },
    {
      id: 'prod_3',
      role: 'manufacturer',
      name: 'Sunita Deshmukh',
      business_name: 'Gauri Handloom & Khadi Works',
      phone: '+919876543212',
      location_lat: 18.4982,
      location_lng: 73.8576,
      address_text: 'Swargate Artisan Colony, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Textile',
      rating_avg: 4.7,
      rating_count: 15,
      deals_completed: 11
    },
    {
      id: 'prod_4',
      role: 'farmer_small',
      name: 'Dnyaneshwar Shinde',
      business_name: 'Krishna Valley Pure Dairy',
      phone: '+919876543213',
      location_lat: 18.4578,
      location_lng: 73.8821,
      address_text: 'Katraj Milk Belt, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Dairy',
      rating_avg: 4.6,
      rating_count: 19,
      deals_completed: 15
    },
    {
      id: 'prod_5',
      role: 'manufacturer',
      name: 'Balaji Jadhav',
      business_name: 'Deccan Spice Millers & Grinders',
      phone: '+919876543214',
      location_lat: 18.5089,
      location_lng: 73.9254,
      address_text: 'Hadapsar Industrial Estate, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Spices',
      rating_avg: 4.9,
      rating_count: 38,
      deals_completed: 29
    },
    {
      id: 'prod_6',
      role: 'farmer_large_fpo',
      name: 'Bhimashankar FPO (Suresh Ghadge)',
      business_name: 'Bhimashankar Onion & Potato Grower Fed.',
      phone: '+919876543215',
      location_lat: 18.6278,
      location_lng: 73.8132,
      address_text: 'Bhosari Agri Mandi Bypass, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Vegetables',
      rating_avg: 4.5,
      rating_count: 31,
      deals_completed: 22
    },
    {
      id: 'prod_7',
      role: 'manufacturer',
      name: 'Meera Kulkarni',
      business_name: 'Mitti Kala Terracotta Handicrafts',
      phone: '+919876543216',
      location_lat: 18.5204,
      location_lng: 73.8567,
      address_text: 'Camp Artisan Market, Pune, Maharashtra',
      verified: 0,
      certificate_url: null,
      producer_category: 'Handicraft',
      rating_avg: 4.4,
      rating_count: 12,
      deals_completed: 8
    },
    {
      id: 'prod_8',
      role: 'farmer_small',
      name: 'Santosh Gaikwad',
      business_name: 'Gaikwad Alphonso & Pomegranate Orchards',
      phone: '+919876543217',
      location_lat: 18.5642,
      location_lng: 73.9145,
      address_text: 'Viman Nagar Green Belt, Pune, Maharashtra',
      verified: 1,
      certificate_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60',
      producer_category: 'Vegetables',
      rating_avg: 4.9,
      rating_count: 45,
      deals_completed: 36
    },

    // --- BUYERS ---
    {
      id: 'buyer_1',
      role: 'buyer',
      name: 'Chef Vikram Malhotra',
      business_name: 'Spice Route Fine Dine & Banquet',
      phone: '+919876543220',
      location_lat: 18.5362,
      location_lng: 73.8298,
      address_text: 'Koregaon Park Main Road, Pune, Maharashtra',
      verified: 1,
      certificate_url: null,
      preferred_categories: JSON.stringify(['Vegetables', 'Dairy', 'Spices']),
      rating_avg: 4.9,
      rating_count: 18,
      deals_completed: 18
    },
    {
      id: 'buyer_2',
      role: 'buyer',
      name: 'Pradeep Goyal',
      business_name: 'Goyal Supermarket Chain (5 Outlets)',
      phone: '+919876543221',
      location_lat: 18.5122,
      location_lng: 73.8415,
      address_text: 'Deccan Gymkhana Retail Row, Pune, Maharashtra',
      verified: 1,
      certificate_url: null,
      preferred_categories: JSON.stringify(['Grains', 'Vegetables', 'Spices', 'Textile']),
      rating_avg: 4.7,
      rating_count: 32,
      deals_completed: 28
    },
    {
      id: 'buyer_3',
      role: 'buyer',
      name: 'Manoj Agarwal',
      business_name: 'Manoj Traders & Wholesale Mart',
      phone: '+919876543222',
      location_lat: 18.5611,
      location_lng: 73.7820,
      address_text: 'Aundh Wholesale Yard, Pune, Maharashtra',
      verified: 1,
      certificate_url: null,
      preferred_categories: JSON.stringify(['Grains', 'Dairy', 'Handicraft']),
      rating_avg: 4.8,
      rating_count: 22,
      deals_completed: 20
    }
  ];

  for (const u of users) {
    await query(`
      INSERT INTO users (
        id, role, name, business_name, phone, location_lat, location_lng, address_text,
        verified, certificate_url, producer_category, preferred_categories, rating_avg, rating_count, deals_completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      u.id, u.role, u.name, u.business_name, u.phone, u.location_lat, u.location_lng, u.address_text,
      u.verified, u.certificate_url, u.producer_category || null, u.preferred_categories || null,
      u.rating_avg, u.rating_count, u.deals_completed
    ]);
  }

  console.log('📦 Inserting Sample Listings with Bulk Price Tiers...');

  const listings = [
    {
      id: 'list_1',
      producer_id: 'prod_1',
      title: 'Farm-Fresh Hydroponic & Field Tomatoes (Grade A)',
      category: 'Vegetables',
      description: 'Naturally ripened, zero chemical pesticide, harvested every morning at dawn. High shelf life of 8-10 days, ideal for restaurants and supermarkets.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 2400,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 50, max_qty: 199, price_per_unit: 26 },
        { min_qty: 200, max_qty: 499, price_per_unit: 22 },
        { min_qty: 500, max_qty: 2500, price_per_unit: 18 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_2',
      producer_id: 'prod_2',
      title: 'Indrayani Fragrant Raw Rice (Single-Origin Unpolished)',
      category: 'Grains',
      description: 'Authentic Maval Indrayani aromatic rice directly from FPO member farmers. Cleaned, destoned, moisture tested under 12%. Packaged in 25kg/50kg gunny bags.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 15000,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 250, max_qty: 999, price_per_unit: 58 },
        { min_qty: 1000, max_qty: 4999, price_per_unit: 52 },
        { min_qty: 5000, max_qty: 20000, price_per_unit: 46 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_3',
      producer_id: 'prod_4',
      title: 'Pure Gir Cow A2 Desi Ghee (Bilona Method)',
      category: 'Dairy',
      description: 'Traditional slow-cooked bilona churned A2 cow ghee. Made from grass-fed indigenous cows. Lab tested purity certificate provided with every bulk lot.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 450,
      unit: 'litres',
      price_tiers: JSON.stringify([
        { min_qty: 10, max_qty: 49, price_per_unit: 1450 },
        { min_qty: 50, max_qty: 99, price_per_unit: 1300 },
        { min_qty: 100, max_qty: 500, price_per_unit: 1180 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_4',
      producer_id: 'prod_5',
      title: 'Salem Finger Turmeric Powder (Curcumin 4.2%+)',
      category: 'Spices',
      description: 'Directly milled unadulterated bright turmeric powder with high natural curcumin content. Cold pulverised to retain essential oils.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 3200,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 50, max_qty: 199, price_per_unit: 190 },
        { min_qty: 200, max_qty: 799, price_per_unit: 165 },
        { min_qty: 800, max_qty: 4000, price_per_unit: 145 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_5',
      producer_id: 'prod_3',
      title: 'Handloom Organic Cotton Table Linen & Apron Set',
      category: 'Textile',
      description: '100% natural dyed handloom cotton restaurant grade linens, napkins, and chef aprons. Heavy duty stitching tailored for hospitality bulk orders.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 1200,
      unit: 'pieces',
      price_tiers: JSON.stringify([
        { min_qty: 50, max_qty: 199, price_per_unit: 220 },
        { min_qty: 200, max_qty: 499, price_per_unit: 185 },
        { min_qty: 500, max_qty: 1500, price_per_unit: 155 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_6',
      producer_id: 'prod_6',
      title: 'Nashik Red Onions (Medium-Large Size, High Dryness)',
      category: 'Vegetables',
      description: 'Export quality cured Nashik red onions directly sourced from grower members. Well dried skin with long storage stability. 50kg ventilated mesh bags.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 35000,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 500, max_qty: 1999, price_per_unit: 22 },
        { min_qty: 2000, max_qty: 9999, price_per_unit: 19 },
        { min_qty: 10000, max_qty: 50000, price_per_unit: 16 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_7',
      producer_id: 'prod_7',
      title: 'Artisan Terracotta Kulhads & Biryani Handis (Kiln Fired)',
      category: 'Handicraft',
      description: 'Traditional red clay pots, tea kulhads, and slow-cooking biryani handis. Machine smoothed rim, food safe, ideal for catering & hotel presentation.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 5000,
      unit: 'pieces',
      price_tiers: JSON.stringify([
        { min_qty: 200, max_qty: 799, price_per_unit: 9 },
        { min_qty: 800, max_qty: 2499, price_per_unit: 7.5 },
        { min_qty: 2500, max_qty: 10000, price_per_unit: 6 }
      ]),
      availability_status: 'in_stock'
    },
    {
      id: 'list_8',
      producer_id: 'prod_8',
      title: 'Export Grade Bhagwa Pomegranates (Deep Ruby Arils)',
      category: 'Vegetables',
      description: 'Freshly harvested sweet and soft seeded Bhagwa pomegranates (250g+ fruit weight). High juice yield and vibrant color for retail counters.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 4800,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 100, max_qty: 399, price_per_unit: 110 },
        { min_qty: 400, max_qty: 999, price_per_unit: 95 },
        { min_qty: 1000, max_qty: 5000, price_per_unit: 82 }
      ]),
      availability_status: 'seasonal'
    },
    {
      id: 'list_9',
      producer_id: 'prod_5',
      title: 'Byadagi & Guntur Stemless Red Chilli Bulk Pack',
      category: 'Spices',
      description: 'Deep red color, moderate pungency Byadagi chillies combined with hot Guntur peppers. Cleaned, moisture controlled, zero broken stems.',
      photo_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
      ]),
      quantity_available: 2100,
      unit: 'kg',
      price_tiers: JSON.stringify([
        { min_qty: 50, max_qty: 199, price_per_unit: 280 },
        { min_qty: 200, max_qty: 599, price_per_unit: 250 },
        { min_qty: 600, max_qty: 3000, price_per_unit: 225 }
      ]),
      availability_status: 'in_stock'
    }
  ];

  for (const l of listings) {
    await query(`
      INSERT INTO listings (
        id, producer_id, title, category, description, photo_urls,
        quantity_available, unit, price_tiers, availability_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      l.id, l.producer_id, l.title, l.category, l.description, l.photo_urls,
      l.quantity_available, l.unit, l.price_tiers, l.availability_status
    ]);
  }

  console.log('🤝 Inserting Sample Negotiation Offers & Live Threads...');

  // Thread 1: Buyer 1 (Spice Route) negotiating on Tomatoes with Ramesh Patil (Prod 1)
  const offers = [
    {
      id: 'off_1',
      listing_id: 'list_1',
      buyer_id: 'buyer_1',
      parent_offer_id: null,
      quantity: 300,
      offered_price_per_unit: 19.5,
      notes: 'Namaste Ramesh ji. We need 300kg weekly for our 3 restaurant branches. Can you do ₹19.5/kg for steady weekly supply?',
      status: 'countered',
      created_by_role: 'buyer'
    },
    {
      id: 'off_2',
      listing_id: 'list_1',
      buyer_id: 'buyer_1',
      parent_offer_id: 'off_1',
      quantity: 300,
      offered_price_per_unit: 21.0,
      notes: 'Namaste Chef Vikram. Listed tier is ₹22/kg for 300kg. As a regular partner, I can do ₹21.0/kg delivered at morning 6 AM.',
      status: 'pending',
      created_by_role: 'producer'
    },
    // Thread 2: Buyer 2 (Goyal Supermarket) negotiating on Indrayani Rice with FPO (Prod 2)
    {
      id: 'off_3',
      listing_id: 'list_2',
      buyer_id: 'buyer_2',
      parent_offer_id: null,
      quantity: 2000,
      offered_price_per_unit: 48.0,
      notes: 'Looking for 2000kg for retail packaging. Please confirm if moisture is below 11.5%. Offering ₹48/kg.',
      status: 'accepted',
      created_by_role: 'buyer'
    },
    // Thread 3: Buyer 1 negotiating on Ghee with Krishna Valley Dairy (Prod 4)
    {
      id: 'off_4',
      listing_id: 'list_3',
      buyer_id: 'buyer_1',
      parent_offer_id: null,
      quantity: 50,
      offered_price_per_unit: 1250,
      notes: 'Require 50 litres A2 Cow Ghee for our signature sweet dishes.',
      status: 'accepted',
      created_by_role: 'buyer'
    }
  ];

  for (const o of offers) {
    await query(`
      INSERT INTO offers (
        id, listing_id, buyer_id, parent_offer_id, quantity, offered_price_per_unit, notes, status, created_by_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      o.id, o.listing_id, o.buyer_id, o.parent_offer_id, o.quantity, o.offered_price_per_unit, o.notes, o.status, o.created_by_role
    ]);
  }

  console.log('📜 Inserting Orders & Post-Order Ratings...');

  const orders = [
    {
      id: 'ord_1',
      offer_id: 'off_3',
      listing_id: 'list_2',
      buyer_id: 'buyer_2',
      producer_id: 'prod_2',
      final_price_per_unit: 48.0,
      final_quantity: 2000,
      total_amount: 96000,
      status: 'completed',
      notes: 'Direct farm pickup from Hinjawadi Hub. 2000kg Indrayani Rice loaded onto Goyal transport.',
      pickup_address: 'Western Ghats FPO Warehouse #4, Hinjawadi Agro Hub, Pune'
    },
    {
      id: 'ord_2',
      offer_id: 'off_4',
      listing_id: 'list_3',
      buyer_id: 'buyer_1',
      producer_id: 'prod_4',
      final_price_per_unit: 1250,
      final_quantity: 50,
      total_amount: 62500,
      status: 'confirmed',
      notes: 'Freshly packed in food-grade tin containers. Delivery schedule: Tomorrow morning 8 AM.',
      pickup_address: 'Krishna Valley Dairy Hub, Katraj, Pune'
    }
  ];

  for (const ord of orders) {
    await query(`
      INSERT INTO orders (
        id, offer_id, listing_id, buyer_id, producer_id, final_price_per_unit, final_quantity, total_amount, status, notes, pickup_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      ord.id, ord.offer_id, ord.listing_id, ord.buyer_id, ord.producer_id, ord.final_price_per_unit, ord.final_quantity, ord.total_amount, ord.status, ord.notes, ord.pickup_address
    ]);
  }

  const ratings = [
    {
      id: 'rat_1',
      order_id: 'ord_1',
      from_user_id: 'buyer_2',
      to_user_id: 'prod_2',
      score: 5,
      comment: 'Superb quality Indrayani rice! Fresh aroma, moisture was strictly as committed. Saved 18% compared to APMC middleman rates.'
    },
    {
      id: 'rat_2',
      order_id: 'ord_1',
      from_user_id: 'prod_2',
      to_user_id: 'buyer_2',
      score: 5,
      comment: 'Excellent buyer. Goyal Supermarket vehicle arrived right on time for pickup, instant payment clearance.'
    }
  ];

  for (const r of ratings) {
    await query(`
      INSERT INTO ratings (
        id, order_id, from_user_id, to_user_id, score, comment
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      r.id, r.order_id, r.from_user_id, r.to_user_id, r.score, r.comment
    ]);
  }

  console.log('✅ BanaoBecho Database seeded successfully with realistic data!');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
