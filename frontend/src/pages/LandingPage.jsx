import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI } from '../utils/api';
import ListingCard from '../components/ListingCard';
import { 
  ArrowRight, 
  Store, 
  ShoppingBag, 
  MapPin, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Users,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Vegetables', icon: '🥦', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'Grains', icon: '🌾', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Dairy', icon: '🥛', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Spices', icon: '🌶️', color: 'bg-red-50 text-red-800 border-red-200' },
  { name: 'Handicraft', icon: '🏺', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { name: 'Textile', icon: '🧵', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' }
];

export default function LandingPage() {
  const { currentUser, isProducer, isBuyer } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const loadListings = async () => {
      try {
        const res = await listingsAPI.getAll({
          radius: '30',
          in_stock_only: false
        });
        if (res.data?.listings) {
          setFeaturedListings(res.data.listings.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured listings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const filteredListings = activeCategory === 'All'
    ? featuredListings
    : featuredListings.filter(l => l.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-850 to-brand-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b-4 border-ochre-500">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d9a441_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-800/90 border border-brand-700/80 text-ochre-400 text-xs font-bold tracking-wide shadow-sm animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-ochre-400" />
            <span>Hyperlocal Direct B2B Marketplace • Zero Distributor Cut</span>
          </div>

          {/* Main Hero Line */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.15]">
            Banao, Becho, Seedha — <br className="hidden sm:inline" />
            <span className="text-ochre-400 drop-shadow-sm">apna maal seedha bulk buyer tak</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-brand-100/90 leading-relaxed font-normal">
            Connect local manufacturers, small farmers, and FPOs directly with restaurants, supermarkets, and wholesale buyers. No middleman margins. Transparent tiered bulk pricing and real-time live price negotiation.
          </p>

          {/* DUAL ONBOARDING CTAs (Flow A Step 1) */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* CTA 1: Producer */}
            <Link
              to="/register/producer"
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border-2 border-ochre-400/60 hover:border-ochre-400 transition-all duration-300 text-left group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  <span className="text-xs font-bold text-ochre-300 uppercase tracking-wider">For Producers</span>
                </div>
                <div className="text-lg font-bold font-display text-white group-hover:text-ochre-300 transition">
                  I am a Producer (Banao)
                </div>
                <p className="text-[11px] text-brand-200">
                  Direct listing with bulk price tiers & live counter-offers.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-ochre-400 group-hover:translate-x-1 transition" />
            </Link>

            {/* CTA 2: Buyer */}
            <Link
              to="/register/buyer"
              className="p-5 rounded-2xl bg-ochre-500 hover:bg-ochre-400 transition-all duration-300 text-brand-950 text-left group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛒</span>
                  <span className="text-xs font-extrabold text-brand-900 uppercase tracking-wider">For Bulk Buyers</span>
                </div>
                <div className="text-lg font-extrabold font-display text-brand-950 group-hover:text-brand-900 transition">
                  I am a Buyer (Khareedo)
                </div>
                <p className="text-[11px] text-brand-900 font-medium">
                  Discover local producers within 5-30km & save 15-30%.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-brand-950 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-brand-800/80 max-w-4xl mx-auto">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-ochre-400 font-display">0%</div>
              <div className="text-[11px] text-brand-200 uppercase tracking-wider font-semibold">Middleman Commission</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">5–30 km</div>
              <div className="text-[11px] text-brand-200 uppercase tracking-wider font-semibold">Hyperlocal Radius</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-ochre-400 font-display">Live</div>
              <div className="text-[11px] text-brand-200 uppercase tracking-wider font-semibold">Socket Negotiation</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">100%</div>
              <div className="text-[11px] text-brand-200 uppercase tracking-wider font-semibold">Direct Contact Unlock</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-gray-900">
              Direct Sourcing Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Bulk produce and artisan goods directly from verified local clusters.
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
          >
            Explore All Produce <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/search?category=${cat.name}`}
              className={`p-4 rounded-2xl border text-center transition hover:shadow-md hover:scale-105 flex flex-col items-center justify-center gap-2 ${cat.color}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-extrabold font-display">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW BANAOBECHO WORKS (THE 4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-earth-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
              The Direct Highway
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 mt-2">
              How BanaoBecho Eliminates Middlemen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow">
                1
              </div>
              <h3 className="font-bold text-sm text-gray-900 font-display mb-1">Direct Producer Listing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Producers define tiered volume price rates (e.g. 50kg, 200kg, 500kg+) with real farm/factory photos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow">
                2
              </div>
              <h3 className="font-bold text-sm text-gray-900 font-display mb-1">Hyperlocal Discovery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bulk buyers filter by 5km, 15km, or 30km radius with PostGIS distance calculations to minimize transport costs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-earth-50 rounded-2xl p-5 border border-ochre-300 bg-ochre-50/50 relative">
              <div className="w-9 h-9 rounded-xl bg-ochre-500 text-brand-950 font-extrabold flex items-center justify-center mb-3 text-sm shadow">
                3
              </div>
              <h3 className="font-bold text-sm text-brand-950 font-display mb-1">Real-Time Negotiation</h3>
              <p className="text-xs text-brand-900 leading-relaxed">
                Send custom offers or counter-offers via live Socket.io threads with instantaneous price feedback.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 relative">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow">
                4
              </div>
              <h3 className="font-bold text-sm text-gray-900 font-display mb-1">Instant Confirmed Deal</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Acceptance auto-creates the order, unlocks direct phone & pickup address, and triggers transparent ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HYPERLOCAL LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full mb-1">
              <MapPin className="w-3.5 h-3.5 text-ochre-600" />
              <span>Pune Agro & Industrial Cluster (~20km)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-gray-900">
              Fresh Local Listings Available Today
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Vegetables', 'Grains', 'Dairy', 'Spices'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-earth-200 hover:bg-earth-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-earth-200/50 animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-earth-200 text-gray-500">
            No listings found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs shadow-md transition"
          >
            <span>View All Nearby Produce on Discovery Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
