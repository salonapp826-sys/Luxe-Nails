import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { HomePage } from '@/pages/HomePage';
import { BookingPage } from '@/pages/BookingPage';
import { BookingStatusPage } from '@/pages/BookingStatusPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminSignupPage } from '@/pages/AdminSignupPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ReviewsPage } from '@/pages/ReviewsPage';
import WhatsAppLeadsPage from '@/pages/WhatsAppLeadsPage';
import GalleryPage from '@/pages/GalleryPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import PackagesPage from '@/pages/PackagesPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ServicesPage from '@/pages/ServicesPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import { Toaster } from '@/components/ui/toaster';
import { WhatsAppButton } from '@/components/features/WhatsAppButton';
import { MobileOverflowDiagnostic } from '@/components/common/MobileOverflowDiagnostic';
import { SystemStatusIndicator } from '@/components/common/SystemStatusIndicator';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background pb-24 md:pb-0">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/site/:tenantId" element={<HomePage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/site/:tenantId/book" element={<BookingPage />} />
                <Route path="/booking-status/:bookingId" element={<BookingStatusPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/site/:tenantId/reviews" element={<ReviewsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/site/:tenantId/services" element={<ServicesPage />} />
                <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/site/:tenantId/gallery" element={<GalleryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/site/:tenantId/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/site/:tenantId/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/site/:tenantId/packages" element={<PackagesPage />} />
                
                {/* Protected Customer Routes */}
                <Route path="/my-bookings" element={
                  <ProtectedRoute allowedRoles={['customer', 'shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/site/:tenantId/my-bookings" element={
                  <ProtectedRoute allowedRoles={['customer', 'shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['customer', 'shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <UserProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/loyalty" element={
                  <ProtectedRoute allowedRoles={['customer', 'shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <UserProfilePage />
                  </ProtectedRoute>
                } />

                {/* Public Auth Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/signup" element={<AdminSignupPage />} />

                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/customizer" element={<Navigate to="/admin/dashboard?tab=customizer" replace />} />
                <Route path="/admin/whatsapp-leads" element={
                  <ProtectedRoute allowedRoles={['shop_owner', 'admin', 'owner', 'manager', 'receptionist']}>
                    <WhatsAppLeadsPage />
                  </ProtectedRoute>
                } />
              </Routes>
              <Footer />
              <WhatsAppButton />
              <MobileBottomNav />
              <MobileOverflowDiagnostic />
              <SystemStatusIndicator />
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TenantProvider>
    </ErrorBoundary>
  );
}

export default App;
