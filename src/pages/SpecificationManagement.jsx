import React, { useState, useEffect } from "react";
import axios from "axios";

const SpecificationManagement = () => {
  // State management
  const [specifications, setSpecifications] = useState([]);
  const [newSpecifications, setNewSpecifications] = useState([{ name: "" }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSpecification, setEditingSpecification] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch specifications on component mount
  useEffect(() => {
    fetchSpecifications();
  }, []);

  // API Request Headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch All Specifications
  const fetchSpecifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/specification/all",
        getAuthHeaders()
      );
      setSpecifications(response.data.specifications);
      setError("");
    } catch (err) {
      handleError(err, "Failed to fetch specifications");
    }
  };

  // Add New Specification(s)
  const handleAddSpecifications = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty specifications
      const validSpecifications = newSpecifications.filter(
        (spec) => spec.name.trim() !== ""
      );

      if (validSpecifications.length === 0) {
        setError("Please add at least one specification");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/specification/add",
        { specifications: validSpecifications },
        getAuthHeaders()
      );

      setSpecifications([...specifications, ...response.data.specifications]);
      setNewSpecifications([{ name: "" }]);
      setSuccessMessage("Specifications added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to add specifications");
    }
  };

  // Add More Specification Input Fields
  const addSpecificationField = () => {
    setNewSpecifications([...newSpecifications, { name: "" }]);
  };

  // Remove Specification Input Field
  const removeSpecificationField = (index) => {
    const updatedSpecifications = newSpecifications.filter(
      (_, i) => i !== index
    );
    setNewSpecifications(updatedSpecifications);
  };

  // Update Specification
  const handleUpdateSpecification = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/specification/update",
        {
          specificationId: editingSpecification._id,
          name: editingSpecification.name,
        },
        getAuthHeaders()
      );

      setSpecifications(
        specifications.map((spec) =>
          spec._id === response.data.specification._id
            ? response.data.specification
            : spec
        )
      );
      setEditingSpecification(null);
      setSuccessMessage("Specification updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to update specification");
    }
  };

  // Delete Specification
  const handleDeleteSpecification = async (specificationId) => {
    try {
      await axios.delete("http://localhost:5000/api/specification/delete", {
        ...getAuthHeaders(),
        data: { id: specificationId },
      });

      setSpecifications(
        specifications.filter((spec) => spec._id !== specificationId)
      );
      setSuccessMessage("Specification deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      handleError(err, "Failed to delete specification");
    }
  };

  // Error Handling
  const handleError = (err, defaultMessage) => {
    const errorMsg = err.response?.data?.message || defaultMessage;
    setError(errorMsg);
    setTimeout(() => setError(""), 3000);
  };

  // Search Functionality (Frontend)
  const filteredSpecifications = specifications.filter((specification) =>
    specification.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Specification Management</h1>

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

      {/* Add/Edit Specification Form */}
      <form
        onSubmit={
          editingSpecification
            ? handleUpdateSpecification
            : handleAddSpecifications
        }
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Edit Mode */}
        {editingSpecification && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Specification Name"
              value={editingSpecification.name}
              onChange={(e) =>
                setEditingSpecification({
                  ...editingSpecification,
                  name: e.target.value,
                })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        {/* Add Mode */}
        {!editingSpecification && (
          <>
            {newSpecifications.map((spec, index) => (
              <div key={index} className="mb-4 flex items-center">
                <input
                  type="text"
                  placeholder={`Specification Name ${index + 1}`}
                  value={spec.name}
                  onChange={(e) => {
                    const updatedSpecs = [...newSpecifications];
                    updatedSpecs[index].name = e.target.value;
                    setNewSpecifications(updatedSpecs);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSpecificationField(index)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={addSpecificationField}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Another Specification
              </button>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {editingSpecification
              ? "Update Specification"
              : "Add Specification(s)"}
          </button>
          {editingSpecification && (
            <button
              type="button"
              onClick={() => setEditingSpecification(null)}
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
          placeholder="Search specifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* Specifications List */}
      <div className="bg-white shadow-md rounded">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpecifications.map((specification) => (
              <tr key={specification._id} className="border-b">
                <td className="px-4 py-2">{specification.name}</td>
                <td className="px-4 py-2 flex justify-center space-x-2">
                  <button
                    onClick={() => setEditingSpecification(specification)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSpecification(specification._id)}
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

export default SpecificationManagement;
