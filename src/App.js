import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import Dashboard from "./pages/Dashboard";
import AdminDashboardOverview from "./pages/AdminDashBoardOverview";
import CategoryMangement from "./pages/CategoryManagement";
import SpecificationManagement from "./pages/SpecificationManagement";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrdersManagement";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardOverview />} />
          <Route path="category" element={<CategoryMangement />} />
          <Route path="specification" element={<SpecificationManagement />} />
          <Route path="product" element={<ProductManagement />} />
          <Route path="order" element={<OrderManagement />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
