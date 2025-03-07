import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Box,
  CheckSquare,
  BarChart2,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";

const MenuBar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      title: "Category Management",
      icon: <CheckSquare size={20} />,
      path: "/dashboard/category",
    },
    {
      title: "Specific. Management",
      icon: <ClipboardList size={20} />,
      path: "/dashboard/specification",
    },
    {
      title: "Product Management",
      icon: <Box size={20} />,
      path: "/dashboard/product",
    },
    {
      title: "Order Management",
      icon: <BarChart2 size={20} />,
      path: "/dashboard/order",
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen w-64 bg-gray-900 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">ECOM Admin</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-purple-600"
                      : "hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="absolute bottom-0 w-64 p-4">
        <button
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 w-full"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
