import { Routes, Route, useLocation } from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SitemapXml from "./pages/SitemapXml";
import RobotsTxt from "./pages/RobotsTxt";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Check if current path is an admin route (with optional country prefix)
function isAdminPath(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  // Allow any 2-letter country code prefix before /admin (e.g. /us/admin, /uk/admin)
  if (segments.length >= 2 && /^[a-z]{2}$/i.test(segments[0]) && segments[1] === "admin") return true;
  if (segments[0] === "admin") return true;
  return false;
}

export default function App() {
  const location = useLocation();
  const admin = isAdminPath(location.pathname);

  if (admin) {
    return (
      <ErrorBoundary>
        <Routes location={location}>
          <Route path="/:country?/admin" element={<AdminLogin />} />
          <Route path="/:country?/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Routes location={location}>
          <Route path="/:country?" element={<Home />} />
          <Route path="/:country?/product/:id" element={<ProductDetail />} />
          <Route path="/:country?/category/:slug" element={<Home />} />
          <Route path="/:country?/about" element={<About />} />
          <Route path="/:country?/contact" element={<Contact />} />
          <Route path="/:country?/sitemap.xml" element={<SitemapXml />} />
          <Route path="/:country?/robots.txt" element={<RobotsTxt />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}
