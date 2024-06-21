import React, { useEffect, useState } from 'react'
import toast, {Toaster} from 'react-hot-toast';
import { requestToken,onMessageListener } from '../components/lib/firebase';

const Notification = () => {
    const [notification, setNotification] = useState({
        title: '',
        body: ''
    });

    const notify = () => {
        toast(<ToastDisplay />);
    }

    const ToastDisplay = () => {
        return (
            <div>
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
            </div>
        )
    }
    useEffect(()=> {
        if(notification?.title) {
            notify()
        }
    },[notification])

    requestToken()

    onMessageListener()
    .then((payload) => {
        setNotification({title: payload?.notification?.title, body: payload?.notification?.body})
      console.log('payload: ', payload);
    })
    .catch((err) => {
      console.log('failed: ', err);
    });
  return <Toaster />
}

export default Notification