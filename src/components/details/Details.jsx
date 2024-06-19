import React from 'react'
import './details.css';
import { auth, db } from '../lib/firebase';
import { Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useUserStore } from '../lib/userStore';
import { useChatStore } from '../lib/chatStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import Login from '../login/Login';

const Details = () => {
  const {currentUser} = useUserStore();
  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const handleBlock = async() => {
    if(!user) return;

    const updateDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(updateDocRef,{
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })

      changeBlock();
    } catch (error) {
      console.log('error: ', error);
      
    }
  }
  const handleLogout = () => {
    auth.signOut();
    <Navigate to={Login} />
  }

  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || './avatar.png'} alt="" />
        <h2>{user?.username}</h2>
        <p>Frontend Developer</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Help & Privacy</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src='./arrowDown.png' alt='' />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
              <img src='https://media.istockphoto.com/id/1652227670/photo/running-pembroke-welsh-corgi-puppy.jpg?s=2048x2048&w=is&k=20&c=ztS3xRRQh777nnANvjoBRPwYvYqR7nNzgNJiban6-TY=' alt='' />
              <span>avatar.png</span>
              </div>
            <img src='./download.png' alt='' className="icons" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
              <img src='https://media.istockphoto.com/id/1652227670/photo/running-pembroke-welsh-corgi-puppy.jpg?s=2048x2048&w=is&k=20&c=ztS3xRRQh777nnANvjoBRPwYvYqR7nNzgNJiban6-TY=' alt='' />
              <span>avatar.png</span>
              </div>
            <img src='./download.png' alt='' className="icons" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
              <img src='https://media.istockphoto.com/id/1652227670/photo/running-pembroke-welsh-corgi-puppy.jpg?s=2048x2048&w=is&k=20&c=ztS3xRRQh777nnANvjoBRPwYvYqR7nNzgNJiban6-TY=' alt='' />
              <span>avatar.png</span>
              </div>
            <img src='./download.png' alt='' className="icons" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src='./arrowUp.png' alt='' />
          </div>
        </div>
        <button className='blockButton' onClick={handleBlock}>{isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User is blocked" : "Block User"}</button>
        <button className='logout' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Details