import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentManagement = () => {
  // State management
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    startDate: "",
    endDate: "",
    paymentStatus: "",
    paymentMethod: "",
    userName: "",
    orderId: "",
  });

  // API configuration
  const API_URL = "http://localhost:5000/api";
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch all payments
  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/payment/all`,
        getAuthHeader()
      );
      if (response.data && response.data.payments) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch payments. Please try again later.");
      setLoading(false);
      console.error("Error fetching payments:", err);
    }
  };

  // Fetch a single payment by order ID
  const fetchPaymentByOrderId = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/payment/one`,
        { orderId },
        getAuthHeader()
      );
      if (response.data && response.data.payment) {
        setSelectedPayment(response.data.payment);
        setShowPaymentDetails(true);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch payment details. Please try again later.");
      setLoading(false);
      console.error("Error fetching payment details:", err);
    }
  };

  // Handle search filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters to payments
  const applyFilters = () => {
    let result = [...payments];

    // Filter by date range
    if (searchFilters.startDate && searchFilters.endDate) {
      const startDate = new Date(searchFilters.startDate);
      const endDate = new Date(searchFilters.endDate);
      result = result.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Filter by payment status
    if (searchFilters.paymentStatus) {
      result = result.filter(
        (payment) =>
          payment.payment_status.toLowerCase() ===
          searchFilters.paymentStatus.toLowerCase()
      );
    }

    // Filter by payment method
    if (searchFilters.paymentMethod) {
      result = result.filter(
        (payment) =>
          payment.payment_method.toLowerCase() ===
          searchFilters.paymentMethod.toLowerCase()
      );
    }

    // Filter by user name
    if (searchFilters.userName) {
      result = result.filter((payment) =>
        payment.user_id.name
          .toLowerCase()
          .includes(searchFilters.userName.toLowerCase())
      );
    }

    // Filter by order ID
    if (searchFilters.orderId) {
      result = result.filter((payment) =>
        payment.order_id._id
          .toLowerCase()
          .includes(searchFilters.orderId.toLowerCase())
      );
    }

    setFilteredPayments(result);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchFilters({
      startDate: "",
      endDate: "",
      paymentStatus: "",
      paymentMethod: "",
      userName: "",
      orderId: "",
    });
    setFilteredPayments(payments);
  };

  // Group payments by payment method
  const getPaymentsByMethod = () => {
    const groupedPayments = {};
    filteredPayments.forEach((payment) => {
      const method = payment.payment_method;
      if (!groupedPayments[method]) {
        groupedPayments[method] = [];
      }
      groupedPayments[method].push(payment);
    });
    return groupedPayments;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Close payment details modal
  const closePaymentDetails = () => {
    setShowPaymentDetails(false);
    setSelectedPayment(null);
  };

  // Load payments on component mount
  useEffect(() => {
    fetchAllPayments();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [searchFilters]);

  // Get unique payment statuses for the dropdown
  const getUniquePaymentStatuses = () => {
    const statuses = new Set();
    payments.forEach((payment) => {
      statuses.add(payment.payment_status);
    });
    return Array.from(statuses);
  };

  // Get unique payment methods for the dropdown
  const getUniquePaymentMethods = () => {
    const methods = new Set();
    payments.forEach((payment) => {
      methods.add(payment.payment_method);
    });
    return Array.from(methods);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Payment Management
        </h1>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-red-500">×</span>
            </button>
          </div>
        )}

        {/* Search filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Search & Filter Payments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={searchFilters.startDate}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={searchFilters.endDate}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={searchFilters.paymentStatus}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                {getUniquePaymentStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={searchFilters.paymentMethod}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">All Methods</option>
                {getUniquePaymentMethods().map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={searchFilters.userName}
                onChange={handleFilterChange}
                placeholder="Search by user name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID
              </label>
              <input
                type="text"
                name="orderId"
                value={searchFilters.orderId}
                onChange={handleFilterChange}
                placeholder="Search by order ID"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Payments by category */}
        {!loading && filteredPayments.length > 0 && (
          <div className="space-y-8">
            {Object.entries(getPaymentsByMethod()).map(
              ([method, methodPayments]) => (
                <div
                  key={method}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      {method} Payments ({methodPayments.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
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
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Order Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Payment Status
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {methodPayments.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.order_id._id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.user_id.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.user_id.phone_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              LKR {payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.order_id.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.order_id.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : payment.order_id.status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {payment.order_id.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.payment_status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.payment_status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : payment.payment_status === "Failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {payment.payment_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  fetchPaymentByOrderId(payment.order_id._id)
                                }
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* No payments found */}
        {!loading && filteredPayments.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">
              No payments found matching your filters.
            </p>
          </div>
        )}

        {/* Payment details modal */}
        {showPaymentDetails && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-full overflow-auto">
              <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment Details</h3>
                <button
                  onClick={closePaymentDetails}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium mb-4">
                      Order Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Order ID:</span>
                        <p className="font-medium">
                          {selectedPayment.order_id._id}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Order Date:
                        </span>
                        <p className="font-medium">
                          {formatDate(selectedPayment.order_id.order_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Order Status:
                        </span>
                        <p className="font-medium">
                          {selectedPayment.order_id.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Total Price:
                        </span>
                        <p className="font-medium">
                          LKR {selectedPayment.order_id.total_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-4">
                      Payment Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">
                          Payment ID:
                        </span>
                        <p className="font-medium">{selectedPayment._id}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Amount:</span>
                        <p className="font-medium">
                          LKR {selectedPayment.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Payment Method:
                        </span>
                        <p className="font-medium">
                          {selectedPayment.payment_method}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Payment Status:
                        </span>
                        <p className="font-medium">
                          {selectedPayment.payment_status}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Payment Date:
                        </span>
                        <p className="font-medium">
                          {formatDate(selectedPayment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-4">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">
                        {selectedPayment.user_id.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">
                        {selectedPayment.user_id.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="font-medium">
                        {selectedPayment.user_id.phone_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Address:</span>
                      <p className="font-medium">
                        {selectedPayment.user_id.address}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closePaymentDetails}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
