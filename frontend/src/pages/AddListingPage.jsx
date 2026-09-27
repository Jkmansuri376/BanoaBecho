import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI, usersAPI, SERVER_BASE_URL } from '../utils/api';
import PriceTierBuilder from '../components/PriceTierBuilder';
import { 
  PlusCircle, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Layers, 
  Sparkles, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORY_UNITS = {
  Vegetables: ['kg', 'quintals', 'crates (20kg)', 'tons'],
  Grains: ['kg', 'quintals (100kg)', 'bags (50kg)', 'tons'],
  Dairy: ['litres', 'kg', 'cans (40L)', 'crates'],
  Spices: ['kg', 'bags (25kg)', 'quintals'],
  Handicraft: ['pieces', 'sets', 'boxes', 'dozen'],
  Textile: ['pieces', 'meters', 'bales', 'sets']
};

export default function AddListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFirst = searchParams.get('isFirst') === 'true';
  const { currentUser, isProducer } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('in_stock');

  // Photo URLs array (2-3 uploaded or preset high-res unspash demo photos)
  const [photoUrls, setPhotoUrls] = useState([
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  ]);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Dynamic Price Tiers
  const [priceTiers, setPriceTiers] = useState([
    { min_qty: 50, max_qty: 199, price_per_unit: 28 },
    { min_qty: 200, max_qty: 499, price_per_unit: 24 },
    { min_qty: 500, max_qty: 2000, price_per_unit: 20 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPhotoUrl = () => {
    if (customPhotoInput.trim()) {
      setPhotoUrls([...photoUrls, customPhotoInput.trim()]);
      setCustomPhotoInput('');
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await usersAPI.uploadFile(formData);
      if (res.data?.fileUrl) {
        setPhotoUrls([...photoUrls, `${SERVER_BASE_URL}${res.data.fileUrl}`]);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !quantityAvailable || !unit) {
      return setError('Please fill all required listing details');
    }
    if (priceTiers.length === 0) {
      return setError('Please configure at least one bulk price tier');
    }

    setLoading(true);
    setError('');

    try {
      const producerId = currentUser?.id || 'prod_1';

      const res = await listingsAPI.create({
        producer_id: producerId,
        title,
        category,
        description,
        photo_urls: photoUrls,
        quantity_available: parseFloat(quantityAvailable),
        unit,
        price_tiers: priceTiers,
        availability_status: availabilityStatus
      });

      if (res.data?.listing) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
        navigate(`/listing/${res.data.listing.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        {isFirst ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300 uppercase tracking-wider mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Registration Complete! Now Add Your First Listing
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 uppercase tracking-wider mb-2">
            🌱 Producer Direct Post
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900">
          List Your Bulk Maal with Tiered Pricing
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto">
          Buyers will discover your produce based on location radius and negotiate live with you.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-6">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Title / Produce Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Farm-Fresh Organic Red Tomatoes (Grade A Table Quality)"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const availableUnits = CATEGORY_UNITS[e.target.value] || ['kg'];
                  setUnit(availableUnits[0]);
                }}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Vegetables">🥦 Vegetables</option>
                <option value="Grains">🌾 Grains & Pulses</option>
                <option value="Dairy">🥛 Dairy & Desi Ghee</option>
                <option value="Spices">🌶️ Spices & Condiments</option>
                <option value="Handicraft">🏺 Terracotta Handicraft</option>
                <option value="Textile">🧵 Handloom Textile</option>
              </select>
            </div>
          </div>

          {/* Quantity, Unit & Availability Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Available Stock Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {(CATEGORY_UNITS[category] || ['kg', 'litres', 'pieces', 'tons']).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="in_stock">🟢 In Stock (Ready for immediate dispatch)</option>
                <option value="seasonal">🟡 Seasonal Harvest (Within 3-5 days)</option>
                <option value="pre_order">🔵 Pre-Order Lot (Bulk reservation)</option>
              </select>
            </div>
          </div>

          {/* Photos Upload / URL Management (Flow A step 3: 2-3 photos) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">
              <span>Product Photos (Upload 2–3 photos for high buyer trust)</span>
              <span className="text-[11px] text-gray-500">{photoUrls.length} added</span>
            </label>

            {/* Photo Preview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {photoUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-earth-300 group shadow-sm bg-earth-100">
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Upload Tile */}
              <label className="aspect-video rounded-xl border-2 border-dashed border-earth-300 hover:border-brand-500 hover:bg-brand-50/50 cursor-pointer flex flex-col items-center justify-center p-2 text-center transition">
                <Upload className="w-5 h-5 text-brand-600 mb-1" />
                <span className="text-[11px] font-bold text-brand-800">
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or add direct URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="Or paste photo URL (https://...)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="px-3 py-1.5 bg-earth-200 hover:bg-earth-300 text-gray-800 font-bold text-xs rounded-xl transition"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Bulk Price Tiers Component */}
          <PriceTierBuilder
            tiers={priceTiers}
            onChange={setPriceTiers}
            unit={unit}
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description & Quality Specifications
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Harvested daily at 5 AM. Zero chemical residue, shelf-life 8+ days. Packed in 20kg plastic crates. Transport vehicle accessible farm-gate."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing Listing...' : 'Publish Direct Listing on BanaoBecho →'}
          </button>
        </div>
      </form>
    </div>
  );
}
