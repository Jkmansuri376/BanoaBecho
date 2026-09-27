import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import LocationPicker from '../components/LocationPicker';
import { 
  ShoppingBag, 
  Smartphone, 
  CheckCircle, 
  Utensils, 
  Store, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BUYER_TYPES = [
  { id: 'Restaurant', label: 'Restaurant / Hotel / Cloud Kitchen', desc: 'Sourcing fresh vegetables, dairy, spices weekly', icon: '🍳' },
  { id: 'Retailer', label: 'Retailer / Supermarket / Mart', desc: 'Bulk packaged grains, flour, seasonal fruits for shelves', icon: '🛒' },
  { id: 'Wholesaler', label: 'Wholesaler / Mandi Stockist', desc: 'Large tons, FPO farm-gate directly in bulk', icon: '🏬' }
];

const CATEGORIES_OPTIONS = [
  'Vegetables', 'Grains', 'Dairy', 'Spices', 'Handicraft', 'Textile'
];

export default function RegisterBuyerPage() {
  const navigate = useNavigate();
  const { loginWithUser } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('+919876543888');
  const [otp, setOtp] = useState('123456');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [name, setName] = useState('Chef Rajesh Sharma');
  const [businessName, setBusinessName] = useState('Rasoi Fine Dining & Catering');
  const [buyerType, setBuyerType] = useState('Restaurant');
  const [preferredCategories, setPreferredCategories] = useState(['Vegetables', 'Dairy', 'Spices']);

  // Location (Koregaon Park Pune center)
  const [locationLat, setLocationLat] = useState(18.5362);
  const [locationLng, setLocationLng] = useState(73.8298);
  const [addressText, setAddressText] = useState('Koregaon Park Main Road, Pune, Maharashtra');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat) => {
    if (preferredCategories.includes(cat)) {
      setPreferredCategories(preferredCategories.filter(c => c !== cat));
    } else {
      setPreferredCategories([...preferredCategories, cat]);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return setError('Please enter a phone number');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.sendOtp(phone);
      setOtpSent(true);
      if (res.data?.debugOtp) {
        setGeneratedOtp(res.data.debugOtp);
        setOtp(res.data.debugOtp);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError('Please enter OTP');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOtp(phone, otp);
      if (res.data?.isExistingUser) {
        loginWithUser(res.data.user);
        navigate('/search');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!name || !businessName) return setError('Please fill all business details');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register({
        role: 'buyer',
        name,
        business_name: `${businessName} (${buyerType})`,
        phone,
        location_lat: locationLat,
        location_lng: locationLng,
        address_text: addressText,
        verified: 1,
        preferred_categories: preferredCategories
      });

      if (res.data?.user) {
        loginWithUser(res.data.user);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        // Prompt Requirement Flow B step 2: Redirect to home/search screen after registration
        navigate('/search');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ochre-800 bg-ochre-100 px-3 py-1 rounded-full border border-ochre-300 uppercase tracking-wider mb-2">
          🛒 Bulk Buyer Onboarding (Khareedo)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900">
          Source Direct from Local Producers & Save 15–30%
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto">
          Cut out intermediary distributor markups. Set your location and discover fresh farm produce & manufactured goods within 5-30km.
        </p>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mt-6 max-w-xs mx-auto">
          <div className={`flex-1 h-2 rounded-full transition ${step >= 1 ? 'bg-ochre-500' : 'bg-earth-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition ${step >= 2 ? 'bg-ochre-500' : 'bg-earth-200'}`} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-6">
          <div className="border-b border-earth-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-ochre-600" />
              Step 1: Phone Verification
            </h2>
            <p className="text-xs text-gray-500">
              Instant login & secure negotiation verification via mobile OTP.
            </p>
          </div>

          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543220"
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                required
              />
            </div>

            {otpSent && (
              <div className="space-y-2 animate-in fade-in">
                <div className="p-3 bg-ochre-50 rounded-xl border border-ochre-200 text-xs text-ochre-900 flex items-center justify-between">
                  <span>🔑 Mock OTP Generated: <strong className="text-sm font-mono font-bold">{generatedOtp || '123456'}</strong></span>
                  <span className="text-[10px] text-gray-500">(Logged in terminal)</span>
                </div>
                <label className="block text-xs font-bold text-gray-700">
                  Enter 6-digit OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 text-sm font-mono font-bold text-center tracking-widest rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-ochre-500 hover:bg-ochre-600 text-brand-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading
                ? 'Verifying...'
                : otpSent
                ? 'Verify OTP & Setup Buyer Profile →'
                : 'Send Verification OTP'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleCompleteRegistration} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-5">
            <div className="border-b border-earth-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <Store className="w-5 h-5 text-ochre-600" />
                Step 2: Business & Sourcing Details
              </h2>
              <p className="text-xs text-gray-500">
                Helps producers understand your bulk requirements and offer volume deals.
              </p>
            </div>

            {/* Buyer Type Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Select Business Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUYER_TYPES.map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBuyerType(bt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      buyerType === bt.id
                        ? 'border-ochre-500 bg-ochre-50 text-brand-950 ring-2 ring-ochre-500/30'
                        : 'border-earth-200 hover:bg-earth-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <span className="text-2xl block mb-1">{bt.icon}</span>
                      <span className="font-bold text-xs block">{bt.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">{bt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Person / Manager Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chef Rajesh Sharma"
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Business / Brand / Hotel Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Rasoi Fine Dining"
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                  required
                />
              </div>
            </div>

            {/* Preferred Sourcing Categories */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Preferred Sourcing Categories (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_OPTIONS.map((cat) => {
                  const isSelected = preferredCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-ochre-500 text-brand-950 border-ochre-600 shadow-sm'
                          : 'bg-earth-50 text-gray-600 border-earth-200 hover:bg-earth-100'
                      }`}
                    >
                      {cat} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <LocationPicker
              lat={locationLat}
              lng={locationLng}
              address={addressText}
              onChangeLat={setLocationLat}
              onChangeLng={setLocationLng}
              onChangeAddress={setAddressText}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-ochre-500 hover:bg-ochre-600 text-brand-950 font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? 'Completing Registration...' : 'Complete & Start Discovering Nearby Maal →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
