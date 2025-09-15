import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      // 🔥 Call backend login API
      const res = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid login");
      }

      // ✅ Save JWT token
      localStorage.setItem("token", data.token);

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/homepage"); // redirect to homepage
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-10 relative">
            <div className="space-y-8 relative z-10">
              {/* ✅ Success Message */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-green-700">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{success}</span>
                </div>
              )}

              {/* ❌ Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg text-red-700">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <div className="p-1 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-xl"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg"
              >
                {loading ? "Signing in..." : "Sign In to CRM"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm">
          <p className="text-gray-400 mb-2">&copy; 2025 CRM Platform. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-gray-500">
            <button className="hover:text-blue-600">Privacy Policy</button>
            <button className="hover:text-blue-600">Terms of Service</button>
            <button className="hover:text-blue-600">Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
