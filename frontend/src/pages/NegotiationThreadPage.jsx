import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { offersAPI } from '../utils/api';
import { 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Send, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Zap, 
  Clock, 
  TrendingDown, 
  Phone,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NegotiationThreadPage() {
  const { listingId, buyerId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isProducer, isBuyer } = useAuth();
  const { socket, joinThread, leaveThread } = useSocket();

  const [threadData, setThreadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Counter offer modal / form
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterTargetOffer, setCounterTargetOffer] = useState(null);
  const [counterQuantity, setCounterQuantity] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const messagesEndRef = useRef(null);

  // Load Thread History
  const loadThread = async () => {
    try {
      const res = await offersAPI.getThread(listingId, buyerId);
      if (res.data?.success) {
        setThreadData(res.data);
      }
    } catch (err) {
      setError('Failed to load negotiation thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
    joinThread(listingId, buyerId);

    // Socket.io Real-Time Event Listeners
    if (socket) {
      const handleNewOffer = (data) => {
        console.log('⚡ Real-time new offer event received:', data);
        setThreadData((prev) => {
          if (!prev) return prev;
          const exists = prev.offers.some((o) => o.id === data.offer.id);
          if (exists) return prev;
          return {
            ...prev,
            offers: [...prev.offers, data.offer]
          };
        });
      };

      const handleCounterOffer = (data) => {
        console.log('⚡ Real-time counter offer event received:', data);
        setThreadData((prev) => {
          if (!prev) return prev;
          const updatedOffers = prev.offers.map((o) =>
            o.id === data.parentOfferId ? { ...o, status: 'countered' } : o
          );
          const exists = updatedOffers.some((o) => o.id === data.offer.id);
          return {
            ...prev,
            offers: exists ? updatedOffers : [...updatedOffers, data.offer]
          };
        });
      };

      const handleOfferAccepted = (data) => {
        console.log('⚡ Real-time offer accepted event received:', data);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        if (data.order?.id) {
          navigate(`/order-confirmed/${data.order.id}`);
        } else {
          loadThread();
        }
      };

      const handleOfferRejected = (data) => {
        console.log('⚡ Real-time offer rejected event received:', data);
        setThreadData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            offers: prev.offers.map((o) =>
              o.id === data.offerId ? { ...o, status: 'rejected' } : o
            )
          };
        });
      };

      socket.on('new_offer', handleNewOffer);
      socket.on('counter_offer', handleCounterOffer);
      socket.on('offer_accepted', handleOfferAccepted);
      socket.on('offer_rejected', handleOfferRejected);

      return () => {
        leaveThread(listingId, buyerId);
        socket.off('new_offer', handleNewOffer);
        socket.off('counter_offer', handleCounterOffer);
        socket.off('offer_accepted', handleOfferAccepted);
        socket.off('offer_rejected', handleOfferRejected);
      };
    }
  }, [listingId, buyerId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadData?.offers]);

  // Actions: Accept Offer
  const handleAcceptOffer = async (offerId) => {
    try {
      setLoading(true);
      const res = await offersAPI.accept(offerId, {
        accepted_by_role: isProducer ? 'producer' : 'buyer'
      });
      if (res.data?.order) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        navigate(`/order-confirmed/${res.data.order.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept offer');
      setLoading(false);
    }
  };

  // Actions: Reject Offer
  const handleRejectOffer = async (offerId) => {
    try {
      await offersAPI.reject(offerId);
      loadThread();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject offer');
    }
  };

  // Actions: Open Counter Dialog
  const openCounterModal = (offer) => {
    setCounterTargetOffer(offer);
    setCounterQuantity(offer.quantity);
    setCounterPrice(offer.offered_price_per_unit);
    setCounterNotes('');
    setShowCounterModal(true);
  };

  // Actions: Submit Counter Offer
  const handleSendCounter = async (e) => {
    e.preventDefault();
    if (!counterQuantity || !counterPrice) return;
    setSubmittingCounter(true);

    try {
      const role = isProducer ? 'producer' : 'buyer';
      await offersAPI.counter(counterTargetOffer.id, {
        quantity: parseFloat(counterQuantity),
        offered_price_per_unit: parseFloat(counterPrice),
        notes: counterNotes,
        created_by_role: role
      });
      setShowCounterModal(false);
      loadThread();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send counter offer');
    } finally {
      setSubmittingCounter(false);
    }
  };

  if (loading && !threadData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-72 rounded-3xl bg-earth-200/50 animate-pulse" />
      </div>
    );
  }

  const { listing, buyer, offers = [], existingOrder } = threadData || {};
  const activeOffer = offers[offers.length - 1]; // latest offer in chain
  const isLatestPending = activeOffer && activeOffer.status === 'pending';
  const isLatestCountered = activeOffer && activeOffer.status === 'countered';

  // Determine if the current user is the one who needs to respond
  // If latest offer was created by buyer, producer can accept/reject/counter.
  // If latest offer was created by producer, buyer can accept/reject/counter.
  const isMyTurnToRespond =
    isLatestPending &&
    ((activeOffer.created_by_role === 'buyer' && currentUser?.id === listing?.producer_id) ||
      (activeOffer.created_by_role === 'producer' && currentUser?.id === buyer?.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-earth-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-earth-100 hover:bg-earth-200 transition text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                ⚡ Real-Time Negotiation Thread
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-700 font-bold">Live Socket Connected</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 font-display mt-0.5">
              {listing?.title}
            </h1>
          </div>
        </div>

        {existingOrder && (
          <Link
            to={`/order-confirmed/${existingOrder.id}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            View Confirmed Order (₹{existingOrder.total_amount?.toLocaleString()})
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container: Left Deal Summary Banner | Right Live Chat Negotiation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Deal Metadata & Participants (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Parties Card */}
          <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display">
              Negotiation Parties
            </h3>

            {/* Producer */}
            <div className="p-3 rounded-2xl bg-brand-50/70 border border-brand-200/80 space-y-1">
              <span className="text-[10px] font-bold text-brand-700 uppercase">Producer (Seller)</span>
              <div className="font-bold text-xs text-brand-950">
                {listing?.producer_business_name || listing?.producer_name}
              </div>
              <div className="text-[11px] text-gray-600">
                Contact: {listing?.producer_name} (★ {listing?.producer_rating_avg || '4.8'})
              </div>
            </div>

            {/* Buyer */}
            <div className="p-3 rounded-2xl bg-ochre-50/70 border border-ochre-200/80 space-y-1">
              <span className="text-[10px] font-bold text-ochre-800 uppercase">Bulk Buyer (Khareeddar)</span>
              <div className="font-bold text-xs text-brand-950">
                {buyer?.business_name || buyer?.name}
              </div>
              <div className="text-[11px] text-gray-600">
                Contact: {buyer?.name} • {buyer?.address_text?.split(',')[0]}
              </div>
            </div>

            {/* Listed Tiers Quick Reference */}
            <div className="pt-2 border-t border-earth-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-ochre-600" />
                Original Listed Bulk Tiers:
              </span>
              <div className="space-y-1 text-xs">
                {listing?.price_tiers?.map((t, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-gray-600 bg-earth-50 px-2.5 py-1 rounded-lg">
                    <span>{t.min_qty}–{t.max_qty} {listing.unit}</span>
                    <span className="font-bold text-brand-900 font-display">₹{t.price_per_unit}/{listing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat-Style Negotiation Timeline (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-earth-200 shadow-sm overflow-hidden min-h-[520px]">
          {/* Timeline Header */}
          <div className="px-6 py-3.5 bg-earth-50 border-b border-earth-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Offer & Counter-Offer History ({offers.length} rounds)
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Unit: {listing?.unit}
            </span>
          </div>

          {/* Offers Message Thread */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-[#FAF9F6]">
            {offers.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                No offers initiated yet. Send your starting proposal below!
              </div>
            ) : (
              offers.map((offer, idx) => {
                const isFromBuyer = offer.created_by_role === 'buyer';
                const isAccepted = offer.status === 'accepted';
                const isRejected = offer.status === 'rejected';
                const isCountered = offer.status === 'countered';
                const isPending = offer.status === 'pending';

                const totalVal = offer.quantity * offer.offered_price_per_unit;

                return (
                  <div
                    key={offer.id}
                    className={`flex flex-col max-w-lg ${
                      isFromBuyer ? 'mr-auto items-start' : 'ml-auto items-end'
                    }`}
                  >
                    {/* Role sender label */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-800">
                        {offer.creator_business || offer.creator_name}
                      </span>
                      <span>({isFromBuyer ? 'Buyer Offer' : 'Producer Counter'})</span>
                      <span className="text-[10px] text-gray-400">
                        • {new Date(offer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Offer Bubble */}
                    <div
                      className={`p-4 rounded-3xl border shadow-sm space-y-3 w-full ${
                        isAccepted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                          : isRejected
                          ? 'bg-red-50 border-red-200 text-red-900 opacity-75'
                          : isCountered
                          ? 'bg-earth-100 border-earth-200 text-gray-700 opacity-80'
                          : isFromBuyer
                          ? 'bg-white border-brand-200 text-gray-900'
                          : 'bg-brand-900 text-white border-brand-800'
                      }`}
                    >
                      {/* Status Tag */}
                      <div className="flex items-center justify-between gap-2 border-b pb-2 border-black/10">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Round #{idx + 1} Proposal
                        </span>
                        <div>
                          {isAccepted && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Deal Accepted
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Declined
                            </span>
                          )}
                          {isCountered && (
                            <span className="bg-earth-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Countered
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-amber-500 text-brand-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> Awaiting Decision
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Numbers */}
                      <div className="grid grid-cols-2 gap-2 text-center py-1">
                        <div className="p-2 rounded-2xl bg-black/5">
                          <span className="text-[10px] uppercase font-semibold block opacity-75">Offered Rate</span>
                          <span className="text-lg font-extrabold font-display">
                            ₹{offer.offered_price_per_unit}
                            <span className="text-xs font-normal"> / {listing?.unit}</span>
                          </span>
                        </div>
                        <div className="p-2 rounded-2xl bg-black/5">
                          <span className="text-[10px] uppercase font-semibold block opacity-75">Quantity</span>
                          <span className="text-lg font-extrabold font-display">
                            {offer.quantity.toLocaleString()}
                            <span className="text-xs font-normal"> {listing?.unit}</span>
                          </span>
                        </div>
                      </div>

                      {/* Total Value */}
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-black/10">
                        <span className="font-medium opacity-80">Total Deal Commitment:</span>
                        <span className="font-extrabold font-display text-sm">
                          ₹{totalVal.toLocaleString()}
                        </span>
                      </div>

                      {/* Note Message */}
                      {offer.notes && (
                        <p className="text-xs italic bg-black/5 p-2 rounded-xl">
                          "{offer.notes}"
                        </p>
                      )}

                      {/* ACTIONS ROW (Flow D step 3: Accept / Reject / Counter actions on producer/buyer side) */}
                      {isPending && isMyTurnToRespond && (
                        <div className="pt-3 border-t border-black/10 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept Deal
                          </button>

                          <button
                            type="button"
                            onClick={() => openCounterModal(offer)}
                            className="flex-1 py-2 px-3 bg-ochre-500 hover:bg-ochre-600 text-brand-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Counter Offer
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectOffer(offer.id)}
                            className="py-2 px-3 bg-earth-200 hover:bg-red-100 hover:text-red-700 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Counter / Reply Footer bar */}
          <div className="p-4 bg-white border-t border-earth-200 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {isLatestPending ? (
                isMyTurnToRespond ? (
                  <span className="font-bold text-brand-800">
                    👉 It is your turn! Accept, decline or propose a counter-offer above.
                  </span>
                ) : (
                  <span>⏳ Waiting for the other party to review your proposal...</span>
                )
              ) : activeOffer?.status === 'accepted' ? (
                <span className="text-emerald-700 font-bold">🎉 Deal successfully concluded!</span>
              ) : (
                <span>Negotiation closed.</span>
              )}
            </div>

            {isLatestPending && (
              <button
                type="button"
                onClick={() => openCounterModal(activeOffer)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Send New Counter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COUNTER OFFER MODAL (Flow D step 3) */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 space-y-4 relative">
            <div className="border-b border-earth-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ochre-700 bg-ochre-100 px-2 py-0.5 rounded-full">
                Counter-Offer Highway
              </span>
              <h3 className="font-display font-bold text-lg text-gray-900 mt-1">
                Propose Counter Terms to {counterTargetOffer?.creator_business}
              </h3>
            </div>

            <form onSubmit={handleSendCounter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Quantity ({listing?.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price / {listing?.unit} (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-extrabold text-brand-900 rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {counterQuantity && counterPrice && (
                <div className="p-3 bg-earth-50 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-600">New Deal Total:</span>
                  <span className="font-display font-extrabold text-brand-900">
                    ₹{(Number(counterQuantity) * Number(counterPrice)).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message / Rationale (Optional)
                </label>
                <textarea
                  rows="2"
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="e.g. Can do ₹21/kg if delivery is morning 6 AM."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-earth-300 text-gray-700 font-bold text-xs hover:bg-earth-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCounter}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
                >
                  {submittingCounter ? 'Broadcasting...' : 'Broadcast Counter →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
