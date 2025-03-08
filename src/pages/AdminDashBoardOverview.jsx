import React, { useState, useEffect } from "react";
import axios from "axios";
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
      // Get token from local storage
      const token = localStorage.getItem("token");

      // Configure axios headers with token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        // Fetch overall metrics
        const metricsResponse = await axios.get(
          "http://localhost:5000/api/dashboard/metrics",
          config
        );

        if (metricsResponse.data) {
          setStats({
            totalUsers: metricsResponse.data.totalUsers || 0,
            totalProducts: metricsResponse.data.totalProducts || 0,
            totalOrders: metricsResponse.data.totalOrders || 0,
            totalRevenue: metricsResponse.data.totalRevenue || 0,
            lowStockProducts: metricsResponse.data.lowestStockProduct ? 1 : 0,
            pendingOrders: metricsResponse.data.pendingOrders || 0,
          });
        }

        // Fetch monthly revenue data
        const revenueResponse = await axios.get(
          "http://localhost:5000/api/dashboard/monthly-revenue",
          config
        );

        if (revenueResponse.data) {
          // Transform monthly revenue data to chart format
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const formattedRevenueData = revenueResponse.data.map(
            (value, index) => ({
              name: months[index],
              value: value,
            })
          );
          setRevenueData(formattedRevenueData);
        }

        // Fetch product category distribution
        const categoryResponse = await axios.get(
          "http://localhost:5000/api/dashboard/category-stock",
          config
        );

        if (categoryResponse.data) {
          // Transform category data to chart format
          const formattedCategoryData = categoryResponse.data.map((item) => ({
            name: item.category,
            value: item.stock,
          }));
          setProductCategoryData(formattedCategoryData);
        }

        // Fetch order status distribution
        const orderStatusResponse = await axios.get(
          "http://localhost:5000/api/dashboard/order-status",
          config
        );

        if (orderStatusResponse.data) {
          // Define colors for status
          const statusColors = {
            Delivered: "#4CAF50",
            Shipped: "#2196F3",
            Pending: "#FF9800",
            Cancelled: "#F44336",
          };

          // Transform order status data to chart format
          const formattedOrderData = Object.entries(
            orderStatusResponse.data
          ).map(([name, value]) => ({
            name,
            value,
            color: statusColors[name],
          }));
          setOrderStatusData(formattedOrderData);
        }

        // Fetch top selling products
        const topProductsResponse = await axios.get(
          "http://localhost:5000/api/dashboard/top-selling",
          config
        );

        if (topProductsResponse.data) {
          // Transform top selling products data to table format
          const formattedTopProducts = topProductsResponse.data.map(
            (product, index) => ({
              id: index + 1,
              name: product.name,
              sold: product.soldUnits,
              revenue: product.revenue,
            })
          );
          setTopSellingProducts(formattedTopProducts);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
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
      currency: "LKR",
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
              <span className="text-[60] font-bold">
                {formatCurrency(stats.totalRevenue)}
              </span>
              <span className="text-xl text-yellow-500 ml-1">💰</span>
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
                <Tooltip formatter={(value) => [`LKR ${value}`, "Revenue"]} />
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
                <Tooltip formatter={(value) => [`${value}`, "Units"]} />
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
                <Tooltip formatter={(value) => [`${value}`, "Orders"]} />
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
