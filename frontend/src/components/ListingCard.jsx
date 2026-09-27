import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Tag, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    category,
    photo_urls,
    quantity_available,
    unit,
    price_tiers,
    availability_status,
    producer_name,
    producer_business_name,
    producer_role,
    producer_verified,
    producer_rating_avg,
    producer_rating_count,
    distance_km,
    starting_price,
    max_price
  } = listing;

  const defaultPhoto = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  const coverPhoto = (photo_urls && photo_urls.length > 0) ? photo_urls[0] : defaultPhoto;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'farmer_small':
        return 'Small Farmer';
      case 'farmer_large_fpo':
        return 'Large Farmer / FPO';
      case 'manufacturer':
        return 'Manufacturer / Artisan';
      default:
        return 'Producer';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_stock':
        return <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">In Stock</span>;
      case 'seasonal':
        return <span className="bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Seasonal Harvest</span>;
      case 'pre_order':
        return <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Pre-Order Lot</span>;
      case 'sold_out':
        return <span className="bg-gray-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Sold Out</span>;
      default:
        return null;
    }
  };

  // Find lowest tier price
  const lowestPrice = starting_price || (price_tiers && price_tiers.length > 0 ? Math.min(...price_tiers.map(t => Number(t.price_per_unit))) : 0);
  const highestPrice = max_price || (price_tiers && price_tiers.length > 0 ? Math.max(...price_tiers.map(t => Number(t.price_per_unit))) : lowestPrice);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-earth-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col group">
      {/* Photo with Overlay Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-earth-100">
        <img
          src={coverPhoto}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPhoto;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="bg-white/95 backdrop-blur-md text-brand-900 font-bold text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm border border-earth-200">
            {category}
          </span>
          {getStatusBadge(availability_status)}
        </div>

        {/* Bottom Distance & Stock on Photo */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-ochre-400" />
            <span>{typeof distance_km === 'number' ? `${distance_km} km away` : 'Nearby'}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px]">
            {quantity_available.toLocaleString()} {unit} avail.
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Producer Info & Verification */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-gray-700 truncate">
                {producer_business_name || producer_name}
              </span>
              {producer_verified ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium flex-shrink-0" title="Verified Producer with ID/FPO certificate">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              ) : null}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{producer_rating_avg || '4.8'}</span>
              <span className="text-[10px] text-gray-400">({producer_rating_count || 12})</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-600 mb-2 font-medium">
            {getRoleLabel(producer_role)}
          </div>

          {/* Listing Title */}
          <h3 className="font-display font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition">
            {title}
          </h3>
        </div>

        {/* Tier Price Summary & Call to Action */}
        <div className="mt-4 pt-3 border-t border-earth-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600 block">
                Bulk Tier Rates
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-brand-800 font-display">
                  ₹{lowestPrice}
                </span>
                {highestPrice > lowestPrice && (
                  <span className="text-xs text-gray-600">
                    – ₹{highestPrice}
                  </span>
                )}
                <span className="text-xs text-gray-600 font-medium">/ {unit}</span>
              </div>
            </div>

            {price_tiers && price_tiers.length > 0 && (
              <span className="text-[10px] text-ochre-800 font-bold bg-ochre-100 px-2 py-0.5 rounded flex items-center gap-1 border border-ochre-200">
                <Layers className="w-3 h-3" />
                {price_tiers.length} Tiers
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link
            to={`/listing/${id}`}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 group-hover:bg-brand-700"
          >
            <span>View & Negotiate Seedha</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
