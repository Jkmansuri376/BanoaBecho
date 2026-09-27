# 🌱 BanaoBecho — Hyperlocal B2B Marketplace

> **Tagline:** *"Banao, Becho, Seedha — apna maal seedha bulk buyer tak"*
> **Mission:** Connecting local producers (manufacturers/artisans, small farmers, and large farmers/FPOs) directly with bulk buyers (restaurants, retailers, wholesalers), removing distributor middlemen through direct listing, discovery, and price negotiation.

---

## 🚀 Key Features Built

1. **Producer Onboarding & Direct Listing (Flow A)**
   - Role selection: Small Farmer, Large Farmer / FPO, Manufacturer / Artisan
   - Mobile Phone + OTP Verification (logged to console & prototype helper banner)
   - Hyperlocal GPS Coordinate / Map Cluster Pinning
   - Dynamic Bulk Volume Price Tiers Builder (e.g. 50kg, 200kg, 500kg+)
   - Optional ID / FPO certificate upload with **"Verified Producer"** trust badge

2. **Buyer Onboarding & Hyperlocal Discovery (Flow B & C)**
   - Business type registration (Restaurant, Retailer, Wholesaler)
   - Preferred sourcing categories selection
   - Hyperlocal distance radius filtering (5 km, 15 km, 30 km) with PostGIS / Haversine formula
   - Keyword search across product title, category, description, and producer name
   - Filter chips: Category, Producer Type, Rating (4.0+, 4.5+), In-Stock Only
   - Sort dropdown: Distance (nearest first), Price (low/high), Rating, Newest

3. **Product Detail & Dual Purchase Paths (Flow D)**
   - High-res photo gallery & full bulk pricing comparison table
   - Producer profile card: Verified badge, "X deals completed", distance in km
   - **Path 1: "Send Custom Offer"** — propose custom price/qty and initiate live negotiation
   - **Path 2: "Buy Now at Listed Price"** — instant checkout matching exact volume price tier

4. **Real-Time Negotiation Engine with Socket.io (Flow D Step 3 & 4)**
   - Chat-style thread showing full negotiation history (Offer ➔ Counter ➔ Accept / Reject)
   - Live real-time updates via Socket.io rooms without page refresh
   - Dynamic counter-offer modal with instant total commitment calculation
   - Deal acceptance creates confirmed order, triggers confetti celebration, and unlocks contact info

5. **Order Confirmation & Contact Unlock (Flow D Step 4 & Flow E)**
   - Unlocked direct phone call & pickup coordinates for transport coordination
   - Status progression tracker: Confirmed ➔ Picked Up ➔ Completed
   - 1-Click **"Repeat Order"** shortcut pre-filling same terms
   - Post-order 5-Star rating modal rolling up into average user rating

6. **1-Click Demo Persona Switcher**
   - Floating header banner to switch effortlessly between Farmer, FPO, Manufacturer, and Restaurant/Supermarket personas for instant testing.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Vite), Tailwind CSS (Warm Green `#2F6B4F` + Mustard/Ochre `#D9A441`), Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, REST API
- **Real-Time:** Socket.io (negotiation threads & live notifications)
- **Database:** PostgreSQL with PostGIS support & automatic embedded WebAssembly SQLite fallback with Haversine distance calculations
- **Auth:** Mobile Phone + OTP verification service

---

## 🏃 Running Locally

### 1. Install all dependencies:
```bash
npm run install:all
```

### 2. Seed Database with Realistic Data (Pune Agro Cluster):
```bash
npm run seed
```

### 3. Run Frontend & Backend Concurrently:
```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

---

## 🌾 Demo Accounts (Pre-Seeded)

| Persona | Role | Business Name | Produce / Requirements | Phone |
|---|---|---|---|---|
| **Ramesh Patil** | Small Farmer | Sahyadri Organic Farm | Farm-Fresh Tomatoes | `+919876543210` |
| **Kisan Vikas FPO** | Large FPO | Western Ghats FPO | Indrayani Aromatic Rice | `+919876543211` |
| **Sunita Deshmukh** | Manufacturer | Gauri Handloom Works | Organic Cotton Table Linens | `+919876543212` |
| **Dnyaneshwar Shinde** | Small Farmer | Krishna Valley Dairy | Gir Cow A2 Desi Ghee | `+919876543213` |
| **Balaji Jadhav** | Manufacturer | Deccan Spice Millers | Pure Salem Turmeric & Chillies | `+919876543214` |
| **Chef Vikram Malhotra** | Bulk Buyer | Spice Route Fine Dine | Restaurant Sourcing (Veg/Dairy) | `+919876543220` |
| **Pradeep Goyal** | Bulk Buyer | Goyal Supermarket Chain | Retail Shelves (Grains/Spices) | `+919876543221` |
| **Manoj Agarwal** | Bulk Buyer | Manoj Traders & Mart | Mandi Bulk Lots | `+919876543222` |

---

## 🗺️ Database Tables (PostgreSQL / SQLite)

1. `users` — id, role, name, business_name, phone, location_lat, location_lng, address_text, verified, certificate_url, rating_avg, rating_count, deals_completed
2. `listings` — id, producer_id, title, category, description, photo_urls, quantity_available, unit, price_tiers (JSONB), availability_status
3. `offers` — id, listing_id, buyer_id, parent_offer_id, quantity, offered_price_per_unit, notes, status, created_by_role
4. `orders` — id, offer_id, listing_id, buyer_id, producer_id, final_price_per_unit, final_quantity, total_amount, status, pickup_address
5. `ratings` — id, order_id, from_user_id, to_user_id, score (1–5), comment

---

## 🔮 Future Scope (Roadmap)
- Integrated escrow payment milestone gateway (UPI / Bank Transfer)
- Multi-truck freight dispatch & live GPS driver tracking
- Government API integration for automated FPO & Aadhaar KYC
- Multilingual voice search in regional languages (Hindi, Marathi, Telugu, Tamil, Kannada)
