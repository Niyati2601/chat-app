import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Details from "./components/details/Details";
import List from "./components/list/List";
import Login from "./components/login/Login";
import { Toaster } from 'react-hot-toast';
import { auth } from "./components/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "./components/lib/userStore";
import { useChatStore } from "./components/lib/chatStore";
import Profile from "./components/list/profile/Profile";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./home/Home";
const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore()
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid)
      }
    });

    return () => {
      unSub();
    }
  }, [fetchUserInfo])

  // if(isLoading) return <div className="loading">Loading...</div>
  return (
    <div className="container">
      <Toaster />
      <BrowserRouter>
      <Routes>
      {currentUser !== null ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
            </>
          ) : (
            <Route path="/" element={<Login />} />
          )}
      </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
