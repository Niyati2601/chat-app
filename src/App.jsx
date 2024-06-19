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
      {currentUser !== null ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Details />}
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
