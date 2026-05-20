import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  (window as any).__SUPABASE_URL__,
  (window as any).__SUPABASE_KEY__
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbPass, setDbPass] = useState<string | null>(null);

  const fallbackPass =
    (typeof window !== "undefined" && (window as any).__ADMIN_PASS__) ||
    "iDaPro2024";

  // Load password from database on mount
  useEffect(() => {
    async function loadPassword() {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "adminPassword")
        .single();
      if (data?.value) {
        setDbPass(data.value);
      }
    }
    loadPassword();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password.trim()) {
      setError("Please enter password");
      setLoading(false);
      return;
    }

    // Use database password if available, otherwise fallback
    const effectivePass = dbPass || fallbackPass;

    if (password === effectivePass) {
      localStorage.setItem("adminToken", "iDaPro_admin_token_" + Date.now());
      navigate("/admin/dashboard");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#FF9900]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-[#FF9900]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Admin Login
            </h1>
            <p className="text-sm text-gray-500">
              iDaPro Management Console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] text-sm"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#FF9900] hover:bg-[#E68A00] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
