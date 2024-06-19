import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from "firebase/firestore"; 
import upload from '../lib/upload';
import './Login.css';

const Login = () => {

    const [avatar, setAvatar] = useState({
        file: null,
        url: ''
    })
    const [loading, setLoading] = useState(false);


    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true)

        const formdata = new FormData(e.target)

        const { email, password } = Object.fromEntries(formdata)
        try {
            const res = await signInWithEmailAndPassword(auth, email, password)
            toast.success('Login Successful')
            
            
        } catch (error) {
            toast.error(error.message)
        } finally{
            setLoading(false)
        }

    }
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formdata = new FormData(e.target)

        const { username, email, password } = Object.fromEntries(formdata)

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username: username,
                email: email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked : []
              });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
              });


            toast.success('Account created!! You can login now')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder='Email' name='email' id='email' />
                    <input type="password" placeholder='Password' name='password' id='password' />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
                </form>
            </div>
            <div className="seperator">

            </div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor='file'>
                        <img src={avatar.url || './avatar.png'} alt='' />
                        Upload an image</label>
                    <input type="file" id='file' style={{ display: 'none' }} onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name='username' id='username' />
                    <input type="email" placeholder='Email' name='email' id='email' />
                    <input type="password" placeholder='Password' name='password' id='password' />
                    <button disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
                </form>
            </div>
        </div>
    )
}

export default Login