import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import RatingModal from '../components/RatingModal';
import { 
  CheckCircle, 
  Phone, 
  MapPin, 
  Package, 
  RotateCcw, 
  Star, 
  Truck, 
  Layers, 
  Building, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderConfirmedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isProducer, isBuyer } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await ordersAPI.getById(id);
      if (res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await ordersAPI.updateStatus(order.id, newStatus);
      if (newStatus === 'completed') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      loadOrder();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-96 rounded-3xl bg-earth-200/50 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Order Record Not Found</h2>
        <Link to="/search" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  const isCompleted = order.status === 'completed';
  const isPickedUp = order.status === 'picked_up';
  const isConfirmed = order.status === 'confirmed';

  // Check if current user has already rated this order
  const myRating = order.ratings?.find((r) => r.from_user_id === currentUser?.id);
  const oppositeUserRole = currentUser?.id === order.producer_id ? 'Buyer' : 'Producer';
  const targetUserId = currentUser?.id === order.producer_id ? order.buyer_id : order.producer_id;
  const targetUserName = currentUser?.id === order.producer_id ? (order.buyer_business_name || order.buyer_name) : (order.producer_business_name || order.producer_name);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Confirmed Banner */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-850 to-brand-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-ochre-500/80 text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-ochre-500 text-brand-950 font-extrabold text-xs tracking-wider shadow">
          <Sparkles className="w-4 h-4" />
          DIRECT B2B DEAL CONFIRMED
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Order #{order.id}
        </h1>

        <p className="text-xs sm:text-sm text-brand-100 max-w-xl mx-auto">
          Middleman bypass successful. Direct contact details and pickup coordination are now unlocked below.
        </p>

        {/* Big Deal Metric */}
        <div className="inline-block bg-white/10 backdrop-blur-md p-4 px-8 rounded-2xl border border-white/20">
          <span className="text-[11px] text-ochre-300 uppercase font-bold tracking-wider block">
            Final Deal Amount
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            ₹{order.total_amount?.toLocaleString()}
          </span>
          <span className="text-xs text-brand-200 block mt-0.5">
            ({order.final_quantity} {order.unit} @ ₹{order.final_price_per_unit}/{order.unit})
          </span>
        </div>
      </div>

      {/* STATUS TIMELINE TRACKER */}
      <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display">
          Fulfillment & Logistics Status
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Step 1: Confirmed */}
          <div className={`p-3 rounded-2xl border transition ${isConfirmed || isPickedUp || isCompleted ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold' : 'bg-earth-50 border-earth-200 text-gray-400'}`}>
            <div className="text-sm mb-0.5">✅ 1. Confirmed</div>
            <div className="text-[10px] opacity-80">Deal locked & verified</div>
          </div>

          {/* Step 2: Picked Up */}
          <div className={`p-3 rounded-2xl border transition ${isPickedUp || isCompleted ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold' : 'bg-earth-50 border-earth-200 text-gray-400'}`}>
            <div className="text-sm mb-0.5">🚚 2. Picked Up</div>
            <div className="text-[10px] opacity-80">In transit / transport loaded</div>
          </div>

          {/* Step 3: Completed */}
          <div className={`p-3 rounded-2xl border transition ${isCompleted ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold' : 'bg-earth-50 border-earth-200 text-gray-400'}`}>
            <div className="text-sm mb-0.5">🌟 3. Completed</div>
            <div className="text-[10px] opacity-80">Received & ratings open</div>
          </div>
        </div>

        {/* State Transition Actions */}
        <div className="pt-3 border-t border-earth-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-600 font-medium">
            Current Status: <strong className="capitalize text-brand-900">{order.status.replace(/_/g, ' ')}</strong>
          </span>

          <div className="flex items-center gap-2">
            {isConfirmed && (
              <button
                onClick={() => handleUpdateStatus('picked_up')}
                disabled={updatingStatus}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                Mark as Picked Up
              </button>
            )}

            {isPickedUp && (
              <button
                onClick={() => handleUpdateStatus('completed')}
                disabled={updatingStatus}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Order Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UNLOCKED CONTACT DETAILS (Flow D step 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Producer Card */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
            <Building className="w-4 h-4" />
            Producer Farm / Facility (Seller)
          </div>
          <div>
            <h4 className="font-bold font-display text-gray-900 text-base">
              {order.producer_business_name}
            </h4>
            <p className="text-xs text-gray-600 font-medium">Contact Person: {order.producer_name}</p>
          </div>

          <div className="pt-2 border-t border-earth-100 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <a href={`tel:${order.producer_phone}`} className="font-bold text-brand-700 hover:underline">
                {order.producer_phone || '+91 98765 43210'}
              </a>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Unlocked
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 font-medium">{order.pickup_address || order.producer_address || 'Pune Agro Hub'}</span>
            </div>
          </div>
        </div>

        {/* Buyer Card */}
        <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ochre-700 uppercase tracking-wider">
            <Package className="w-4 h-4" />
            Bulk Buyer (Customer)
          </div>
          <div>
            <h4 className="font-bold font-display text-gray-900 text-base">
              {order.buyer_business_name}
            </h4>
            <p className="text-xs text-gray-600 font-medium">Contact Person: {order.buyer_name}</p>
          </div>

          <div className="pt-2 border-t border-earth-100 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ochre-600 flex-shrink-0" />
              <a href={`tel:${order.buyer_phone}`} className="font-bold text-gray-900 hover:underline">
                {order.buyer_phone || '+91 98765 43220'}
              </a>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Unlocked
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ochre-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 font-medium">{order.buyer_address || 'Koregaon Park, Pune'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* POST-ORDER RATING SECTION (Flow E Step 1 & 2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Post-Trade Mutual Ratings
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified trade feedback creates high trust and higher search ranking for local producers.
            </p>
          </div>

          {isCompleted && !myRating && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-brand-950 font-bold text-xs rounded-xl shadow transition"
            >
              Rate {oppositeUserRole} (1–5 Stars)
            </button>
          )}
        </div>

        {myRating ? (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span>Your Review:</span>
              <span className="flex items-center text-amber-600">
                {'★'.repeat(myRating.score)}
              </span>
              <span className="text-gray-500 font-normal">({myRating.score}/5 stars)</span>
            </div>
            {myRating.comment && (
              <p className="text-xs text-gray-700 italic">"{myRating.comment}"</p>
            )}
          </div>
        ) : !isCompleted ? (
          <div className="p-4 bg-earth-50 rounded-2xl text-xs text-gray-500 text-center">
            Rating unlocks once order status is marked as <strong>"Completed"</strong>.
          </div>
        ) : null}
      </div>

      {/* REPEAT ORDER SHORTCUT BUTTON (Flow E Step 3) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-earth-100 rounded-3xl border border-earth-300">
        <div>
          <h4 className="font-bold text-sm text-gray-900 font-display">
            Need Another Lot at the Same Terms?
          </h4>
          <p className="text-xs text-gray-600">
            Quickly re-initiate a deal for {order.final_quantity} {order.unit} @ ₹{order.final_price_per_unit}/{order.unit}.
          </p>
        </div>

        <button
          onClick={() => navigate(`/listing/${order.listing_id}`)}
          className="px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-ochre-400" />
          Repeat Order / Re-order Produce →
        </button>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          order={order}
          fromUserId={currentUser?.id}
          toUserId={targetUserId}
          targetName={targetUserName}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmitted={() => loadOrder()}
        />
      )}
    </div>
  );
}
