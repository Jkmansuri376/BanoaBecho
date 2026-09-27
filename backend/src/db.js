const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

let dbType = 'sqlite'; // 'postgres' or 'sqlite'
let sqlJsDb = null;
let pgPool = null;
const dbFilePath = path.join(__dirname, '..', 'banaobecho_data.sqlite');

// Register custom Haversine distance function in SQLite
function haversineCalc(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999999;
  const toRad = (x) => (Number(x) * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Save SQLite database to disk
function saveDbToDisk() {
  if (sqlJsDb) {
    try {
      const data = sqlJsDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbFilePath, buffer);
    } catch (err) {
      console.error('Error saving SQLite DB to disk:', err.message);
    }
  }
}

async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      const { Pool } = require('pg');
      pgPool = new Pool({ connectionString });
      dbType = 'postgres';
      console.log('🌱 Connected to PostgreSQL database');
      await createTablesPostgres();
      return;
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection failed, falling back to embedded SQLite:', err.message);
    }
  }

  // Fallback to sql.js (WebAssembly SQLite)
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  // Register custom Haversine function
  sqlJsDb.create_function('haversine_distance', haversineCalc);
  dbType = 'sqlite';
  console.log('🌱 Connected to embedded SQLite (sql.js) database at', dbFilePath);

  createTablesSqlite();
}

function createTablesSqlite() {
  sqlJsDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('manufacturer','farmer_small','farmer_large_fpo','buyer')),
      name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      otp_code TEXT,
      otp_expires_at TEXT,
      location_lat REAL,
      location_lng REAL,
      address_text TEXT,
      verified INTEGER DEFAULT 0,
      certificate_url TEXT,
      preferred_categories TEXT,
      producer_category TEXT,
      rating_avg REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      deals_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      producer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      photo_urls TEXT,
      quantity_available REAL NOT NULL,
      unit TEXT NOT NULL,
      price_tiers TEXT NOT NULL,
      availability_status TEXT DEFAULT 'in_stock' CHECK(availability_status IN ('in_stock','seasonal','pre_order','sold_out')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      parent_offer_id TEXT,
      quantity REAL NOT NULL,
      offered_price_per_unit REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','countered')),
      created_by_role TEXT DEFAULT 'buyer',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      offer_id TEXT,
      listing_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      producer_id TEXT NOT NULL,
      final_price_per_unit REAL NOT NULL,
      final_quantity REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed','picked_up','completed','cancelled')),
      notes TEXT,
      pickup_address TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (listing_id) REFERENCES listings(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (producer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
  `);
  saveDbToDisk();
}

async function createTablesPostgres() {
  await pgPool.query(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('manufacturer','farmer_small','farmer_large_fpo','buyer');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE listing_status AS ENUM ('in_stock','seasonal','pre_order','sold_out');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE offer_status AS ENUM ('pending','accepted','rejected','countered');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE order_status AS ENUM ('confirmed','picked_up','completed','cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT,
      otp_code VARCHAR(10),
      otp_expires_at TIMESTAMP,
      location_lat DOUBLE PRECISION,
      location_lng DOUBLE PRECISION,
      address_text TEXT,
      verified BOOLEAN DEFAULT FALSE,
      certificate_url TEXT,
      preferred_categories TEXT,
      producer_category VARCHAR(100),
      rating_avg DOUBLE PRECISION DEFAULT 0,
      rating_count INT DEFAULT 0,
      deals_completed INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      producer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      photo_urls TEXT,
      quantity_available DOUBLE PRECISION NOT NULL,
      unit VARCHAR(50) NOT NULL,
      price_tiers JSONB NOT NULL,
      availability_status VARCHAR(50) DEFAULT 'in_stock',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      listing_id TEXT REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      parent_offer_id TEXT,
      quantity DOUBLE PRECISION NOT NULL,
      offered_price_per_unit DOUBLE PRECISION NOT NULL,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_by_role VARCHAR(50) DEFAULT 'buyer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      offer_id TEXT,
      listing_id TEXT REFERENCES listings(id),
      buyer_id TEXT REFERENCES users(id),
      producer_id TEXT REFERENCES users(id),
      final_price_per_unit DOUBLE PRECISION NOT NULL,
      final_quantity DOUBLE PRECISION NOT NULL,
      total_amount DOUBLE PRECISION NOT NULL,
      status VARCHAR(50) DEFAULT 'confirmed',
      notes TEXT,
      pickup_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      from_user_id TEXT REFERENCES users(id),
      to_user_id TEXT REFERENCES users(id),
      score INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Universal Query Helper
async function query(sql, params = []) {
  if (dbType === 'sqlite') {
    if (!sqlJsDb) {
      await initDb();
    }
    // Convert Postgres-style $1, $2 to SQLite ?
    let sqliteSql = sql.replace(/\$(\d+)/g, '?');
    const trimmed = sqliteSql.trim();

    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH')) {
      const stmt = sqlJsDb.prepare(sqliteSql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return { rows, rowCount: rows.length };
    } else {
      sqlJsDb.run(sqliteSql, params);
      saveDbToDisk();
      return { rows: [], rowCount: 1 };
    }
  } else {
    return await pgPool.query(sql, params);
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDb,
  query,
  getDbType,
  haversineCalc
};
