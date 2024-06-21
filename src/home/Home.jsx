import React from 'react'
import List from '../components/list/List'
import Chat from '../components/chat/Chat'
import Details from '../components/details/Details'
import { useChatStore } from '../components/lib/chatStore'

const Home = () => {
    const { chatId } = useChatStore();
    return (
        <>
        <List />
       {chatId && <Chat />}  {chatId &&<Details />}</>
    )
}

export default Home