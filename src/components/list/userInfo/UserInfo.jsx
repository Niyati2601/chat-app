import React from 'react'
import './userInfo.css';
import { useUserStore } from '../../lib/userStore';
import {useNavigate } from 'react-router-dom';
import { FiEdit } from "react-icons/fi";
import {Tooltip} from 'react-tooltip';

const UserInfo = () => {
  const {currentUser} = useUserStore()
  const navigate = useNavigate();


  const handleEdit = () => {
    navigate('/profile')
  }
  return (
    <div className='userInfo'>
        <div className="user">
            <img src={currentUser?.avatar || "./avatar.png"} alt="user" />
                <h2>{currentUser?.username}</h2>
        </div>
        <div className="icons">
            <img src='./more.png' alt='' />
            <img src='./video.png' alt='' />
            <FiEdit onClick={handleEdit} data-tooltip-id='profile' data-tooltip-content='Edit Profile' data-tooltip-place="bottom" />
            <Tooltip id='profile' />
        </div>
    </div>
  )
}

export default UserInfo