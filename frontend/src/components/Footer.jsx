import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Zap, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white pt-12 pb-8 border-t-4 border-ochre-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-display font-bold text-lg">
                🌱
              </div>
              <span className="text-xl font-extrabold font-display tracking-tight text-white">
                Banao<span className="text-ochre-400">Becho</span>
              </span>
            </div>
            <p className="text-xs text-brand-200 leading-relaxed font-medium">
              "Banao, Becho, Seedha — apna maal seedha bulk buyer tak."
            </p>
            <p className="text-[11px] text-brand-300/80 leading-relaxed">
              Hyperlocal B2B direct marketplace connecting manufacturers, small farmers, and FPOs directly with bulk buyers.
            </p>
          </div>

          {/* Col 2: Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ochre-400 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs text-brand-200">
              <li><Link to="/search?category=Vegetables" className="hover:text-white transition">Fresh Farm Vegetables</Link></li>
              <li><Link to="/search?category=Grains" className="hover:text-white transition">Single-Origin Grains & Rice</Link></li>
              <li><Link to="/search?category=Dairy" className="hover:text-white transition">Pure Desi Dairy & A2 Ghee</Link></li>
              <li><Link to="/search?category=Spices" className="hover:text-white transition">Direct Milled Whole Spices</Link></li>
              <li><Link to="/search?category=Handicraft" className="hover:text-white transition">Terracotta & Artisan Pottery</Link></li>
              <li><Link to="/search?category=Textile" className="hover:text-white transition">Handloom Linen & Cotton</Link></li>
            </ul>
          </div>

          {/* Col 3: Direct User Flows */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ochre-400 mb-3">Direct Portals</h4>
            <ul className="space-y-2 text-xs text-brand-200">
              <li><Link to="/register/producer" className="hover:text-white transition">Producer Onboarding (Banao)</Link></li>
              <li><Link to="/register/buyer" className="hover:text-white transition">Buyer Onboarding (Khareedo)</Link></li>
              <li><Link to="/search" className="hover:text-white transition">Hyperlocal Discovery (5-30km)</Link></li>
              <li><Link to="/add-listing" className="hover:text-white transition">List Bulk Produce with Tiers</Link></li>
              <li><Link to="/producer-dashboard" className="hover:text-white transition">Real-time Negotiation Inbox</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Pillars & Future Scope */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ochre-400 mb-3">Zero Middleman Promise</h4>
            <div className="space-y-2 text-xs text-brand-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Verified Local Producers & FPOs</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-ochre-400 flex-shrink-0" />
                <span>Real-time Counter-Offer Negotiation</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Hyperlocal PostGIS Radius Match</span>
              </div>
              <div className="mt-3 p-2 bg-brand-900/80 rounded border border-brand-800 text-[10px] text-brand-300">
                <span className="font-bold text-ochre-300">Future Scope:</span> Integrated escrow payments, automated multi-truck fleet dispatch, multi-lingual voice search.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-300 gap-3">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-white">BanaoBecho</span>. Empowering Local Indian Producers & Bulk Buyers Directly.
          </div>
          <div className="flex items-center gap-1 text-ochre-400 font-medium">
            <span>Banao, Becho, Seedha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
