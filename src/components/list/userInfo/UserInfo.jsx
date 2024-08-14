import React, { useState } from 'react';
import './userInfo.css';
import { useUserStore } from '../../lib/userStore';
import { useNavigate } from 'react-router-dom';
import { FiEdit } from "react-icons/fi";
import { MdOutlineMoreVert } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEdit = () => {
    navigate('/profile');
    closeDropdown();
  };

  const deleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.id));

      await deleteDoc(doc(db, 'userchats', currentUser.id));

      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.id));
      const chatDocs = await getDocs(chatsQuery);
      const deletePromises = chatDocs.docs.map(chatDoc => deleteDoc(chatDoc.ref));
      await Promise.all(deletePromises);

      navigate('/');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteAccount = () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete your account?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            deleteAccount();
            setIsOpenDeleteDialog(false);
          }
        },
        {
          label: 'No',
          onClick: () => setIsOpenDeleteDialog(false)
        }
      ]
    });
    closeDropdown();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser?.avatar || "./avatar.png"} alt="user" />
        <h2>{currentUser?.username}</h2>
      </div>
      <div className="icons">
        <MdOutlineMoreVert onClick={toggleDropdown} />

        <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
          <div className="menu">
            <div className="menu-item" onClick={handleEdit}><FiEdit className='menu-icon' />Edit Profile</div>
            <div className="menu-item" onClick={handleDeleteAccount}><FaTrash className='menu-icon' />Delete Account</div>
          </div>
        </div>
      </div>

      {isOpenDeleteDialog && (
        <div className="delete-dialog">
          <h3>Are you sure you want to delete your account?</h3>
          <div className="buttons">
            <button onClick={handleDeleteAccount}>Yes</button>
            <button onClick={() => setIsOpenDeleteDialog(false)}>No</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserInfo;
