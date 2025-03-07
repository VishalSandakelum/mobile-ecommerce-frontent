import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [productCategoryData, setProductCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch overall stats
        const statsResponse = await fetch(
          "http://localhost:5000/api/admin/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalProducts: statsData.totalProducts || 0,
            totalOrders: statsData.totalOrders || 0,
            totalRevenue: statsData.totalRevenue || 0,
            lowStockProducts: statsData.lowStockProducts || 0,
            pendingOrders: statsData.pendingOrders || 0,
          });
        }

        // Fetch revenue data
        const revenueResponse = await fetch(
          "http://localhost:5000/api/admin/dashboard/revenue",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (revenueResponse.ok) {
          const revenueData = await revenueResponse.json();
          setRevenueData(revenueData.data || []);
        }

        // Fetch product category distribution
        const categoryResponse = await fetch(
          "http://localhost:5000/api/admin/dashboard/categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setProductCategoryData(categoryData.data || []);
        }

        // Fetch order status distribution
        const orderStatusResponse = await fetch(
          "http://localhost:5000/api/admin/dashboard/order-status",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (orderStatusResponse.ok) {
          const orderStatusData = await orderStatusResponse.json();
          setOrderStatusData(orderStatusData.data || []);
        }

        // Fetch top selling products
        const topProductsResponse = await fetch(
          "http://localhost:5000/api/admin/dashboard/top-products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (topProductsResponse.ok) {
          const topProductsData = await topProductsResponse.json();
          setTopSellingProducts(topProductsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();

    // For demo purposes, let's set some sample data
    // Remove this in production and rely on the API responses
    setRevenueData([
      { name: "Jan", value: 5000 },
      { name: "Feb", value: 7500 },
      { name: "Mar", value: 6800 },
      { name: "Apr", value: 9000 },
      { name: "May", value: 8200 },
      { name: "Jun", value: 11000 },
    ]);

    setProductCategoryData([
      { name: "Smartphones", value: 45 },
      { name: "Accessories", value: 25 },
      { name: "Tablets", value: 15 },
      { name: "Wearables", value: 10 },
      { name: "Other", value: 5 },
    ]);

    setOrderStatusData([
      { name: "Delivered", value: 65, color: "#4CAF50" },
      { name: "Processing", value: 20, color: "#2196F3" },
      { name: "Pending", value: 10, color: "#FF9800" },
      { name: "Cancelled", value: 5, color: "#F44336" },
    ]);

    setTopSellingProducts([
      { id: 1, name: "iPhone 14 Pro", sold: 324, revenue: 389999 },
      { id: 2, name: "Samsung Galaxy S23", sold: 256, revenue: 279999 },
      { id: 3, name: "AirPods Pro", sold: 187, revenue: 46750 },
      { id: 4, name: "iPad Air", sold: 142, revenue: 170399 },
      { id: 5, name: "Apple Watch Series 8", sold: 98, revenue: 107800 },
    ]);

    setStats({
      totalUsers: 1245,
      totalProducts: 378,
      totalOrders: 892,
      totalRevenue: 1257850,
      lowStockProducts: 12,
      pendingOrders: 37,
    });
  }, []);

  const recentActivities = [
    {
      id: 1,
      type: "New Order",
      details: "Order #10892 - iPhone 14 Pro",
      time: "15 minutes ago",
    },
    {
      id: 2,
      type: "Low Stock Alert",
      details: "Samsung Galaxy S23 - Only 3 left",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "Payment Received",
      details: "Order #10891 - $1,299.99",
      time: "2 hours ago",
    },
    {
      id: 4,
      type: "New User Registration",
      details: "user@example.com",
      time: "3 hours ago",
    },
    {
      id: 5,
      type: "Product Updated",
      details: "AirPods Pro - Price changed",
      time: "5 hours ago",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Mobile Shop Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-xl text-blue-500 ml-2">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">
                {stats.totalProducts.toLocaleString()}
              </span>
              <span className="text-xl text-purple-500 ml-2">📱</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">
                {stats.totalOrders.toLocaleString()}
              </span>
              <span className="text-xl text-green-500 ml-2">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </span>
              <span className="text-xl text-yellow-500 ml-2">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">
                {stats.lowStockProducts}
              </span>
              <span className="text-xl text-orange-500 ml-2">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
            <div className="flex items-center mt-2">
              <span className="text-xl font-bold">{stats.pendingOrders}</span>
              <span className="text-xl text-red-500 ml-2">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {productCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 45}, 70%, 60%)`}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Status and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Bar dataKey="value">
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSellingProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
