import React from 'react';
import { Plus, Trash2, Layers, AlertCircle } from 'lucide-react';

export default function PriceTierBuilder({ tiers, onChange, unit = 'kg' }) {
  const handleAddRow = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (Number(lastTier.max_qty) + 1 || 100) : 50;
    const newMax = newMin + 200;
    const newPrice = lastTier ? Math.max(1, Number(lastTier.price_per_unit) - 4) : 50;

    onChange([
      ...tiers,
      { min_qty: newMin, max_qty: newMax, price_per_unit: newPrice }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (tiers.length <= 1) return;
    const updated = tiers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleChangeField = (index, field, value) => {
    const updated = tiers.map((tier, i) => {
      if (i === index) {
        return { ...tier, [field]: value === '' ? '' : Number(value) };
      }
      return tier;
    });
    onChange(updated);
  };

  return (
    <div className="bg-earth-50 rounded-2xl p-4 border border-earth-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-display">
            <Layers className="w-4 h-4 text-ochre-600" />
            Bulk Price Tiers (Volume Discounts)
          </h4>
          <p className="text-xs text-gray-500">
            Encourage larger orders by offering better rates for higher quantities.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Tier Row
        </button>
      </div>

      <div className="space-y-2.5">
        {tiers.map((tier, index) => {
          const discountFromFirst =
            index > 0 && tiers[0].price_per_unit > 0
              ? Math.round(((tiers[0].price_per_unit - tier.price_per_unit) / tiers[0].price_per_unit) * 100)
              : 0;

          return (
            <div
              key={index}
              className="bg-white p-3 rounded-xl border border-earth-200 shadow-sm flex flex-wrap items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>

              {/* Min Qty */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                  Min Qty ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={tier.min_qty}
                  onChange={(e) => handleChangeField(index, 'min_qty', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <span className="text-gray-400 text-xs font-bold pt-4">to</span>

              {/* Max Qty */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                  Max Qty ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={tier.max_qty}
                  onChange={(e) => handleChangeField(index, 'max_qty', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Price Per Unit */}
              <div className="flex-1 min-w-[130px]">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                  Price / {unit} (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={tier.price_per_unit}
                    onChange={(e) => handleChangeField(index, 'price_per_unit', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold text-brand-900 rounded-lg border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Discount Tag */}
              {discountFromFirst > 0 && (
                <div className="pt-4 flex-shrink-0">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md">
                    {discountFromFirst}% OFF
                  </span>
                </div>
              )}

              {/* Remove Action */}
              <div className="pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  disabled={tiers.length <= 1}
                  className={`p-1.5 rounded-lg transition ${
                    tiers.length > 1
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Remove this tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
