import React, { useState } from 'react';
import './userInfo.css';
import { useUserStore } from '../../lib/userStore';
import { useNavigate } from 'react-router-dom';
import { FiEdit } from "react-icons/fi";
import { MdOutlineMoreVert } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEdit = () => {
    navigate('/profile');
    closeDropdown();
  };

  const handleDeleteAccount = () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete your account?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            console.log('Account deleted');
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

        {/* Dropdown Menu */}
        <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
          <div className="menu">
            <div className="menu-item" onClick={handleEdit}><FiEdit className='menu-icon' />Edit Profile</div>
            <div className="menu-item" onClick={handleDeleteAccount}><FaTrash className='menu-icon' />Delete Account</div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
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
