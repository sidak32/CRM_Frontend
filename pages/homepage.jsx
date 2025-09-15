import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// API configuration
const API_BASE_URL = "https://crm-backend-4ng3.onrender.com/api"; // changed port to backend (5001)

// API functions to connect with your backend
const api = {
  createCampaign: async (campaignData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/createcampaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Create campaign error:", error);
      throw error;
    }
  },

  getAllCampaigns: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getallcampaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get campaigns error:", error);
      throw error;
    }
  },

  getCampaignById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getcampaignbyid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get campaign by ID error:", error);
      throw error;
    }
  },

  getCampaignStats: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get campaign stats error:", error);
      throw error;
    }
  },

  updateCampaignDelivery: async (deliveryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/delivery`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Update campaign delivery error:", error);
      throw error;
    }
  },
};

const CampaignManagementApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      setError(
        "Failed to load campaigns. Please check your connection and try again."
      );
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCampaigns = () => {
    loadCampaigns();
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        color:
          "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200",
        icon: Clock,
      },
      running: {
        color:
          "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
        icon: Play,
      },
      completed: {
        color:
          "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${config.color}`}
      >
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const CreateCampaignForm = ({ onCampaignCreated }) => {
    const [formData, setFormData] = useState({
      title: "",
      message: "",
      segmentRules: {
        spend: "",
        visits: "",
      },
      messageVariants: [],
    });
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState(null);

    const validateForm = () => {
      if (!formData.title.trim()) {
        setFormError("Campaign title is required");
        return false;
      }
      if (!formData.message.trim()) {
        setFormError("Campaign message is required");
        return false;
      }

      // Validate segment rules format
      const { spend, visits } = formData.segmentRules;
      const validateRule = (rule) => {
        if (!rule.trim()) return true; // Empty is okay
        return /^[><=]\d+(\.\d+)?$/.test(rule.trim());
      };

      if (!validateRule(spend)) {
        setFormError("Spend rule format should be like: >1000, <500, =100");
        return false;
      }
      if (!validateRule(visits)) {
        setFormError("Visits rule format should be like: >5, <10, =3");
        return false;
      }

      setFormError(null);
      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      setCreating(true);
      setFormError(null);

      try {
        const campaignData = {
          title: formData.title.trim(),
          message: formData.message.trim(),
          segmentRules: Object.fromEntries(
            Object.entries(formData.segmentRules).filter(([, value]) =>
              value.trim()
            )
          ),
          messageVariants: formData.messageVariants.filter((variant) =>
            variant.trim()
          ),
        };

        const result = await api.createCampaign(campaignData);
        onCampaignCreated(result);

        // Reset form
        setFormData({
          title: "",
          message: "",
          segmentRules: { spend: "", visits: "" },
          messageVariants: [],
        });
      } catch (error) {
        console.error("Failed to create campaign:", error);
        setFormError("Failed to create campaign. Please try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Campaign
          </h2>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <span className="text-sm font-medium">{formError}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Campaign Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="e.g., Diwali Discount Campaign"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Message Template *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Hi [name], get 20% OFF this Diwali!"
              required
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Use [name] for personalization
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Audience Segmentation Rules
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <label className="block text-xs font-medium text-green-700 mb-2">
                  Customer Spend
                </label>
                <input
                  type="text"
                  value={formData.segmentRules.spend}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      segmentRules: {
                        ...formData.segmentRules,
                        spend: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                  placeholder=">10000"
                />
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <label className="block text-xs font-medium text-purple-700 mb-2">
                  Visit Count
                </label>
                <input
                  type="text"
                  value={formData.segmentRules.visits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      segmentRules: {
                        ...formData.segmentRules,
                        visits: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  placeholder="<5"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
              Use &gt;, &lt;, or = operators (e.g., &gt;1000, &lt;5, =10)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={creating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating Campaign...
              </>
            ) : (
              <>
                <Send size={18} />
                Create & Launch Campaign
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const CampaignDashboard = () => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === "running"
    ).length;
    const completedCampaigns = campaigns.filter(
      (c) => c.status === "completed"
    ).length;
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalFailed = campaigns.reduce(
      (sum, c) => sum + (c.failedCount || 0),
      0
    );
    const totalAudience = campaigns.reduce(
      (sum, c) => sum + (c.audienceSize || 0),
      0
    );

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Campaigns
                </p>
                <p className="text-3xl font-bold">{totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Campaigns
                </p>
                <p className="text-3xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Messages Sent
                </p>
                <p className="text-3xl font-bold">
                  {totalSent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Total Audience
                </p>
                <p className="text-3xl font-bold">
                  {totalAudience.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  All Campaigns
                </h2>
              </div>
              <button
                onClick={refreshCampaigns}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg disabled:opacity-50 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading ? "animate-spin text-blue-600" : "text-gray-600"
                  }
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4 font-medium">
                Loading campaigns...
              </p>
            </div>
          ) : campaigns.length === 0 && !error ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium">
                No campaigns found. Create your first campaign to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {campaigns.map((campaign, index) => {
                    const totalProcessed =
                      (campaign.sentCount || 0) + (campaign.failedCount || 0);
                    const successRate =
                      totalProcessed > 0
                        ? ((campaign.sentCount || 0) / totalProcessed) * 100
                        : 0;

                    // Color coding for rows based on performance
                    const rowBgColor =
                      successRate >= 80
                        ? "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
                        : successRate >= 60
                        ? "hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50"
                        : "hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50";

                    // Avatar colors
                    const avatarColors = [
                      "bg-gradient-to-r from-blue-500 to-indigo-600",
                      "bg-gradient-to-r from-green-500 to-emerald-600",
                      "bg-gradient-to-r from-purple-500 to-violet-600",
                      "bg-gradient-to-r from-pink-500 to-rose-600",
                      "bg-gradient-to-r from-yellow-500 to-orange-600",
                      "bg-gradient-to-r from-cyan-500 to-teal-600",
                    ];

                    return (
                      <tr
                        key={campaign._id}
                        className={`transition-all duration-200 ${rowBgColor}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                                avatarColors[index % avatarColors.length]
                              }`}
                            >
                              {campaign.title?.charAt(0) || "C"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {campaign.title}
                              </div>
                              <div
                                className="text-sm text-gray-500 truncate max-w-xs"
                                title={campaign.message}
                              >
                                {campaign.message}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">
                              {(campaign.audienceSize || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-green-600">
                              {(campaign.sentCount || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-red-600">
                              {(campaign.failedCount || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                              <div
                                className={`h-2 rounded-full ${
                                  successRate >= 80
                                    ? "bg-gradient-to-r from-green-400 to-green-500"
                                    : successRate >= 60
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                    : "bg-gradient-to-r from-red-400 to-red-500"
                                }`}
                                style={{
                                  width: `${Math.max(successRate, 5)}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-sm font-bold ${
                                successRate >= 80
                                  ? "text-green-600"
                                  : successRate >= 60
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            >
                              {successRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {campaign.createdAt
                            ? new Date(campaign.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Campaign Manager
              </h1>
              <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-200">
                {API_BASE_URL.includes("localhost")
                  ? "Development"
                  : "Production"}
              </span>
            </div>
            <div className="flex space-x-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1 shadow-inner">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-white text-gray-900 shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "create"
                    ? "bg-white text-gray-900 shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" ? (
          <CampaignDashboard />
        ) : (
          <CreateCampaignForm
            onCampaignCreated={(result) => {
              alert(
                `Campaign created successfully!\nCampaign ID: ${result.campaignId}\nAudience Size: ${result.audienceSize}`
              );
              loadCampaigns(); // Refresh the campaigns list
              setActiveTab("dashboard"); // Switch back to dashboard
            }}
          />
        )}
      </main>
    </div>
  );
};

export default CampaignManagementApp;
