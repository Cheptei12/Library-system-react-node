// components/ProfileForm.js
import { useState } from "react";

const ProfileForm = () => {
  // Example profile state, you can replace this with actual data from the backend.
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    program: "Computer Science",
    graduationYear: "2026",
    bio: "Passionate about technology and programming.",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you can handle form submission, like sending the data to a backend
    alert("Profile updated!");
  };

  return (
    <div className="profile-form">
      <h3>Edit Profile</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="program" className="form-label">
            Program/Department
          </label>
          <input
            type="text"
            className="form-control"
            id="program"
            name="program"
            value={profile.program}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="graduationYear" className="form-label">
            Graduation Year
          </label>
          <input
            type="text"
            className="form-control"
            id="graduationYear"
            name="graduationYear"
            value={profile.graduationYear}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            rows="4"
            value={profile.bio}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;