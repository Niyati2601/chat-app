import React, { useEffect, useState } from 'react';
import './details.css';
import { auth, db } from '../lib/firebase';
import { Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useUserStore } from '../lib/userStore';
import { useChatStore } from '../lib/chatStore';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { MdDownloadForOffline } from "react-icons/md";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import { FaFile } from 'react-icons/fa6';


const Details = () => {
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const [sharedImages, setSharedImages] = useState([]);
  const [showSharedPhotos, setShowSharedPhotos] = useState(false);
  const [sharedDocs, setShareDocs] = useState([]);
  const [showSharedDocs, setShowSharedDocs] = useState(false);


  useEffect(() => {
    const fetchChatImages = async () => {
      if (!chatId || !currentUser) return;

      try {
        const chatDocRef = doc(db, "chats", chatId); // Adjust to your actual collection and document structure
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists()) {
          const chatData = chatDocSnap.data();
          const messagesWithImages = chatData.messages.filter(message => message.img); // Filter messages with 'img'
          const images = messagesWithImages.map(message => message.img);
          setSharedImages(images);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchChatImages();
  }, [chatId, currentUser]);

  useEffect(() => {
    const fetchChatDocs = async () => {
      if (!chatId || !currentUser) return;

      try {
        const chatDocRef = doc(db, "chats", chatId); // Adjust to your actual collection and document structure
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists()) {
          const chatData = chatDocSnap.data();
          const messagesWithDocs = chatData.messages.filter(message => message.doc); // Filter messages with 'doc'
          const docs = messagesWithDocs.map(message => message.doc);
          setShareDocs(docs);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchChatDocs();
  }, [chatId, currentUser]);

  const handleBlock = async () => {
    if (!user) return;
    const updateDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(updateDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.error('error: ', error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    return <Navigate to={"/"} />;
  };

  const toggleSharedPhotos = () => {
    setShowSharedPhotos(prevState => !prevState);
  };

  const toggleSharedDocs = () => {
    setShowSharedDocs(prevState => !prevState);
  };
  const handleDownload = async (docUrl, docName) => {
    try {
      const response = await fetch(docUrl, {
        mode: 'cors',
      });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = docName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };
  


  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || './avatar.png'} alt="" />
        <h2>{user?.username}</h2>
        <p>{user?.status}</p>
      </div>
      <div className="info mostly-customized-scrollbar">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <IoIosArrowDropupCircle className='icons' />
          </div>
        </div>
        <div className="option">
          <div className="title" onClick={toggleSharedPhotos}>
            <span>Shared Photos</span>
            {showSharedPhotos ? <IoIosArrowDropupCircle className='icons' /> : <IoIosArrowDropdownCircle className='icons' />}
          </div>
          {showSharedPhotos && (
            <div className="photos">
              {sharedImages.length > 0 ? (
                sharedImages.map((image, index) => {
                  let fileName = "";
                  if (typeof image === "string") {
                    const lastSlashIndex = image.lastIndexOf('/');
                    const queryIndex = image.indexOf('?');
                    fileName = image.substring(lastSlashIndex + 1, queryIndex > -1 ? queryIndex : undefined);
                  }
                  const shortName = fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;
                  return (
                    <div className="photoItem" key={index}>
                      <div className="photoDetail">
                        <img src={image} alt='' />
                        <span>{shortName}</span>
                      </div>
                      <MdDownloadForOffline className='icons' onClick={() => handleDownload(image, fileName)} />
                    </div>
                  );
                })
              ) : (
                <span style={{ textAlign: 'center', color: 'lightgrey' }}>No shared images yet!!</span>
              )}
            </div>
          )}
        </div>
        <div className="option">
          <div className="title" onClick={toggleSharedDocs}>
            <span>Shared Files</span>
            {showSharedDocs ? <IoIosArrowDropupCircle className='icons' /> : <IoIosArrowDropdownCircle className='icons' />}
          </div>
          {showSharedDocs && (
            <div className="photos">
              {sharedDocs.length > 0 ? (
                sharedDocs.map((doc, index) => {
                  const shortName = doc.name.length > 30 ? `${doc.name.substring(0, 30)}...` : doc.name;
                  return (
                    <div className="photoItem" key={index}>
                      <div className="photoDetail">
                        <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                          <span style={{gap:"12px"}}><FaFile />{shortName}</span>
                        </a>
                      </div>
                      <MdDownloadForOffline className='icons' onClick={() => handleDownload(doc.url, doc.name)} />
                    </div>
                  );
                })
              ) : (
                <span style={{ textAlign: 'center', color: 'lightgrey' }}>No shared files yet!!</span>
              )}
            </div>
          )}
        </div>
        <button className='blockButton' onClick={handleBlock}>
          {isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User is blocked" : "Block User"}
        </button>
        <button className='logout' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Details;

