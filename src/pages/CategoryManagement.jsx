import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // API Request Headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch All Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/category/all",
        getAuthHeaders()
      );
      setCategories(response.data.categories);
      setError("");
    } catch (err) {
      handleError(err, "Failed to fetch categories");
    }
  };

  // Add New Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/category/add",
        { categories: newCategory },
        getAuthHeaders()
      );

      setCategories([...categories, ...response.data.categories]);
      setNewCategory({ name: "", description: "" });
      setSuccessMessage("Categories added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to add category");
    }
  };

  // Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/category/update",
        {
          categoryId: editingCategory._id,
          name: editingCategory.name,
        },
        getAuthHeaders()
      );

      setCategories(
        categories.map((cat) =>
          cat._id === response.data.category._id ? response.data.category : cat
        )
      );
      setEditingCategory(null);
      setSuccessMessage("Category updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to update category");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete("http://localhost:5000/api/category/delete", {
        ...getAuthHeaders(),
        data: { categoryId },
      });

      setCategories(categories.filter((cat) => cat._id !== categoryId));
      setSuccessMessage("Category deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to delete category");
    }
  };

  // Error Handling
  const handleError = (err, defaultMessage) => {
    const errorMsg = err.response?.data?.message || defaultMessage;
    setError(errorMsg);
    setTimeout(() => setError(""), 3000);
  };

  // Search Functionality (Frontend)
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Add/Edit Category Form */}
      <form
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Category Name"
            value={editingCategory ? editingCategory.name : newCategory.name}
            onChange={(e) =>
              editingCategory
                ? setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                  })
                : setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        {!editingCategory && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Category Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {editingCategory ? "Update Category" : "Add Category"}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* Categories List */}
      <div className="bg-white shadow-md rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category._id} className="border-b">
                <td className="px-4 py-2">{category.name}</td>
                <td className="px-4 py-2">{category.description}</td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
