import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);
        const { email } = Object.fromEntries(formdata);

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
            onClose(); // Close the modal after successful submission
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal">
                <span className="closeIcon" onClick={onClose}>&times;</span>
                <h2>Reset Password</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="formGroup">
                        <label htmlFor="reset-email">Email</label>
                        <input type="email" id="reset-email" name="email" placeholder="Enter your email" required />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default ForgotPassword;
