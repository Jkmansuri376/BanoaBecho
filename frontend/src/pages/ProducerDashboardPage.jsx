import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, offersAPI, ordersAPI, usersAPI } from '../utils/api';
import { 
  Store, 
  PlusCircle, 
  Package, 
  MessageSquare, 
  Star, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function ProducerDashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('offers'); // 'offers', 'listings', 'orders'
  const [profileData, setProfileData] = useState(null);
  const [offersGrouped, setOffersGrouped] = useState({
    pending: [],
    accepted: [],
    rejected: [],
    countered: []
  });
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducerData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      // 1. User summary
      const userRes = await usersAPI.getProfile(currentUser.id);
      if (userRes.data) {
        setProfileData(userRes.data.user);
        setListings(userRes.data.listings || []);
      }

      // 2. Incoming Offers grouped by status
      const offersRes = await offersAPI.getMyOffers({
        userId: currentUser.id,
        role: 'producer'
      });
      if (offersRes.data?.grouped) {
        setOffersGrouped(offersRes.data.grouped);
      }

      // 3. Producer Orders
      const ordersRes = await ordersAPI.getAll({
        userId: currentUser.id,
        role: 'producer'
      });
      if (ordersRes.data?.orders) {
        setOrders(ordersRes.data.orders);
      }
    } catch (err) {
      console.error('Failed to load producer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducerData();
  }, [currentUser?.id]);

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingsAPI.delete(listingId);
        loadProducerData();
      } catch (err) {
        alert('Failed to delete listing');
      }
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Producer Overview Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-850 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-ochre-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xs font-bold uppercase tracking-wider text-ochre-300">
              Producer Command Hub (Banao)
            </span>
            {currentUser?.verified ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500 font-bold">
                <ShieldCheck className="w-3 h-3" /> Verified Farm
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {currentUser?.business_name || 'My Producer Hub'}
          </h1>
          <p className="text-xs text-brand-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-ochre-400" />
            {currentUser?.address_text || 'Shivajinagar Agri Zone, Pune'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/add-listing"
            className="px-5 py-3 rounded-2xl bg-ochre-500 hover:bg-ochre-400 text-brand-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Produce Lot
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Active Listings</span>
          <div className="text-2xl font-extrabold text-brand-900 font-display">{listings.length}</div>
          <span className="text-[11px] text-gray-500">Live on Discovery</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Pending Offers</span>
          <div className="text-2xl font-extrabold text-amber-600 font-display">{offersGrouped.pending.length}</div>
          <span className="text-[11px] text-gray-500">Awaiting your response</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Completed Deals</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            {orders.filter(o => o.status === 'completed').length}
          </div>
          <span className="text-[11px] text-gray-500">Direct trade orders</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Direct Volume</span>
          <div className="text-2xl font-extrabold text-brand-900 font-display">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-500">0% Commission cut</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-earth-200 pb-2">
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'offers'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-earth-50 border border-earth-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Incoming Offers & Negotiations ({offersGrouped.pending.length + offersGrouped.countered.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-earth-50 border border-earth-200'
          }`}
        >
          <Store className="w-4 h-4" />
          My Listed Produce ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-earth-50 border border-earth-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Direct Order Ledger ({orders.length})
        </button>
      </div>

      {/* TAB 1: INCOMING OFFERS GROUPED BY STATUS (Flow A step 4) */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          {/* Section: Pending Action */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-900 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Buyer Proposals ({offersGrouped.pending.length})
            </h3>

            {offersGrouped.pending.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-earth-200 text-center text-xs text-gray-500">
                No new pending offers. Newly negotiated buyer proposals will show up here live!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offersGrouped.pending.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {offer.category}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 font-display">
                          {offer.listing_title}
                        </h4>
                        <div className="text-xs text-gray-600 mt-0.5">
                          From: <strong>{offer.buyer_business_name || offer.buyer_name}</strong>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        Pending Action
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center p-2 rounded-2xl bg-earth-50 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Offered Price</span>
                        <span className="font-extrabold text-sm text-brand-900 font-display">
                          ₹{offer.offered_price_per_unit}/{offer.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Quantity</span>
                        <span className="font-extrabold text-sm text-brand-900 font-display">
                          {offer.quantity} {offer.unit}
                        </span>
                      </div>
                    </div>

                    {offer.notes && (
                      <p className="text-xs text-gray-600 italic bg-earth-50/50 p-2 rounded-xl">
                        "{offer.notes}"
                      </p>
                    )}

                    <Link
                      to={`/negotiate/${offer.listing_id}/${offer.buyer_id}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <span>Open Live Negotiation Thread</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Countered & Accepted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-earth-200">
            {/* Accepted */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-emerald-800 font-display flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Accepted Deals ({offersGrouped.accepted.length})
              </h3>
              <div className="space-y-2">
                {offersGrouped.accepted.map((o) => (
                  <Link
                    key={o.id}
                    to={`/negotiate/${o.listing_id}/${o.buyer_id}`}
                    className="block p-3.5 bg-white rounded-2xl border border-emerald-200 hover:shadow-sm transition"
                  >
                    <div className="flex justify-between text-xs font-bold text-gray-800">
                      <span>{o.listing_title}</span>
                      <span className="text-emerald-700">₹{o.offered_price_per_unit}/{o.unit}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Buyer: {o.buyer_business_name} ({o.quantity} {o.unit})
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Countered / In Progress */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-700 font-display flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-ochre-600" />
                Under Counter-Offer ({offersGrouped.countered.length})
              </h3>
              <div className="space-y-2">
                {offersGrouped.countered.map((o) => (
                  <Link
                    key={o.id}
                    to={`/negotiate/${o.listing_id}/${o.buyer_id}`}
                    className="block p-3.5 bg-white rounded-2xl border border-earth-200 hover:shadow-sm transition"
                  >
                    <div className="flex justify-between text-xs font-bold text-gray-800">
                      <span>{o.listing_title}</span>
                      <span>₹{o.offered_price_per_unit}/{o.unit}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Buyer: {o.buyer_business_name} ({o.quantity} {o.unit})
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY LISTINGS (Edit / Delete / View) */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-900 font-display">
              Your Published Produce Lots ({listings.length})
            </h3>
            <Link
              to="/add-listing"
              className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm"
            >
              + Add Another Listing
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => {
              const cover = (l.photo_urls && l.photo_urls.length > 0) ? l.photo_urls[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';
              return (
                <div key={l.id} className="bg-white rounded-3xl overflow-hidden border border-earth-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video w-full">
                      <img src={cover} alt={l.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-white/90 text-brand-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                        {l.category}
                      </span>
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {l.quantity_available} {l.unit} in stock
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-gray-900 font-display line-clamp-1">{l.title}</h4>
                      <div className="text-xs text-gray-600 font-medium">
                        Bulk Tiers: {l.price_tiers?.length || 0} pricing tiers configured
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-earth-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/listing/${l.id}`}
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      View Detail Page →
                    </Link>

                    <button
                      onClick={() => handleDeleteListing(l.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCER ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-gray-900 font-display">
            Direct Orders Received ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-earth-200 text-center text-xs text-gray-500">
              No confirmed orders yet. Once an offer is accepted or a Buy Now order is placed, it will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700">#{ord.id}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 font-display">{ord.listing_title}</h4>
                    <p className="text-xs text-gray-600">
                      Buyer: <strong>{ord.buyer_business_name || ord.buyer_name}</strong> • Phone: {ord.buyer_phone}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div>
                      <span className="font-display font-extrabold text-base text-brand-900 block">
                        ₹{ord.total_amount?.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {ord.final_quantity} {ord.unit} @ ₹{ord.final_price_per_unit}/{ord.unit}
                      </span>
                    </div>

                    <Link
                      to={`/order-confirmed/${ord.id}`}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Manage Order Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
