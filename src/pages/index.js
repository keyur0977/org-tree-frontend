import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({ name: "", parent: "" });
  const [isEditing, setIsEditing] = useState(false);
  const API_URL = "http://localhost:5000/api";

  const fetchPersons = async () => {
    try {
      const response = await axios.get(`${API_URL}/persons`);
      setPersons(response?.data.data);
    } catch (error) {
      toast.error("Error fetching persons!");
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name);
    console.log("value", value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataCopy = {
        ...formData,
        parent: formData.parent === "" ? null : formData.parent,
      };
      if (isEditing) {
        await axios.put(
          `${API_URL}/update-person/${selectedPerson._id}`,
          formDataCopy
        );
        toast.success("Person updated successfully!");
      } else {
        await axios.post(`${API_URL}/add-person`, formDataCopy);
        toast.success("Person added successfully!");
      }
      setFormData({ name: "", parent: "" });
      setIsEditing(false);
      setSelectedPerson(null);

      fetchPersons();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving person!");
    }
  };

  // Select a person to view or edit
  const handleSelectPerson = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/person/${id}`);
      setSelectedPerson(response.data.data);
      setFormData({
        name: response.data.name,
        parent: response.data.parent?._id || "",
      });
      setIsEditing(true);
    } catch (error) {
      toast.error("Error fetching person details!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this person?")) return;

    try {
      await axios.delete(`${API_URL}/remove-person/${id}`);
      toast.success("Person deleted successfully!");
      fetchPersons();
    } catch (error) {
      toast.error("Error deleting person!");
    }
  };

  return (
    <div className='container w-1/2 my-0 mx-auto'>
      <ToastContainer />
      <div>
        <h2 className='text-center font-bold text-2xl bg-slate-400 mb-5 mt-5'>
          Persons List
        </h2>
        <ul className='border-t border-l border-r border-slate-400'>
          {persons?.length > 0 ? (
            persons.map((person) => (
              <li
                key={person._id}
                className='p-2 my-2 flex items-center justify-between mx-auto border-b border-b-slate-400'>
                <div>
                  <h5 htmlFor='name'>Name: {person.name}</h5>
                  <h5 htmlFor='parent'>
                    Parent: {person.parent?.name || "Root"}
                  </h5>
                </div>
                <div className='flex'>
                  <button
                    onClick={() => handleSelectPerson(person._id)}
                    className='ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(person._id)}
                    className='ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className='p-2 my-2 text-center text-gray-500'>
              No person found
            </li>
          )}
        </ul>
      </div>

      <div>
        <h2 className='text-center font-bold text-2xl bg-slate-400 mb-5 mt-5'>
          {isEditing ? "Edit Person" : "Add Person"}
        </h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
          <div className='flex justify-between items-center mb-5'>
            <label>Name:</label>
            <input
              type='text'
              name='name'
              className='text-black w-1/2'
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='flex justify-between items-center mb-5'>
            <label>Parent:</label>
            <select
              name='parent'
              className='text-black w-1/2'
              value={formData.parent}
              onChange={handleInputChange}>
              <option value={""}>Root</option>
              {persons?.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type='submit'
            className='m-1 py-1 px-2  bg-blue-500 text-white cursor-pointer rounded-lg hover:bg-blue-800'>
            {isEditing ? "Update" : "Add"} Person
          </button>
        </form>
      </div>

      {selectedPerson && (
        <div>
          <h2 className='text-center font-bold text-2xl bg-slate-400 mb-5 mt-5'>
            Selected Person
          </h2>
          <p>
            <strong>Name:</strong> {selectedPerson.name}
          </p>
          <p>
            <strong>Parent:</strong> {selectedPerson.parent?.name || "None"}
          </p>
        </div>
      )}
    </div>
  );
}
