import { useState } from "react";

const StaffProfileForm = () => {
  const [userId, setUserId] = useState(""); // User input for reg_number or employee_number
  const [profile, setProfile] = useState({}); // Initialize with an empty object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { value } = e.target;
    setUserId(value); // Update userId with entered value
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please enter a registration number or employee number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error("Profile not found or invalid user ID.");
      }

      const data = await response.json();
      setProfile(data); // Set the fetched profile data
    } catch (error) {
      setError(error.message); // Display error message
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const updatedProfile = {
      email: profile.email,
      phone: profile.phone,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const updatedData = await response.json();
      setProfile(updatedData); // Update the profile with the new data
      alert("Profile updated successfully!");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="profile-form">
      <h3>Enter Your ID to Fetch Profile</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="user_id" className="form-label">
            Registration Number / Employee Number
          </label>
          <input
            type="text"
            className="form-control"
            id="user_id"
            name="user_id"
            value={userId}
            onChange={handleInputChange}
            placeholder="Enter your registration number or employee number"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Fetch Profile
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {profile && (
        <div className="profile-details">
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={profile.name || ""}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="department" className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                id="department"
                name="department"
                value={profile.department || ""}
                disabled
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffProfileForm;
