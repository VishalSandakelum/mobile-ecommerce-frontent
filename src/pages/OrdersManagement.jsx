import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersManagement = () => {
  // State variables
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  // Fetch all orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders whenever filter criteria changes
  useEffect(() => {
    filterOrders();
  }, [orders, selectedCategory, searchQuery, startDate, endDate]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("http://localhost:5000/api/order/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data.orders);

      setOrders(response.data.orders);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch orders"
      );
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        "http://localhost:5000/api/order/one",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedOrder(response.data.order);
      setShowModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch order details"
      );
      console.error("Error fetching order details:", err);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        "http://localhost:5000/api/order/update",
        { orderId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUpdateMessage(
        response.data.message || "Order status updated successfully"
      );

      // Update local state after successful API call
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      // If the updated order is currently being viewed, update that too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      // Show success message for 3 seconds
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status"
      );
      console.error("Error updating order status:", err);
    }
  };

  // Filter orders based on category, search query, and date range
  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((order) => order.status === selectedCategory);
    }

    // Filter by search query (customer name, email, or phone)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.user_id.name.toLowerCase().includes(query) ||
          order.user_id.email.toLowerCase().includes(query) ||
          order.user_id.phone_number.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Include the entire end date

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.order_date);
        return orderDate >= start && orderDate <= end;
      });
    } else if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(
        (order) => new Date(order.order_date) >= start
      );
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Include the entire end date
      filtered = filtered.filter((order) => new Date(order.order_date) <= end);
    }

    setFilteredOrders(filtered);
  };

  // Check if order is within 24 hours
  const isWithin24Hours = (orderDate) => {
    const now = new Date();
    const orderDateTime = new Date(orderDate);
    const diffInHours = (now - orderDateTime) / (1000 * 60 * 60);
    return diffInHours >= 24;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodBadge = (isCard) => {
    console.log(isCard);
    if (isCard) {
      return {
        text: "Card",
        class: "bg-purple-100 text-purple-800",
      };
    } else {
      return {
        text: "Cash",
        class: "bg-gray-100 text-gray-800",
      };
    }
  };

  // Modal for viewing order details
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b p-6">
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <button
              className="text-gray-400 hover:text-gray-500 text-2xl focus:outline-none"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Order Information
                </h3>
                <p className="mb-2">
                  <span className="font-medium">Order ID:</span>{" "}
                  {selectedOrder._id}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-sm rounded-full ${getStatusColorClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="font-medium">Order Date:</span>{" "}
                  {formatDate(selectedOrder.order_date)}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Total Price:</span> LKR
                  {selectedOrder.total_price.toFixed(2)}
                </p>
                {/* Added new payment method display */}
                <p className="mb-2">
                  <span className="font-medium">Payment Method:</span>{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-sm rounded-full ${
                      getPaymentMethodBadge(selectedOrder.payment).class
                    }`}
                  >
                    {getPaymentMethodBadge(selectedOrder.payment).text}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Customer Information
                </h3>
                <p className="mb-2">
                  <span className="font-medium">Name:</span>{" "}
                  {selectedOrder.user_id.name}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOrder.user_id.email}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOrder.user_id.phone_number}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Address:</span>{" "}
                  {selectedOrder.user_id.address}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Order Items
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product_id.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          LKR {item.product_id.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          LKR {item.subtotal_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isWithin24Hours(selectedOrder.order_date) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Update Status
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, updateStatus)
                    }
                    disabled={!updateStatus}
                    className={`rounded-md py-2 px-4 text-sm font-medium text-white focus:outline-none ${
                      updateStatus
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Orders Management
      </h1>

      {/* Filter Controls */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="w-full md:w-auto md:flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by customer name, email or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Status message */}
      {updateMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
          {updateMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-500">
            Showing {filteredOrders.length} orders
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  {/* Added new Payment column */}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9" // Updated to account for the new column
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user_id.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user_id.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user_id.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        LKR {order.total_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      {/* Added new Payment method column display */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getPaymentMethodBadge(order.payment).class
                          }`}
                        >
                          {getPaymentMethodBadge(order.payment).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                          onClick={() => fetchOrderDetails(order._id)}
                        >
                          View
                        </button>

                        <button
                          className={`${
                            isWithin24Hours(order.order_date)
                              ? "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                              : "text-gray-400 bg-gray-100 cursor-not-allowed"
                          } px-3 py-1 rounded-md`}
                          onClick={() => {
                            if (isWithin24Hours(order.order_date)) {
                              setSelectedOrder(order);
                              setUpdateStatus("");
                              setShowModal(true);
                            }
                          }}
                          disabled={!isWithin24Hours(order.order_date)}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {showModal && <OrderDetailsModal />}
    </div>
  );
};

export default OrdersManagement;
