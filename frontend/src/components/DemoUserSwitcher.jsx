import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Users, Shield, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function DemoUserSwitcher() {
  const { currentUser, demoUsers, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser || demoUsers.length === 0) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer_small':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">🌾 Small Farmer</span>;
      case 'farmer_large_fpo':
        return <span className="bg-green-100 text-green-900 text-xs px-2 py-0.5 rounded-full font-medium">🚜 Large FPO</span>;
      case 'manufacturer':
        return <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-medium">🏭 Manufacturer</span>;
      case 'buyer':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">🛒 Bulk Buyer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-900 text-white border-b border-brand-800 text-xs px-3 py-1.5 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-ochre-400">
            <UserCheck className="w-3.5 h-3.5" />
            Active Demo Persona:
          </span>
          <span className="font-bold text-white bg-brand-800 px-2.5 py-0.5 rounded border border-brand-700">
            {currentUser.name} ({currentUser.business_name})
          </span>
          {getRoleBadge(currentUser.role)}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-ochre-300 hover:text-ochre-200 font-medium underline underline-offset-2 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Switch Role / Persona (Test Buyer vs Producer)
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-brand-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pb-1">
          {demoUsers.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setIsOpen(false);
                }}
                className={`text-left p-2 rounded transition flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-ochre-500 text-brand-950 font-bold border-ochre-300 shadow-md ring-2 ring-white/30'
                    : 'bg-brand-800/80 hover:bg-brand-700/80 text-gray-200 border-brand-700/50'
                }`}
              >
                <div className="font-semibold truncate text-[11px]">{user.name}</div>
                <div className="text-[10px] opacity-85 truncate">{user.business_name}</div>
                <div className="mt-1 flex items-center justify-between text-[9px]">
                  <span className="capitalize">{user.role.replace(/_/g, ' ')}</span>
                  <span>★ {user.rating_avg}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
