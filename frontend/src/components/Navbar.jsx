import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Store, 
  PlusCircle, 
  MessageSquare, 
  Package, 
  Search, 
  User, 
  Bell, 
  Menu, 
  X, 
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, isProducer, isBuyer, logout } = useAuth();
  const { activeNotifications, removeNotification } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-earth-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-md group-hover:bg-brand-700 transition">
                🌱
              </div>
              <div>
                <span className="text-2xl font-extrabold font-display tracking-tight text-brand-900 block leading-none">
                  Banao<span className="text-ochre-600">Becho</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-600 block mt-0.5">
                  Banao, Becho, Seedha
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-earth-200">
              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  isActive('/search')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-750 hover:text-brand-700 hover:bg-earth-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Find Maal (Direct)
              </Link>

              {isProducer && (
                <>
                  <Link
                    to="/add-listing"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive('/add-listing')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-750 hover:text-brand-700 hover:bg-earth-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-ochre-600" />
                    Add Listing
                  </Link>
                  <Link
                    to="/producer-dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive('/producer-dashboard')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-750 hover:text-brand-700 hover:bg-earth-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Producer Dashboard
                  </Link>
                </>
              )}

              {isBuyer && (
                <Link
                  to="/buyer-dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive('/buyer-dashboard')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-750 hover:text-brand-700 hover:bg-earth-50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Buyer Hub & Orders
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Buttons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-gray-600 hover:text-brand-700 hover:bg-earth-50 rounded-full transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {activeNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-earth-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-earth-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">Live Alerts & Deals</span>
                    <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">
                      {activeNotifications.length} new
                    </span>
                  </div>
                  {activeNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No new alerts. Incoming counter-offers and order confirmations appear here live!
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-earth-50">
                      {activeNotifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-brand-50/50 transition flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-brand-900">{n.title || 'Deal Update'}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{n.message}</div>
                            {n.listingId && n.buyerId && (
                              <button
                                onClick={() => {
                                  setShowNotifs(false);
                                  navigate(`/negotiate/${n.listingId}/${n.buyerId}`);
                                }}
                                className="mt-1.5 text-[10px] font-bold text-brand-700 hover:text-brand-800 underline flex items-center gap-1"
                              >
                                View Negotiation Thread →
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => removeNotification(n.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active User Pill & Actions */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  to={isProducer ? '/producer-dashboard' : '/buyer-dashboard'}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-4 rounded-full bg-earth-100 hover:bg-earth-200/80 border border-earth-300 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-gray-900 truncate max-w-[120px]">
                      {currentUser.business_name}
                    </span>
                    <span className="block text-[10px] text-gray-500 capitalize">
                      {currentUser.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>

                <Link
                  to={isProducer ? '/add-listing' : '/search'}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  {isProducer ? (
                    <>
                      <PlusCircle className="w-4 h-4 text-ochre-300" />
                      Post New Maal
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Browse Direct
                    </>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register/producer"
                  className="px-3.5 py-2 rounded-lg border border-brand-600 text-brand-700 hover:bg-brand-50 text-xs font-bold transition"
                >
                  Banao (Producer)
                </Link>
                <Link
                  to="/register/buyer"
                  className="px-4 py-2 rounded-lg bg-ochre-500 hover:bg-ochre-600 text-brand-950 text-xs font-bold shadow-sm transition"
                >
                  Becho se Khareedo (Buyer)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 text-gray-600 hover:text-brand-700 relative"
            >
              <Bell className="w-5 h-5" />
              {activeNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-earth-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-earth-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-gray-800 hover:bg-brand-50"
          >
            🔍 Find Maal (Direct Search)
          </Link>
          {isProducer && (
            <>
              <Link
                to="/add-listing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-brand-700 bg-brand-50"
              >
                ➕ Add Listing (Bulk Tiers)
              </Link>
              <Link
                to="/producer-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-gray-800 hover:bg-brand-50"
              >
                📊 Producer Dashboard
              </Link>
            </>
          )}
          {isBuyer && (
            <Link
              to="/buyer-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-gray-800 hover:bg-brand-50"
            >
              📦 Buyer Dashboard & Orders
            </Link>
          )}

          <div className="pt-4 border-t border-earth-200 flex flex-col gap-2">
            <Link
              to="/register/producer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-brand-600 text-brand-700 font-bold text-sm"
            >
              Register as Producer (Banao)
            </Link>
            <Link
              to="/register/buyer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-ochre-500 text-brand-950 font-bold text-sm shadow"
            >
              Register as Buyer (Khareedo)
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
