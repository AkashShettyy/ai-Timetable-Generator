import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminFacultyVerify() {
  const [pending, setPending] = useState([]);
  const token = localStorage.getItem("token");

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchPending = async () => {
    try {
      const res = await API.get("/auth/pending-faculties");
      setPending(res.data);
    } catch (error) {
      console.error("Error fetching pending faculty:", error);
    }
  };

  const approveFaculty = async (id) => {
    try {
      await API.post(`/auth/approve-faculty/${id}`);
      alert("Faculty approved successfully");
      fetchPending();
    } catch (error) {
      console.error("Error approving faculty:", error);
      alert("Failed to approve faculty");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">
        Pending Faculty Approvals
      </h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Faculty ID</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((f) => (
            <tr key={f._id} className="border-t">
              <td className="p-2">{f.name}</td>
              <td className="p-2">{f.facultyId}</td>
              <td className="p-2">{f.email}</td>
              <td className="p-2">
      
                <button
                  onClick={() => approveFaculty(f._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
