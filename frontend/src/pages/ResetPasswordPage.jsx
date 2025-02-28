import React from 'react';
import Navbar from "../components/Navbar";
import ResetPasswordCard from '../components/ResetPasswordCard';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
    return (
        <div className="reset-password-page">
            <Navbar />
            <div className="content">
                <ResetPasswordCard />
            </div>
        </div>
    );
}

export default ResetPasswordPage;
