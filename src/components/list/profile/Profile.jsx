import React, { useState } from 'react';
import { useUserStore } from '../../lib/userStore';
import './profile.css';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import upload from "../../lib/upload"; // Import your upload function
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import toast from 'react-hot-toast';

const Profile = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [status, setStatus] = useState(currentUser.status || '');
  const [avatar, setAvatar] = useState({
    file: null,
    url: currentUser.avatar || "./avatar.png",
  });
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSave = async () => {
    let avatarUrl = avatar.url;

    if (avatar.file) {
      avatarUrl = await upload(avatar.file);
    }

    const updatedUser = {
      ...currentUser,
      username,
      email,
      status,
      avatar: avatarUrl,
    };

    // Update user in Firestore
    await updateDoc(doc(db, 'users', currentUser.id), updatedUser);
    
    // Update user in user store
    setCurrentUser(updatedUser);
    toast.success('Profile Updated!!')

    // Redirect to home page
    navigate('/home');
  };

  const handleClose = () => {
    navigate('/home');
  };

  return (
    <div className="editProfile">
      <h2>Edit Profile</h2>
      <IoCloseOutline className="closeIcon" onClick={handleClose} />
      <div className="formGroup">
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="formGroup">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="formGroup">
        <label>Status</label>
        <input
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>
      <div className="formGroup">
        <label>Avatar</label>
        <input type="file" onChange={handleAvatarChange} />
        <img src={avatar.url} alt="avatar" className="avatarPreview" />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Profile;
