import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductManagement = () => {
  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    stock_quantity: "",
    image_base64: "",
    specifications: [],
  });
  const [selectedSpecifications, setSelectedSpecifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSpecifications();
  }, []);

  // API Request Headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/product/all",
        getAuthHeaders()
      );
      setProducts(response.data);
      setError("");
    } catch (err) {
      handleError(err, "Failed to fetch products");
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/category/all",
        getAuthHeaders()
      );
      setCategories(response.data.categories);
    } catch (err) {
      handleError(err, "Failed to fetch categories");
    }
  };

  // Fetch Specifications
  const fetchSpecifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/specification/all",
        getAuthHeaders()
      );
      setSpecifications(response.data.specifications);
    } catch (err) {
      handleError(err, "Failed to fetch specifications");
    }
  };

  // Image to Base64 Conversion
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image_base64: base64String,
        });
      } else {
        setNewProduct({
          ...newProduct,
          image_base64: base64String,
        });
      }
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Add Specification to Product
  const addProductSpecification = (specId) => {
    const newSpec = {
      specification_id: specId,
      value: "",
    };
    setSelectedSpecifications([...selectedSpecifications, newSpec]);
  };

  // Update Specification Value
  const updateSpecificationValue = (index, value) => {
    const updatedSpecs = [...selectedSpecifications];
    updatedSpecs[index].value = value;
    setSelectedSpecifications(updatedSpecs);
  };

  // Remove Specification
  const removeSpecification = (index) => {
    const updatedSpecs = selectedSpecifications.filter((_, i) => i !== index);
    setSelectedSpecifications(updatedSpecs);
  };

  // Add New Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        specifications: selectedSpecifications,
      };

      const response = await axios.post(
        "http://localhost:5000/api/product/add",
        productData,
        getAuthHeaders()
      );

      setProducts([...products, ...response.data]);
      resetForm();
      setSuccessMessage("Product added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to add product");
    }
  };

  // Update Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...editingProduct,
        id: editingProduct._id,
        specifications: selectedSpecifications,
      };

      console.log(productData);

      const response = await axios.put(
        "http://localhost:5000/api/product/update",
        productData,
        getAuthHeaders()
      );

      setProducts(
        products.map((prod) =>
          prod._id === response.data._id ? response.data : prod
        )
      );
      resetForm();
      setSuccessMessage("Product updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to update product");
    }
  };

  // Get Product Details
  const fetchProductDetails = async (productId) => {
    console.log("------------>", productId);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/product/one",
        { id: productId }
      );

      setSelectedProduct(response.data);
    } catch (err) {
      handleError(err, "Failed to fetch product details");
    }
  };

  // Reset Form
  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category_id: "",
      stock_quantity: "",
      image_base64: "",
      specifications: [],
    });
    setSelectedSpecifications([]);
    setEditingProduct(null);
    setImagePreview("");
    fetchProducts();
  };

  // Set product for editing
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setImagePreview(product.image_base64);

    // Get the product specifications with full details if needed
    if (product.specifications && product.specifications.length > 0) {
      // Handle both formats: objects with specification_id as object or as string ID
      const formattedSpecs = product.specifications.map((spec) => {
        if (typeof spec.specification_id === "object") {
          return {
            specification_id: spec.specification_id._id,
            value: spec.value,
          };
        }
        return spec;
      });
      setSelectedSpecifications(formattedSpecs);
    } else {
      setSelectedSpecifications([]);
    }
  };

  // Error Handling
  const handleError = (err, defaultMessage) => {
    const errorMsg = err.response?.data?.message || defaultMessage;
    setError(errorMsg);
    setTimeout(() => setError(""), 3000);
  };

  // Search Functionality (Frontend)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get specification name by ID
  const getSpecificationName = (specId) => {
    const spec = specifications.find((s) => s._id === specId);
    return spec ? spec.name : "Unknown Specification";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

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

      {/* Product Form */}
      <form
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Product Details Inputs */}
          <input
            type="text"
            placeholder="Product Name"
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({ ...editingProduct, name: e.target.value })
                : setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={
              editingProduct
                ? editingProduct.description
                : newProduct.description
            }
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                : setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
          <input
            type="number"
            placeholder="Price"
            value={editingProduct ? editingProduct.price : newProduct.price}
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({
                    ...editingProduct,
                    price: e.target.value,
                  })
                : setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
          <select
            value={
              editingProduct
                ? editingProduct.category_id
                : newProduct.category_id
            }
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({
                    ...editingProduct,
                    category_id: e.target.value,
                  })
                : setNewProduct({ ...newProduct, category_id: e.target.value })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Stock Quantity"
            value={
              editingProduct
                ? editingProduct.stock_quantity
                : newProduct.stock_quantity
            }
            onChange={(e) =>
              editingProduct
                ? setEditingProduct({
                    ...editingProduct,
                    stock_quantity: e.target.value,
                  })
                : setNewProduct({
                    ...newProduct,
                    stock_quantity: e.target.value,
                  })
            }
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="h-20 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Specification Selection */}
        <div className="mt-4">
          <h3 className="font-bold mb-2">Select Specifications</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {specifications.map((spec) => (
              <button
                key={spec._id}
                type="button"
                onClick={() => addProductSpecification(spec._id)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                {spec.name}
              </button>
            ))}
          </div>

          {/* Specification Values */}
          {selectedSpecifications.map((spec, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                placeholder={`Value for ${getSpecificationName(
                  spec.specification_id
                )}`}
                value={spec.value}
                onChange={(e) =>
                  updateSpecificationValue(index, e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-2"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingProduct ? "Update Product" : "Add Product"}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.description}</td>
                <td className="px-4 py-2">{product.price}</td>
                <td className="px-4 py-2">
                  {product.category_id ? product.category_id.name : "N/A"}
                </td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      console.log(product["_id"]);
                      fetchProductDetails(product["_id"]);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct.name} Details
            </h2>
            <img
              src={selectedProduct.image_base64}
              alt={selectedProduct.name}
              className="w-full h-48 object-contain mb-4"
            />
            <p>
              <strong>Description:</strong> {selectedProduct.description}
            </p>
            <p>
              <strong>Price:</strong> {selectedProduct.price}
            </p>
            <p>
              <strong>Category:</strong> {selectedProduct.category_id.name}
            </p>
            <p>
              <strong>Stock Quantity:</strong> {selectedProduct.stock_quantity}
            </p>

            <h3 className="font-bold mt-4 mb-2">Specifications:</h3>
            {selectedProduct.specifications.map((spec, index) => (
              <div key={index} className="mb-2">
                <strong>{spec.specification_id.name}:</strong> {spec.value}
              </div>
            ))}
            <button
              onClick={() => setSelectedProduct(null)}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
