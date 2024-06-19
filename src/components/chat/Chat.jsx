import React, { useEffect, useRef, useState } from 'react'
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useChatStore } from '../lib/chatStore';
import { useUserStore } from '../lib/userStore';
import upload from '../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: '',
  })

  const {currentUser} = useUserStore();
  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked} = useChatStore();

  const endRef = useRef(null);

  useEffect(()=> {
    endRef?.current?.scrollIntoView({ behavior: "smooth" });
  },[])

  useEffect(()=> {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res)=> {
      setChat(res.data());
    })

    return () => {
      unSub();
    }
  },[chatId]);

  
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji)
    setOpen(false);

  }

  const handleImage = (e) => {
    if (e.target.files[0]) {
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
    }
}

  const handleSend = async() => {
    if(text === "") return;

    let imgUrl = null;
    try {
      if(img.file) {
        imgUrl = await upload(img.file);
      }
      console.log('imgUrl: ', imgUrl);
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text,
          senderId: currentUser.id,
          createdAt: new Date(),
          ...(imgUrl && {img: imgUrl}),
        })
      });

      const userIDs = [currentUser.id, user.id]
      console.log('userIDs: ', userIDs);

      userIDs.forEach(async(id)=> {
        const userChatRef = doc(db, "userchats", id)
        const userChatSnapShot = await getDoc(userChatRef);
        console.log('userChatSnapShot: ', userChatSnapShot);
  
        if(userChatSnapShot.exists()) {
          const userChatsData = userChatSnapShot.data();
          console.log('userChatsData: ', userChatsData);
  
          const chatIndex = userChatsData.chats.findIndex(c=> c.chatId === chatId)
          console.log('chatIndex: ', chatIndex);
  
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
  
          await updateDoc(userChatRef, {
            chats: userChatsData.chats
          })
        }

      })
    } catch (error) {
      console.log('error: ', error);     
    }
    setImg({
      file: null,
      url: ''
    })
    setText("");
  }
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user.username}</span>
            <p>Yes this is status!!!</p>
          </div>
        </div>
        <div className="icons">
          <img src='./phone.png' alt='' />
          <img src='./video.png' alt='' />
          <img src='./info.png' alt='' />
        </div>
      </div>
      <div className="center">
        {chat?.messages.map((message, i) => (
        <div className={message.senderId === currentUser.id ? "messages own" : "messages"} key={message?.createAt}>
        {message.img &&  <img src={message.img} alt='' />}
          <div className="texts">
            <p>{message.text}</p>
            {/* <span>1 min ago</span> */}
          </div>
        </div>
          ))}

        {img.url && (
        <div className="messages own">
          <div className="texts">
          <img src={img.url} alt='' />
          </div>
        </div>
        )}
       
        <div ref={endRef}>

        </div>
      </div>
      <div className="bottom">
      <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : 'Write a message...'} onChange={(e) => setText(e.target.value)} value={text} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <div className="emoji">
          <img src='./emoji.png' alt='' onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">

            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat