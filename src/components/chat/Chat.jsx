import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";
import moment from "moment";
import { FaImage } from "react-icons/fa6";
import { MdEmojiEmotions } from "react-icons/md";
import toast from "react-hot-toast";
import sound from "../../assets/notification.wav";
import { PiCheck, PiChecks } from "react-icons/pi";
import { IoSendSharp, IoVideocam } from "react-icons/io5";
import { IoCall } from "react-icons/io5";
import { TiAttachment } from "react-icons/ti";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [attachment, setAttachment] = useState({
    file: null,
    url: "",
    name: "",
  });
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);
  const notificationSound = useRef(new Audio(sound));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      const chatData = chatDoc.data();

      if (chatData) {
        const updatedMessages = chatData.messages.map((message) => {
          if (message.senderId !== currentUser.id) {
            return { ...message, isSeen: true };
          }
          return message;
        });

        await updateDoc(doc(db, "chats", chatId), {
          messages: updatedMessages,
        });
      }
    };

    const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
      const chatData = res.data();
      if (chatData) {
        setChat(chatData);

        // Check if there are new messages from the other user
        const hasNewMessage = chatData.messages.some(
          (message) => message.senderId !== currentUser.id && !message.isSeen
        );

        if (hasNewMessage) {
          setHasUnreadMessage(true);
        } else {
          setHasUnreadMessage(false);
        }

        // Mark messages as seen
        markMessagesAsSeen();
      }
    });

    return () => {
      unSub();
    };
  }, [chatId, currentUser?.id]);

  useEffect(() => {
    if (hasUnreadMessage) {
      playNotificationSound();
      showNotificationToast();
    }
  }, [hasUnreadMessage]);

  const playNotificationSound = () => {
    notificationSound.current.play();
  };

  const showNotificationToast = () => {
    toast.success(`New Message from ${getLastMessageSenderName()}`);
  };

  const getLastMessageSenderName = () => {
    const lastMessage = chat?.messages
      .slice()
      .reverse()
      .find((message) => message.senderId !== currentUser.id);

    return lastMessage ? lastMessage.senderName : "Unknown User";
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    console.log('file: ', file);
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and DOCX files are allowed");
        return;
      }

      setAttachment({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file && !doc.file) return;

    let imgUrl = null;
    let docUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      if (attachment.file) {
        docUrl = await upload(attachment.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          senderName: currentUser.username, // Include sender name
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
          ...(docUrl && {
            doc: {
              url: docUrl,
              name: attachment.name,
              type: attachment.file.type,
            },
          }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData?.chats?.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text || doc.name || "Attachment";
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });
      setAttachment({
        file: null,
        url: "",
        name: "",
      });
      setText("");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.status}</p>
          </div>
        </div>
        <div className="icons">
          <IoCall />
          <IoVideocam />
        </div>
      </div>
      <div className="center mostly-customized-scrollbar">
        {chat?.messages?.map((message) => {
          return (
            <div
              className={
                message?.senderId === currentUser?.id
                  ? "message own"
                  : "message"
              }
              key={message?.createdAt}
            >
              <div className="texts">
                {message?.img && <img src={message.img} alt="" />}
                {message?.doc && (
                  <a href={message.doc.url} target="_blank" rel="noopener noreferrer">
                    {message.doc.name}
                  </a>
                )}
                <p
                  style={{
                    borderRadius:
                      message?.senderId === currentUser?.id
                        ? "15px 0px 15px 15px"
                        : "0px 15px 15px 15px",
                  }}
                >
                  {message?.text}
                </p>
                <span>
                  {moment(message?.createdAt?.toDate()).format("LLL")}
                </span>
                {message.senderId === currentUser?.id && (
                  <span className="seen-icon">
                    {message.isSeen ? <PiChecks /> : <PiCheck />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {attachment.url && (
          <div className="message own">
            <div className="texts">
              <a
                href={attachment.url}
                download={attachment.name}
                style={{ textDecoration: "none", color: "inherit" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {attachment.name}
              </a>
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="input-container">
          <input
            type="text"
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send a message"
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            onKeyDown={handleKey}
          />
          <button
            className="sendButton"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            <IoSendSharp />
          </button>
        </div>
        <div className="icons">
          <label htmlFor="file">
            <FaImage />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <label htmlFor="doc">
            <TiAttachment />
          </label>
          <input
            type="file"
            id="doc"
            style={{ display: "none" }}
            onChange={handleAttachment}
          />
        </div>
        <div className="emoji">
          <MdEmojiEmotions onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
