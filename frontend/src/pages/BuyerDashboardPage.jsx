import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, offersAPI } from '../utils/api';
import { 
  Package, 
  MessageSquare, 
  RotateCcw, 
  Star, 
  MapPin, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'sent_offers'
  const [orders, setOrders] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBuyerData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const ordersRes = await ordersAPI.getAll({
        userId: currentUser.id,
        role: 'buyer'
      });
      if (ordersRes.data?.orders) {
        setOrders(ordersRes.data.orders);
      }

      const offersRes = await offersAPI.getMyOffers({
        userId: currentUser.id,
        role: 'buyer'
      });
      if (offersRes.data?.all) {
        setSentOffers(offersRes.data.all);
      }
    } catch (err) {
      console.error('Failed to load buyer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyerData();
  }, [currentUser?.id]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-ochre-700 via-ochre-600 to-ochre-800 text-brand-950 rounded-3xl p-6 sm:p-8 shadow-md border-b-4 border-brand-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-950 bg-white/40 px-3 py-0.5 rounded-full">
              Bulk Buyer Command Hub (Khareedo)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-brand-950">
            {currentUser?.business_name || 'My Sourcing Dashboard'}
          </h1>
          <p className="text-xs text-brand-950/80 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-900" />
            {currentUser?.address_text || 'Koregaon Park Retail Hub, Pune'}
          </p>
        </div>

        <Link
          to="/search"
          className="px-5 py-3 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
        >
          <Search className="w-4 h-4 text-ochre-400" />
          Find More Local Produce
        </Link>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Direct Orders</span>
          <div className="text-2xl font-extrabold text-brand-900 font-display">{orders.length}</div>
          <span className="text-[11px] text-gray-500">Completed & In Progress</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Active Negotiations</span>
          <div className="text-2xl font-extrabold text-amber-600 font-display">
            {sentOffers.filter(o => o.status === 'pending' || o.status === 'countered').length}
          </div>
          <span className="text-[11px] text-gray-500">Live offer threads</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Sourced Value</span>
          <div className="text-2xl font-extrabold text-brand-900 font-display">
            ₹{totalSpent.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-500">Direct farm-gate rates</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Est. Middleman Savings</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            ₹{Math.round(totalSpent * 0.22).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">~22% direct savings</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-earth-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-earth-50 border border-earth-200'
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders & Invoices ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('sent_offers')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'sent_offers'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-earth-50 border border-earth-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Active Negotiation Proposals ({sentOffers.length})
        </button>
      </div>

      {/* TAB 1: BUYER ORDERS & REPEAT ORDER SHORTCUTS (Flow E step 3) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-earth-200 text-center text-xs text-gray-500 space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <p>You haven't placed any direct orders yet.</p>
              <Link to="/search" className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow">
                Start Discovering Produce Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm hover:border-brand-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-700">Order #{ord.id}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-gray-900 font-display">
                        {ord.listing_title}
                      </h3>
                      <div className="text-xs text-gray-600">
                        Producer: <strong>{ord.producer_business_name || ord.producer_name}</strong> • Phone: {ord.producer_phone}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-extrabold text-lg text-brand-900 block">
                        ₹{ord.total_amount?.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {ord.final_quantity} {ord.unit} @ ₹{ord.final_price_per_unit}/{ord.unit}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Repeat Order Shortcut (Flow E step 3) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      Pickup from: <span>{ord.producer_address || ord.pickup_address || 'Pune Agro Hub'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/order-confirmed/${ord.id}`}
                        className="px-3.5 py-2 rounded-xl bg-earth-100 hover:bg-earth-200 text-gray-800 font-bold text-xs transition"
                      >
                        View Invoice & Tracker
                      </Link>

                      {/* Repeat Order Shortcut Button */}
                      <button
                        onClick={() => navigate(`/listing/${ord.listing_id}`)}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-ochre-300" />
                        Repeat Order (Re-order Produce)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENT OFFERS */}
      {activeTab === 'sent_offers' && (
        <div className="space-y-4">
          {sentOffers.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-earth-200 text-center text-xs text-gray-500">
              No offers sent yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sentOffers.map((o) => (
                <div key={o.id} className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 font-display">{o.listing_title}</h4>
                      <p className="text-xs text-gray-500">Seller: {o.producer_business_name}</p>
                    </div>
                    <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-earth-100 text-gray-700">
                      {o.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center p-2 rounded-2xl bg-earth-50 text-xs font-bold">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-normal">Offered Rate</span>
                      ₹{o.offered_price_per_unit}/{o.unit}
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-normal">Quantity</span>
                      {o.quantity} {o.unit}
                    </div>
                  </div>

                  <Link
                    to={`/negotiate/${o.listing_id}/${currentUser?.id}`}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-center font-bold text-xs rounded-xl shadow-sm transition block"
                  >
                    Open Negotiation Chat →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
