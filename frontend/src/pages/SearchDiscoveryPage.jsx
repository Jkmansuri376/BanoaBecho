import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI } from '../utils/api';
import ListingCard from '../components/ListingCard';
import { 
  Search, 
  MapPin, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Layers, 
  Star, 
  ArrowUpDown, 
  Compass,
  X
} from 'lucide-react';

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Dairy', 'Spices', 'Handicraft', 'Textile'];
const RADIUS_OPTIONS = [
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 15 km', value: '15' },
  { label: 'Within 30 km', value: '30' },
  { label: 'Any Distance', value: 'all' }
];

const PRODUCER_TYPES = [
  { label: 'All Producers', value: 'All' },
  { label: '🌾 Small Farmer', value: 'farmer_small' },
  { label: '🚜 Large FPO', value: 'farmer_large_fpo' },
  { label: '🏭 Manufacturer', value: 'manufacturer' }
];

export default function SearchDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedRadius, setSelectedRadius] = useState(searchParams.get('radius') || '30');
  const [selectedProducerType, setSelectedProducerType] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price_asc', 'price_desc', 'rating_desc', 'newest'

  // Listings state
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [buyerLocation, setBuyerLocation] = useState(null);

  // Fetch listings whenever filters change
  const fetchListings = async () => {
    setLoading(true);
    try {
      const lat = currentUser?.location_lat || 18.5362;
      const lng = currentUser?.location_lng || 73.8298;

      const params = {
        q: searchQuery,
        category: selectedCategory,
        radius: selectedRadius,
        producer_type: selectedProducerType,
        min_rating: minRating || undefined,
        in_stock_only: inStockOnly,
        sort: sortBy,
        lat,
        lng
      };

      const res = await listingsAPI.getAll(params);
      if (res.data?.listings) {
        setListings(res.data.listings);
        setTotalCount(res.data.count || res.data.listings.length);
        setBuyerLocation(res.data.buyerLocation);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedRadius, selectedProducerType, minRating, inStockOnly, sortBy, currentUser?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRadius('30');
    setSelectedProducerType('All');
    setMinRating('');
    setInStockOnly(false);
    setSortBy('distance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar (Flow C Step 1) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-0.5 rounded-full border border-brand-200 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-ochre-600" />
              Hyperlocal Discovery & Sourcing
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900">
              Find Direct Produce Near You
            </h1>
          </div>

          {/* Current Stored Location Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-earth-50 px-3.5 py-2 rounded-xl border border-earth-200">
            <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>
              Searching near: <strong className="text-gray-900">{currentUser?.address_text ? currentUser.address_text.split(',')[0] : 'Pune Hub'}</strong>
            </span>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vegetables, grains, spices, handloom, producer farm name..."
              className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-2xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center gap-1.5"
          >
            <span>Search</span>
          </button>
        </form>

        {/* FILTER CHIPS (Flow C Step 1: Category, Radius 5/15/30km, Producer Type, Rating) */}
        <div className="space-y-3 pt-2 border-t border-earth-100">
          {/* Row 1: Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pr-2 flex-shrink-0">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-700'
                    : 'bg-earth-50 text-gray-700 border border-earth-200 hover:bg-earth-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Row 2: Distance Radius & Producer Type & Ratings */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Radius Chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pr-1">
                Radius:
              </span>
              {RADIUS_OPTIONS.map((rad) => (
                <button
                  key={rad.value}
                  onClick={() => setSelectedRadius(rad.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    selectedRadius === rad.value
                      ? 'bg-ochre-500 text-brand-950 shadow-sm ring-1 ring-ochre-600'
                      : 'bg-white text-gray-600 border border-earth-200 hover:bg-earth-50'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  {rad.label}
                </button>
              ))}
            </div>

            {/* In-stock toggle & min rating */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  inStockOnly
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white text-gray-600 border-earth-200 hover:bg-earth-50'
                }`}
              >
                {inStockOnly ? '✓ In Stock Only' : 'In Stock Only'}
              </button>

              <select
                value={selectedProducerType}
                onChange={(e) => setSelectedProducerType(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-earth-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PRODUCER_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>

              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-earth-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">⭐ Any Rating</option>
                <option value="4.0">⭐ 4.0+ Rating</option>
                <option value="4.5">⭐ 4.5+ Rating</option>
                <option value="4.8">⭐ 4.8+ Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS BAR & SORT DROPDOWN (Flow C Step 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-gray-900 text-base">
            {totalCount} Direct Listings Available
          </span>
          {selectedCategory !== 'All' && (
            <span className="text-xs bg-brand-100 text-brand-800 font-bold px-2.5 py-0.5 rounded-full">
              {selectedCategory}
            </span>
          )}
          {selectedRadius !== 'all' && (
            <span className="text-xs bg-ochre-100 text-ochre-800 font-bold px-2.5 py-0.5 rounded-full">
              Within {selectedRadius}km
            </span>
          )}
        </div>

        {/* Sort Dropdown (distance / price / rating / newest) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-earth-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          >
            <option value="distance">📍 Distance (Nearest First)</option>
            <option value="price_asc">💰 Starting Price (Low to High)</option>
            <option value="price_desc">💰 Starting Price (High to Low)</option>
            <option value="rating_desc">⭐ Top Rated Producers</option>
            <option value="newest">✨ Newest Lots First</option>
          </select>
        </div>
      </div>

      {/* LISTINGS RESULTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-earth-200/50 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-earth-200 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-earth-100 text-gray-400 mx-auto flex items-center justify-center text-2xl font-bold">
            🔍
          </div>
          <h3 className="font-display font-bold text-lg text-gray-900">
            No produce listings matched your filters
          </h3>
          <p className="text-xs text-gray-500">
            Try expanding your distance radius (e.g. to 30km or Any Distance) or switching categories.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow transition hover:bg-brand-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
