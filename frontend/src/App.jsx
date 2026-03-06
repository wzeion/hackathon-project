import { Toaster } from "@/components/ui/sonner";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "./hooks/useTranslation";
import { useAppStore } from "./stores/appStore";
import { requestForToken, onMessageListener } from "./firebase";
import api from "./utils/api";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MessagesPage from "./pages/MessagesPage";
import AddProductPage from "./pages/AddProductPage";

// ── Offline indicator ─────────────────────────────────────────────────────
function OfflineBar() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      <span>
        {t("common.offline")} — {t("common.offlineDesc")}
      </span>
    </div>
  );
}

// ── Page transition wrapper ───────────────────────────────────────────────
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const { currentUser } = useAppStore();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            !currentUser ? (
              <PageTransition>
                <AuthPage />
              </PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/marketplace"
          element={
            currentUser ? (
              <PageTransition>
                <MarketplacePage />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/product/:id"
          element={
            currentUser ? (
              <PageTransition>
                <ProductDetailPage />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            currentUser ? (
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            currentUser ? (
              <PageTransition>
                <NotificationsPage />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/messages"
          element={
            currentUser ? (
              <PageTransition>
                <MessagesPage />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Dashboard Routing */}
        <Route
          path="/dashboard"
          element={
            !currentUser ? (
              <Navigate to="/login" />
            ) : (
              <PageTransition>
                {currentUser.role === "admin" ? (
                  <AdminDashboard />
                ) : currentUser.role === "farmer" ? (
                  <FarmerDashboard />
                ) : (
                  <BuyerDashboard />
                )}
              </PageTransition>
            )
          }
        />

        <Route
          path="/add-product"
          element={
            currentUser?.role === "farmer" ? (
              <PageTransition>
                <AddProductPage />
              </PageTransition>
            ) : (
              <Navigate to="/marketplace" />
            )
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            currentUser?.role === "admin" ? (
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────
export default function App() {
  const { currentUser } = useAppStore();

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        {currentUser && <Navbar />}

        <main className="flex-1 flex flex-col">
          <AnimatedRoutes />
        </main>

        {currentUser && <Footer />}

        <Toaster position="top-right" richColors />
        <OfflineBar />
      </div>
    </Router>
  );
}
