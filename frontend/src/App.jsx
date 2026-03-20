import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { trackPageView } from "./utils/analytics.js";

// Map path prefixes to human-readable section names
const SECTION_MAP = [
  ["/services/visa-services", "Visa Services"],
  ["/services/citizenship", "Citizenship"],
  ["/services/consular-processing", "Consular Processing"],
  ["/services/family-petition", "Family Petition"],
  ["/services/asylum", "Asylum"],
  ["/services/adjustment-of-status", "Adjustment of Status"],
  ["/services/work-permit", "Work Permit"],
  ["/services", "Services"],
  ["/admin", "Admin"],
  ["/client", "Client Dashboard"],
  ["/blog", "Blog"],
  ["/contact", "Contact"],
  ["/login", "Login"],
  ["/about", "About"],
  ["/", "Home"],
];

function getSectionName(pathname) {
  const match = SECTION_MAP.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : "Other";
}

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, getSectionName(location.pathname));
  }, [location.pathname]);
  return null;
}

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";

// services pages
import Citizenship from "./pages/Citizenship.jsx";
import ConsularProcessing from "./pages/ConsularProcessing.jsx";
import FamilyPetition from "./pages/FamilyPetition.jsx";
import VisaServices from "./pages/VisaServices.jsx";
import FamilyVisas from "./pages/FamilyVisas.jsx";
import FianceVisa from "./pages/FianceVisa.jsx";
import StudentVisas from "./pages/StudentVisas.jsx";
import TouristVisas from "./pages/TouristVisas.jsx";
import Asylum from "./pages/Asylum.jsx";
import AdjustmentStatus from "./pages/AdjustmentStatus.jsx";
import WorkPermit from "./pages/WorkPermit.jsx";

import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";

import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Legal from "./pages/Legal.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminPosts from "./pages/AdminPosts.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import Messages from "./pages/Messages.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";

import MfaSetup from "./pages/MfaSetup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

export default function App() {
  return (
    <>
      <Analytics />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        {/* Services */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/citizenship" element={<Citizenship />} />
        <Route path="/services/consular-processing" element={<ConsularProcessing />} />
        <Route path="/services/family-petition" element={<FamilyPetition />} />
        <Route path="/services/asylum" element={<Asylum />} />
        <Route path="/services/adjustment-of-status" element={<AdjustmentStatus />} />
        <Route path="/services/work-permit" element={<WorkPermit />} />
        {/* Visas */}
        <Route path="/services/visa-services" element={<VisaServices />} />
        <Route path="/services/visa-services/family-visas" element={<FamilyVisas />} />
        <Route path="/services/visa-services/fiance-visas" element={<FianceVisa />} />
        <Route path="/services/visa-services/student-visas" element={<StudentVisas />} />
        <Route path="/services/visa-services/tourist-visas" element={<TouristVisas />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin-only routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<ProtectedRoute requiredRole="admin"><AdminPosts /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><Messages /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />

        {/* Client-only routes */}
        <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />

        {/* Any logged-in user */}
        <Route path="/mfa" element={<ProtectedRoute><MfaSetup /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
}

