import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, offersAPI, ordersAPI } from '../utils/api';
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Zap, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Building,
  User,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isProducer, isBuyer } = useAuth();

  const [listing, setListing] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Tabs / Modals
  const [actionTab, setActionTab] = useState('offer'); // 'offer' or 'buynow'
  
  // Send Offer Form States
  const [offerQuantity, setOfferQuantity] = useState(200);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Buy Now Form States
  const [buyNowQuantity, setBuyNowQuantity] = useState(100);
  const [buyNowSubmitting, setBuyNowSubmitting] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      setLoading(true);
      try {
        const lat = currentUser?.location_lat || 18.5362;
        const lng = currentUser?.location_lng || 73.8298;
        const res = await listingsAPI.getById(id, { lat, lng });
        if (res.data?.listing) {
          const l = res.data.listing;
          setListing(l);
          if (l.price_tiers && l.price_tiers.length > 0) {
            setOfferQuantity(l.price_tiers[0].min_qty || 100);
            setOfferedPrice(l.price_tiers[0].price_per_unit || '');
            setBuyNowQuantity(l.price_tiers[0].min_qty || 100);
          }
        }
      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, currentUser?.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 rounded-3xl bg-earth-200/50 animate-pulse" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Listing Not Found</h2>
        <Link to="/search" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Discovery
        </Link>
      </div>
    );
  }

  // Calculate matched tier rate for Buy Now
  const matchedBuyNowTier = listing.price_tiers?.find(
    (t) => Number(buyNowQuantity) >= Number(t.min_qty) && Number(buyNowQuantity) <= Number(t.max_qty)
  ) || (listing.price_tiers && listing.price_tiers.length > 0 ? listing.price_tiers[0] : { price_per_unit: 50 });

  const buyNowUnitPrice = Number(matchedBuyNowTier.price_per_unit);
  const buyNowTotal = Number(buyNowQuantity) * buyNowUnitPrice;

  // Send Offer Submission
  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerQuantity || !offeredPrice) return setError('Please enter quantity and offered price');

    const buyerId = currentUser?.id || 'buyer_1';
    setOfferSubmitting(true);
    setError('');

    try {
      const res = await offersAPI.create({
        listing_id: listing.id,
        buyer_id: buyerId,
        quantity: parseFloat(offerQuantity),
        offered_price_per_unit: parseFloat(offeredPrice),
        notes: offerNotes || `Namaste. Requesting ${offerQuantity} ${listing.unit} at ₹${offeredPrice}/${listing.unit}.`,
        created_by_role: 'buyer'
      });

      if (res.data?.offer) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        // Prompt Requirement Flow D Step 3: Redirect directly to live real-time Offer Thread Screen!
        navigate(`/negotiate/${listing.id}/${buyerId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit offer');
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Buy Now at listed price (Flow D step 2: skips negotiation, creates order directly)
  const handleBuyNow = async (e) => {
    e.preventDefault();
    const buyerId = currentUser?.id || 'buyer_1';
    setBuyNowSubmitting(true);
    setError('');

    try {
      const res = await ordersAPI.buyNow({
        listing_id: listing.id,
        buyer_id: buyerId,
        quantity: parseFloat(buyNowQuantity),
        notes: `Instant Direct Buy placed at listed bulk tier rate of ₹${buyNowUnitPrice}/${listing.unit}.`
      });

      if (res.data?.order) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
        // Redirect to Order Confirmed screen
        navigate(`/order-confirmed/${res.data.order.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place direct order');
    } finally {
      setBuyNowSubmitting(false);
    }
  };

  const defaultPhoto = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
  const photos = listing.photo_urls && listing.photo_urls.length > 0 ? listing.photo_urls : [defaultPhoto];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/search"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hyperlocal Discovery
      </Link>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Photo Gallery & Producer Card | Right Pricing Table & Negotiation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Photos & Producer Profile (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PHOTO GALLERY */}
          <div className="bg-white rounded-3xl p-4 border border-earth-200 shadow-sm space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-earth-100 border border-earth-100">
              <img
                src={photos[activePhotoIdx] || defaultPhoto}
                alt={listing.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 bg-brand-900/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-xl shadow">
                {listing.category}
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-xl">
                📍 {listing.distance_km} km from you
              </div>
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                      activePhotoIdx === idx ? 'border-brand-600 shadow-md ring-1 ring-brand-600' : 'border-earth-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT DESCRIPTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-4">
            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-gray-900 leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-gray-700 bg-earth-100 px-3 py-1 rounded-full">
                Total Available: <strong>{listing.quantity_available.toLocaleString()} {listing.unit}</strong>
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 capitalize">
                Status: {listing.availability_status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="pt-2 border-t border-earth-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-display">
                Harvest & Quality Specifications
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description || 'Naturally cultivated fresh lot with quality checks completed.'}
              </p>
            </div>
          </div>

          {/* PRODUCER PROFILE CARD (Flow D step 1) */}
          <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold font-display text-white">
                      {listing.producer_business_name || listing.producer_name}
                    </h3>
                    {listing.producer_verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Producer
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-brand-200 mt-0.5">
                    Contact: {listing.producer_name} • <span className="capitalize">{listing.producer_role?.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-ochre-400 bg-brand-800/80 px-2.5 py-1 rounded-xl border border-brand-700">
                    <Star className="w-4 h-4 fill-ochre-400 text-ochre-400" />
                    <span>{listing.producer_rating_avg || '4.9'}</span>
                  </div>
                  <span className="text-[10px] text-brand-300 block mt-0.5">
                    {listing.producer_rating_count || 18} buyer reviews
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-brand-800/80 text-center">
                <div className="bg-brand-800/50 p-2.5 rounded-xl">
                  <div className="text-base font-extrabold text-ochre-400 font-display">
                    {listing.producer_deals_completed || 15}+
                  </div>
                  <div className="text-[10px] text-brand-300 uppercase font-semibold">Deals Completed</div>
                </div>
                <div className="bg-brand-800/50 p-2.5 rounded-xl">
                  <div className="text-base font-extrabold text-white font-display">
                    {listing.distance_km} km
                  </div>
                  <div className="text-[10px] text-brand-300 uppercase font-semibold">Hyperlocal Distance</div>
                </div>
                <div className="bg-brand-800/50 p-2.5 rounded-xl">
                  <div className="text-base font-extrabold text-emerald-400 font-display">100%</div>
                  <div className="text-[10px] text-brand-300 uppercase font-semibold">Direct Source</div>
                </div>
              </div>

              <div className="text-[11px] text-brand-200 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-ochre-400 flex-shrink-0" />
                <span>{listing.producer_address || 'Pune Agro Hub, Maharashtra'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tiered Pricing Table & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* BULK PRICING TABLE (Flow D step 1) */}
          <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-ochre-600" />
                Transparent Bulk Price Tiers
              </h3>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Direct Farm-Gate Rates
              </span>
            </div>

            {/* Pricing Table */}
            <div className="overflow-hidden rounded-2xl border border-earth-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-earth-100 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Quantity Range</th>
                    <th className="px-3.5 py-2.5 text-right">Price per {listing.unit}</th>
                    <th className="px-3.5 py-2.5 text-right">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 font-medium">
                  {listing.price_tiers?.map((tier, idx) => {
                    const basePrice = Number(listing.price_tiers[0].price_per_unit);
                    const currentPrice = Number(tier.price_per_unit);
                    const discount = idx > 0 && basePrice > 0 ? Math.round(((basePrice - currentPrice) / basePrice) * 100) : 0;

                    return (
                      <tr key={idx} className="hover:bg-brand-50/40 transition">
                        <td className="px-3.5 py-2.5 font-bold text-gray-800">
                          {tier.min_qty} – {tier.max_qty} {listing.unit}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-extrabold text-brand-900 font-display text-sm">
                          ₹{tier.price_per_unit}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-bold text-emerald-700">
                          {discount > 0 ? `${discount}% OFF` : 'Base Rate'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              * Rates apply automatically based on ordered quantity. You can also send a custom counter-offer below for larger commitments.
            </p>
          </div>

          {/* TWO ACTIONS CONTAINER: Send Offer OR Buy Now (Flow D step 2) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-600/30 shadow-lg space-y-5">
            {/* Tab Toggle */}
            <div className="grid grid-cols-2 p-1 bg-earth-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActionTab('offer')}
                className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  actionTab === 'offer'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send Custom Offer
              </button>

              <button
                type="button"
                onClick={() => setActionTab('buynow')}
                className={`py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  actionTab === 'buynow'
                    ? 'bg-ochre-500 text-brand-950 shadow-md font-extrabold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Buy Now (Direct Tier)
              </button>
            </div>

            {/* PATH 1: SEND OFFER FORM */}
            {actionTab === 'offer' && (
              <form onSubmit={handleSendOffer} className="space-y-4 animate-in fade-in">
                <div className="bg-brand-50 p-3 rounded-2xl border border-brand-200 text-xs text-brand-900">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-ochre-600" />
                    Live Price Negotiation Highway
                  </div>
                  <span>Propose your custom price or weekly volume terms. Opens a real-time negotiation chat thread instantly!</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Quantity ({listing.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Offered Price / {listing.unit} (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs font-extrabold text-brand-900 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Total estimate */}
                {offerQuantity && offeredPrice && (
                  <div className="p-3 bg-earth-50 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600">Total Proposed Value:</span>
                    <span className="font-display font-extrabold text-sm text-brand-900">
                      ₹{(Number(offerQuantity) * Number(offeredPrice)).toLocaleString()}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Negotiation Note to Producer (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="e.g. Need weekly steady supply for our restaurant chain, please confirm best rate."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={offerSubmitting}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {offerSubmitting ? 'Sending Offer...' : 'Send Offer & Start Live Negotiation →'}
                </button>
              </form>
            )}

            {/* PATH 2: BUY NOW AT LISTED PRICE */}
            {actionTab === 'buynow' && (
              <form onSubmit={handleBuyNow} className="space-y-4 animate-in fade-in">
                <div className="bg-ochre-50 p-3 rounded-2xl border border-ochre-200 text-xs text-brand-950">
                  <div className="font-extrabold flex items-center gap-1 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-ochre-700" />
                    Instant Direct Order (No Negotiation Needed)
                  </div>
                  <span>Order directly at the listed tier rate. Auto-matches the best volume discount tier.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Required Quantity ({listing.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={buyNowQuantity}
                    onChange={(e) => setBuyNowQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                    required
                  />
                </div>

                {/* Auto Calculated Tier Rate Breakdown */}
                <div className="bg-earth-50 p-3.5 rounded-2xl border border-earth-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Matched Bulk Tier:</span>
                    <span className="font-bold text-brand-900">
                      {matchedBuyNowTier.min_qty}–{matchedBuyNowTier.max_qty} {listing.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Unit Rate:</span>
                    <span className="font-bold text-brand-900">₹{buyNowUnitPrice} / {listing.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-earth-200 flex justify-between items-center text-gray-900">
                    <span className="font-bold">Total Order Value:</span>
                    <span className="font-display font-extrabold text-base text-brand-900">
                      ₹{buyNowTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={buyNowSubmitting}
                  className="w-full py-3.5 rounded-xl bg-ochre-500 hover:bg-ochre-600 text-brand-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {buyNowSubmitting ? 'Confirming Order...' : `Buy Now for ₹${buyNowTotal.toLocaleString()} →`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
