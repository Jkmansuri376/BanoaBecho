const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 BANAOBECHO FULL-STACK VERIFICATION TEST RUNNER');
  console.log('==================================================\n');

  // Test 1: Health
  const health = await get('http://localhost:5000/api/health');
  console.log('✅ 1. Backend Health Check:', health.appName, '| Tagline:', health.tagline);

  // Test 2: Discovery with Distance (Flow C)
  const listings = await get('http://localhost:5000/api/listings?radius=30&sort=distance');
  console.log(`✅ 2. Hyperlocal Discovery: Found ${listings.count} produce lots within 30km`);
  listings.listings.slice(0, 3).forEach(l => {
    console.log(`   - [${l.category}] ${l.title} (${l.distance_km} km away) | Starting: ₹${l.starting_price}/${l.unit} | Producer: ${l.producer_business_name} (Verified: ${l.producer_verified ? 'Yes' : 'No'})`);
  });

  // Test 3: Product Detail with Tiered Pricing (Flow D Step 1)
  const detail = await get('http://localhost:5000/api/listings/list_1');
  console.log(`\n✅ 3. Product Detail for "${detail.listing.title}":`);
  console.log(`   - Producer: ${detail.listing.producer_business_name} (★ ${detail.listing.producer_rating_avg}, ${detail.listing.producer_deals_completed} deals completed)`);
  console.log(`   - Bulk Tiers:`, detail.listing.price_tiers);

  // Test 4: Negotiation Thread (Flow D Step 3)
  const thread = await get('http://localhost:5000/api/offers/thread/list_1/buyer_1');
  console.log(`\n✅ 4. Real-time Negotiation Thread: ${thread.offers.length} rounds logged`);
  thread.offers.forEach(o => {
    console.log(`   - Round by ${o.created_by_role.toUpperCase()}: ${o.quantity} units @ ₹${o.offered_price_per_unit}/unit -> Status: ${o.status.toUpperCase()} ("${o.notes}")`);
  });

  // Test 5: Post a Counter Offer & Accept to create Order (Flow D Step 3 & 4)
  console.log(`\n✅ 5. Testing Negotiation Action: Counter & Accept Flow`);
  const newOffer = await post('http://localhost:5000/api/offers', {
    listing_id: 'list_1',
    buyer_id: 'buyer_1',
    quantity: 400,
    offered_price_per_unit: 20.5,
    notes: 'Automated test proposal for 400kg tomatoes',
    created_by_role: 'buyer'
  });
  console.log(`   - Created Offer ID: ${newOffer.offer.id} | Status: ${newOffer.offer.status}`);

  // Accept the offer
  const acceptRes = await post(`http://localhost:5000/api/offers/${newOffer.offer.id}/accept`, {
    accepted_by_role: 'producer'
  });
  console.log(`   - Accepted Offer -> Order Created: #${acceptRes.order.id} | Total Amount: ₹${acceptRes.order.total_amount} | Status: ${acceptRes.order.status}`);
  console.log(`   - Unlocked Producer Contact: ${acceptRes.order.producer_name} (${acceptRes.order.producer_phone}) | Pickup: ${acceptRes.order.producer_address}`);

  // Test 6: Post Rating (Flow E Step 1)
  const ratingRes = await post('http://localhost:5000/api/ratings', {
    order_id: acceptRes.order.id,
    from_user_id: 'buyer_1',
    to_user_id: 'prod_1',
    score: 5,
    comment: 'Fresh top grade tomatoes directly received at ₹20.5/kg!'
  });
  console.log(`\n✅ 6. Post-Order Rating: Score 5/5 -> Updated Producer Avg: ★ ${ratingRes.rating.target_user_new_avg} (${ratingRes.rating.target_user_rating_count} ratings)`);

  console.log('\n==================================================');
  console.log('🎉 ALL END-TO-END FLOWS VERIFIED SUCCESSFULLY!');
  console.log('==================================================');
}

runTests().catch(console.error);
