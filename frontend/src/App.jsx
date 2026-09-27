import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoUserSwitcher from './components/DemoUserSwitcher';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterBuyerPage from './pages/RegisterBuyerPage';
import AddListingPage from './pages/AddListingPage';
import SearchDiscoveryPage from './pages/SearchDiscoveryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NegotiationThreadPage from './pages/NegotiationThreadPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';
import ProducerDashboardPage from './pages/ProducerDashboardPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* 1-Click Persona & Role Switcher Bar */}
      <DemoUserSwitcher />

      {/* Main Brand Navbar */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register/producer" element={<RegisterProducerPage />} />
          <Route path="/register/buyer" element={<RegisterBuyerPage />} />
          <Route path="/add-listing" element={<AddListingPage />} />
          <Route path="/search" element={<SearchDiscoveryPage />} />
          <Route path="/listing/:id" element={<ProductDetailPage />} />
          <Route path="/negotiate/:listingId/:buyerId" element={<NegotiationThreadPage />} />
          <Route path="/order-confirmed/:id" element={<OrderConfirmedPage />} />
          <Route path="/producer-dashboard" element={<ProducerDashboardPage />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* BanaoBecho Brand Footer */}
      <Footer />
    </div>
  );
}
