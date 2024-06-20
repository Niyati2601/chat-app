import React, { useState } from 'react';
import './addUser.css';
import { collection, query, where, getDocs, setDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from '../../../lib/firebase';
import { useUserStore } from '../../../lib/userStore';
import toast from 'react-hot-toast';

export default function AddUser() {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error message
    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        toast.error('User not found.');
      }
    } catch (error) {
      console.log('Error: ', error);
      toast.error('An error occurred while searching for the user.');
    }
  }

  const handleAdd = async () => {
    setErrorMessage(''); // Clear previous error message

    try {
      // Fetch current user's chat list
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnap = await getDoc(userChatsRef);

      if (userChatsSnap.exists()) {
        const userChats = userChatsSnap.data().chats;

        // Check if the user is already in the chat list
        const userExists = userChats.some(chat => chat.receiverId === user.id);

        if (userExists) {
          toast.error('User is already in your chat list.');
          return;
        }
      }
      const chatRef = collection(db, "chats");
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const newChat = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      };

      await updateDoc(doc(db, "userchats", user.id), {
        chats: arrayUnion({
          ...newChat,
          receiverId: currentUser.id,
        })
      });

      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: arrayUnion(newChat)
      });

      toast.success('User added successfully.');
    } catch (error) {
      console.log('Error: ', error);
      toast.error('An error occurred while adding the user.');
    }
  }

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder='Username' name='username' id='username' />
        <button>Search</button>
      </form>
      {errorMessage && <div className="error">{errorMessage}</div>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
}
