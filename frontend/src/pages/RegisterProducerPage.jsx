import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, usersAPI, SERVER_BASE_URL } from '../utils/api';
import LocationPicker from '../components/LocationPicker';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle, 
  Smartphone, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterProducerPage() {
  const navigate = useNavigate();
  const { loginWithUser } = useAuth();

  // Form states
  const [step, setStep] = useState(1); // 1: Phone & OTP, 2: Farm/Business Details & Location, 3: Certificate Upload (Optional)
  const [phone, setPhone] = useState('+919876543999');
  const [otp, setOtp] = useState('123456');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [name, setName] = useState('Anand Patil');
  const [businessName, setBusinessName] = useState('Sahyadri Green Agro Farms');
  const [role, setRole] = useState('farmer_small'); // 'farmer_small', 'farmer_large_fpo', 'manufacturer'
  const [producerCategory, setProducerCategory] = useState('Vegetables');

  // Location
  const [locationLat, setLocationLat] = useState(18.5312);
  const [locationLng, setLocationLng] = useState(73.8445);
  const [addressText, setAddressText] = useState('Shivajinagar Agri Zone, Pune, Maharashtra');

  // Certificate upload
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
  const [isUploading, setIsUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Send Mock OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return setError('Please enter a valid phone number');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.sendOtp(phone);
      setOtpSent(true);
      if (res.data?.debugOtp) {
        setGeneratedOtp(res.data.debugOtp);
        setOtp(res.data.debugOtp); // prefill for easy prototype testing
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError('Please enter OTP');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOtp(phone, otp);
      if (res.data?.isExistingUser) {
        // If already existing, log in and redirect
        loginWithUser(res.data.user);
        navigate('/producer-dashboard');
      } else {
        // Proceed to Step 2
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Use 123456 or code shown on screen.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Certificate File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCertificateFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await usersAPI.uploadFile(formData);
      if (res.data?.fileUrl) {
        setCertificateUrl(`${SERVER_BASE_URL}${res.data.fileUrl}`);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Submit Full Producer Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!name || !businessName) return setError('Please fill all required business details');
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register({
        role,
        name,
        business_name: businessName,
        phone,
        location_lat: locationLat,
        location_lng: locationLng,
        address_text: addressText,
        verified: certificateUrl ? 1 : 0,
        certificate_url: certificateUrl,
        producer_category: producerCategory
      });

      if (res.data?.user) {
        loginWithUser(res.data.user);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        // Prompt Requirement: After registration, redirect to "Add your first listing" form!
        navigate('/add-listing?isFirst=true');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 uppercase tracking-wider mb-2">
          🌱 Producer Onboarding (Banao)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900">
          Sell Direct to Bulk Buyers with Zero Middlemen
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl mx-auto">
          Set your volume price tiers, receive verified buyer offers, and negotiate live.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 max-w-sm mx-auto">
          <div className={`flex-1 h-2 rounded-full transition ${step >= 1 ? 'bg-brand-600' : 'bg-earth-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition ${step >= 2 ? 'bg-brand-600' : 'bg-earth-200'}`} />
          <div className={`flex-1 h-2 rounded-full transition ${step >= 3 ? 'bg-brand-600' : 'bg-earth-200'}`} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Phone & OTP Verification */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-6">
          <div className="border-b border-earth-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand-600" />
              Step 1: Phone Verification & Mobile Auth
            </h2>
            <p className="text-xs text-gray-500">
              We log in and register using your mobile number for secure direct trade.
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
                placeholder="+919876543210"
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {otpSent && (
              <div className="space-y-2 animate-in fade-in">
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 flex items-center justify-between">
                  <span>🔑 Mock OTP Generated: <strong className="text-sm font-mono font-bold text-brand-800">{generatedOtp || '123456'}</strong></span>
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
                  className="w-full px-4 py-2.5 text-sm font-mono font-bold text-center tracking-widest rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading
                ? 'Verifying...'
                : otpSent
                ? 'Verify OTP & Continue →'
                : 'Send Verification OTP'}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Producer Details & Location */}
      {step === 2 && (
        <form onSubmit={handleCompleteRegistration} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-earth-200 shadow-sm space-y-5">
            <div className="border-b border-earth-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-ochre-600" />
                Step 2: Farm & Producer Profile
              </h2>
              <p className="text-xs text-gray-500">
                Buyers see this profile card in discovery search and product details.
              </p>
            </div>

            {/* Role / Producer Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Select Producer Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'farmer_small', label: 'Small Farmer', desc: 'Individually owned farm / orchard (<5 acres)', icon: '🌾' },
                  { id: 'farmer_large_fpo', label: 'Large Farmer / FPO', desc: 'Farmer Producer Co. / Cluster aggregation', icon: '🚜' },
                  { id: 'manufacturer', label: 'Manufacturer / Artisan', desc: 'Handloom, spices mill, terracotta pottery', icon: '🏭' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRole(t.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      role === t.id
                        ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-600/30'
                        : 'border-earth-200 hover:bg-earth-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <span className="text-2xl block mb-1">{t.icon}</span>
                      <span className="font-bold text-xs block">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Producer Name & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Farm / Enterprise / Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sahyadri Organic Farm"
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* Primary Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Primary Produce Category
              </label>
              <select
                value={producerCategory}
                onChange={(e) => setProducerCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Vegetables">🥦 Fresh Farm Vegetables</option>
                <option value="Grains">🌾 Grains, Rice & Pulses</option>
                <option value="Dairy">🥛 Pure Dairy & Desi Ghee</option>
                <option value="Spices">🌶️ Whole Spices & Condiments</option>
                <option value="Handicraft">🏺 Terracotta & Handicraft Goods</option>
                <option value="Textile">🧵 Handloom Cotton & Linens</option>
              </select>
            </div>

            {/* Interactive Location Picker */}
            <LocationPicker
              lat={locationLat}
              lng={locationLng}
              address={addressText}
              onChangeLat={setLocationLat}
              onChangeLng={setLocationLng}
              onChangeAddress={setAddressText}
            />

            {/* Optional ID / FPO Certificate Upload */}
            <div className="bg-earth-50 rounded-2xl p-4 border border-earth-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      ID / FPO Certificate / Aadhaar (Optional)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Uploading an ID or FPO registration unlocks the <strong>"Verified Producer"</strong> trust badge on search cards.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-earth-300 hover:bg-earth-100 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  <span>{isUploading ? 'Uploading...' : 'Choose Certificate File'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {certificateUrl && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Verified Document Attached
                  </span>
                )}
              </div>
            </div>

            {/* Submit & Redirect to First Listing */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? 'Completing Registration...' : 'Complete Registration & Add First Listing →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
