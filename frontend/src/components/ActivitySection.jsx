import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ActivitySection({ studentData }) {
  const { token } = useAuth();
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    technologies: "",
    githubLink: "",
  });
  const [internshipForm, setInternshipForm] = useState({
    role: "",
    company: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [localProjects, setLocalProjects] = useState(studentData?.projects || []);
  const [localInternships, setLocalInternships] = useState(studentData?.internships || []);

  const semester = studentData?.year || 1;
  const isProjectSemester = semester >= 1 && semester <= 6; // 🧩 semesters 1-6 → projects, 7-8 → internships

  // ✅ Add or update a project
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    console.log('🔍 Submitting project:', projectForm);
    console.log('🔍 Token available:', !!token);

    try {
      const url = editingProject
        ? `${import.meta.env.VITE_API_BASE}/students/projects/${editingProject._id}`
        : `${import.meta.env.VITE_API_BASE}/students/projects`;

      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        const msg = editingProject
          ? "✅ Project updated successfully!"
          : "🎉 Project added successfully!";
        setMessage(msg);

        const newProject = editingProject
          ? { ...editingProject, ...projectForm }
          : await res.json();

        setLocalProjects((prev) =>
          editingProject
            ? prev.map((p) => (p._id === editingProject._id ? newProject : p))
            : [...prev, newProject]
        );

        setEditingProject(null);
        setProjectForm({ name: "", description: "", technologies: "", githubLink: "" });
      } else {
        const err = await res.json();
        setMessage(err.message || "Failed to add project");
      }
    } catch (error) {
      console.error("Project error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage("⚠️ Network error: Unable to connect to server. Please check if the backend is running.");
      } else {
        setMessage("⚠️ Network error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete a project
  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/students/projects/${projectId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setLocalProjects((prev) => prev.filter((p) => p._id !== projectId));
        setMessage("🗑️ Project deleted successfully!");
      } else {
        setMessage("Failed to delete project");
      }
    } catch (error) {
      console.error("Delete project error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage("⚠️ Network error: Unable to connect to server. Please check if the backend is running.");
      } else {
        setMessage("Network error while deleting project. Please try again.");
      }
    }
  };

  // ✏️ Edit an existing project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      githubLink: project.githubLink || "",
    });
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setProjectForm({ name: "", description: "", technologies: "", githubLink: "" });
  };

  // ✅ Add Internship
  const handleInternshipSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    console.log('🔍 Submitting internship:', internshipForm);
    console.log('🔍 Token available:', !!token);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/students/internships`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(internshipForm),
        }
      );

      if (res.ok) {
        const newInternship = await res.json();
        setLocalInternships((prev) => [...prev, newInternship]);
        setMessage("🎉 Internship added successfully!");
        setInternshipForm({ role: "", company: "" });
      } else {
        const err = await res.json();
        setMessage(err.message || "Failed to add internship");
      }
    } catch (error) {
      console.error("Internship error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage("⚠️ Network error: Unable to connect to server. Please check if the backend is running.");
      } else {
        setMessage("⚠️ Network error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if student is registered
  if (!studentData) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity</h2>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Required</h3>
          <p className="text-gray-500 mb-4">Please complete your student registration first to access the activity section.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* 🔹 PROJECT SECTION (Sem 1–6) */}
      {isProjectSemester ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Project Section (Semester {semester})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            📝 Students in semesters 1-6 can add their academic projects here.
          </p>

          {localProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Your Projects</h4>
              <div className="space-y-3">
                {localProjects.map((project) => (
                  <div key={project._id} className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-blue-900">{project.name}</h5>
                        <p className="text-blue-700 text-sm mt-1">{project.description}</p>
                        <p className="text-blue-600 text-sm mt-1">
                          <strong>Technologies:</strong> {project.technologies}
                        </p>
                        {project.githubLink && (
                          <p className="text-blue-600 text-sm mt-1">
                            <strong>GitHub:</strong>{" "}
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-800"
                            >
                              {project.githubLink}
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, name: e.target.value })
                }
                required
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, description: e.target.value })
                }
                required
                rows={3}
                placeholder="Describe your project"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={projectForm.technologies}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      technologies: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., React, Node.js"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Link
                </label>
                <input
                  type="url"
                  value={projectForm.githubLink}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, githubLink: e.target.value })
                  }
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingProject
                    ? "Updating..."
                    : "Adding..."
                  : editingProject
                  ? "Update Project"
                  : "Add Project"}
              </button>
              {editingProject && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* 🔹 INTERNSHIP SECTION (Sem 7–8) */
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Internship Section (Semester {semester})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            💼 Students in semesters 7-8 can add their internship experiences here.
          </p>

          {localInternships.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Your Internships</h4>
              <div className="space-y-3">
                {localInternships.map((intern, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-md">
                    <h5 className="font-medium text-green-900">{intern.role}</h5>
                    <p className="text-green-700 text-sm mt-1">
                      <strong>Company:</strong> {intern.company}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleInternshipSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={internshipForm.role}
                onChange={(e) =>
                  setInternshipForm({ ...internshipForm, role: e.target.value })
                }
                required
                placeholder="e.g., Software Developer Intern"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={internshipForm.company}
                onChange={(e) =>
                  setInternshipForm({ ...internshipForm, company: e.target.value })
                }
                required
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Internship"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
