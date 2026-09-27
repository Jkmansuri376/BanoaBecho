import React, { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

const PRESET_CLUSTERS = [
  { name: 'Shivajinagar Agri Zone (Central)', lat: 18.5312, lng: 73.8445 },
  { name: 'Hinjawadi Agro Hub (West)', lat: 18.5793, lng: 73.7428 },
  { name: 'Hadapsar Industrial Estate (East)', lat: 18.5089, lng: 73.9254 },
  { name: 'Katraj Agro Belt (South)', lat: 18.4578, lng: 73.8821 },
  { name: 'Bhosari Mandi Bypass (North)', lat: 18.6278, lng: 73.8132 },
  { name: 'Koregaon Park & Camp Hub', lat: 18.5362, lng: 73.8298 }
];

export default function LocationPicker({
  lat,
  lng,
  address,
  onChangeLat,
  onChangeLng,
  onChangeAddress
}) {
  const [useManualInput, setUseManualInput] = useState(false);

  const handleSelectPreset = (preset) => {
    onChangeLat(preset.lat);
    onChangeLng(preset.lng);
    if (!address || address.includes('Agri') || address.includes('Hub') || address.includes('Pune')) {
      onChangeAddress(`${preset.name}, Pune, Maharashtra`);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChangeLat(parseFloat(pos.coords.latitude.toFixed(4)));
          onChangeLng(parseFloat(pos.coords.longitude.toFixed(4)));
          if (!address) onChangeAddress('Current GPS Coordinates, Maharashtra');
        },
        () => {
          // Default fallback
          onChangeLat(18.5204);
          onChangeLng(73.8567);
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-earth-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-600" />
          Location & Hyperlocal Geo Coordinates
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1 underline underline-offset-2"
        >
          <Navigation className="w-3.5 h-3.5" />
          Detect My Location
        </button>
      </div>

      {/* Address Text */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
          Full Street / Facility / Farm Address
        </label>
        <input
          type="text"
          value={address || ''}
          onChange={(e) => onChangeAddress(e.target.value)}
          placeholder="e.g. Survey 42, Shivajinagar Agro Cluster, Pune, Maharashtra"
          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      {/* Quick Hyperlocal Cluster Selection Chips */}
      <div>
        <span className="block text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-ochre-600" />
          Quick Select Hyperlocal Cluster (Within 20km Demo Zone):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_CLUSTERS.map((preset) => {
            const isMatch =
              Math.abs((lat || 0) - preset.lat) < 0.005 &&
              Math.abs((lng || 0) - preset.lng) < 0.005;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-xl text-left text-[11px] font-semibold border transition ${
                  isMatch
                    ? 'bg-brand-50 border-brand-600 text-brand-900 shadow-sm ring-1 ring-brand-600'
                    : 'bg-earth-50/70 border-earth-200 hover:bg-earth-100 text-gray-700'
                }`}
              >
                <div className="font-bold truncate">{preset.name}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {preset.lat}, {preset.lng}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lat / Lng inputs */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-earth-100">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            Latitude (°N)
          </label>
          <input
            type="number"
            step="any"
            value={lat || 18.5204}
            onChange={(e) => onChangeLat(parseFloat(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-earth-300 bg-earth-50/50"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">
            Longitude (°E)
          </label>
          <input
            type="number"
            step="any"
            value={lng || 73.8567}
            onChange={(e) => onChangeLng(parseFloat(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-earth-300 bg-earth-50/50"
            required
          />
        </div>
      </div>
    </div>
  );
}
