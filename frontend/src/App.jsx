import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";

//ADMIN PAGES//
import AdminDashboard from "./pages/admin/AdminDashboard";
import Businesses from "./pages/admin/Businesses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

//PROVIDER PAGES//
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import CreateBusiness from "./pages/provider/CreateBusiness";
import Services from "./pages/provider/Services";
import ProviderBookings from "./pages/provider/ProviderBookings";
import Reviews from "./pages/provider/Reviews";
import ProviderChat from "./pages/provider/ProviderChat";
import ProviderPayments from "./pages/provider/ProviderPayments";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderSettings from "./pages/provider/ProviderSettings";
import ProviderNotifications from "./pages/provider/ProviderNotifications";

// CUSTOMER PAGES//
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookService from "./pages/customer/BookService";
import CustomerBookings from "./pages/customer/CustomerBookings";
import Payments from "./pages/customer/Payments";
import CustomerFavorites from "./pages/customer/CustomerFavorites";
import CustomerChat from "./pages/customer/CustomerChat";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerSettings from "./pages/customer/CustomerSettings";
import PaymentSuccess from "./pages/customer/PaymentSuccess";
import Wallet from "./pages/customer/Wallet";

//PUBLIC PAGES//
import Home from "./pages/public/Home";
import Marketplace from "./pages/public/Marketplace";
import Notifications from "./pages/public/Notifications";
import Chat from "./pages/public/Chat";

//COMPONENTS//
import RealtimeNotifications from "./components/RealtimeNotifications";

import AdminRoute from "./routes/AdminRoute";
import ProviderRoute from "./routes/ProviderRoute";
import CustomerRoute from "./routes/CustomerRoute";

function App() {
  return (
    <BrowserRouter>
      <RealtimeNotifications />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        // ADMIN ROUTES//
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/businesses"
          element={
            <AdminRoute>
              <Businesses />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <AdminNotifications />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        // PROVIDER ROUTES//
        <Route
          path="/provider/dashboard"
          element={
            <ProviderRoute>
              <ProviderDashboard />
            </ProviderRoute>
          }
        />
        <Route
          path="/provider/create-business"
          element={
            <ProviderRoute>
              <CreateBusiness />
            </ProviderRoute>
          }
        />
        <Route
          path="/provider/services"
          element={
            <ProviderRoute>
              <Services />
            </ProviderRoute>
          }
        />
        <Route
          path="/provider/bookings"
          element={
            <ProviderRoute>
              <ProviderBookings />
            </ProviderRoute>
          }
        />
        <Route
          path="/provider/reviews"
          element={
            <ProviderRoute>
              <Reviews />
            </ProviderRoute>
          }
        />
        <Route path="/provider/chat" element={<ProviderChat />} />
        <Route path="/provider/payments" element={<ProviderPayments />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/settings" element={<ProviderSettings />} />
        <Route
          path="/provider/notifications"
          element={<ProviderNotifications />}
        />

        // CUSTOMER ROUTES//
        <Route
          path="/customer/dashboard"
          element={
            <CustomerRoute>
              <CustomerDashboard />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/book-service"
          element={
            <CustomerRoute>
              <BookService />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <CustomerRoute>
              <CustomerBookings />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <CustomerRoute>
              <Payments />
            </CustomerRoute>
          }
        />
        <Route path="/customer/favorites" element={<CustomerFavorites />} />
        <Route path="/customer/chat" element={<CustomerChat />} />
        <Route
          path="/customer/notifications"
          element={<CustomerNotifications />}
        />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/settings" element={<CustomerSettings />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/customer/wallet" element={<Wallet />} />

        //PUBLIC ROUTES//
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/services" element={<Marketplace />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
