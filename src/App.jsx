import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingSocial from './components/common/FloatingSocial';
import Home from './pages/Home';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useStore';

const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ForgotPassword = lazy(() => import('./pages/Password/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Password/ResetPassword'));
const OtpVerification = lazy(() => import('./pages/Password/OtpVerification'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfServices = lazy(() => import('./pages/TermsOfServices'));

const PageFallback = () => (
  <div className="container-bound py-16">
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-primary-500" />
  </div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const { userInfo, hydrateAuth } = useAuthStore();

  useEffect(() => {
    if (userInfo?.token) {
      hydrateAuth();
      return;
    }

    useAuthStore.getState().markHydrated();
  }, [userInfo?.token, hydrateAuth]);

  return (
    <Router>
      <ScrollToTop />

      <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-dark-text transition-colors duration-300 font-sans">
        
        <Navbar />

        <main className="flex-grow pt-20">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfServices />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route path="/otp/:email" element={<OtpVerification />} />
              <Route path="/password/forgot" element={<ForgotPassword />} />
              <Route path="/password/reset/:token" element={<ResetPassword />} />

              <Route path="/product/:id" element={<ProductDetails />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute sellerOnly />}>
                <Route path="/admin" element={<Navigate to="/admin/sales-report" replace />} />
                <Route path="/admin/business-summary" element={<Dashboard />} />
                <Route path="/admin/add-product" element={<Dashboard />} />
                <Route path="/admin/performances" element={<Dashboard />} />
                <Route path="/admin/manage-products" element={<Dashboard />} />
                <Route path="/admin/add-promo-code" element={<Dashboard />} />
                <Route path="/admin/messages" element={<Dashboard />} />
                <Route path="/admin/edit-product/:id" element={<Dashboard />} />
                <Route path="/admin/orders" element={<Dashboard />} />
                <Route path="/admin/upload-stock-sheet" element={<Dashboard />} />
                <Route path="/admin/stock-inward" element={<Dashboard />} />
                <Route path="/admin/sales-report" element={<Dashboard />} />
                <Route path="/admin/offline-sales" element={<Dashboard />} />
                <Route path="/admin/bat-repair" element={<Dashboard />} />
                <Route path="/admin/expenses" element={<Dashboard />} />
              </Route>

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <FloatingSocial />

        <Toaster 
          position="bottom-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#10141d',
              color: '#fff',
              borderRadius: '18px',
              padding: '16px 18px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px -24px rgba(0,0,0,0.75)',
            }
          }} 
        />

      </div>
    </Router>
  );
};

export default App;
