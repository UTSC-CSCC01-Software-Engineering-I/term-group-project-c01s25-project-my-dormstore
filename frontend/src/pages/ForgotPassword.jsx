import React, { useState } from "react";
import "./Login.css"; 

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            alert(data.message || "Check your email for reset instructions.");
        } catch (err) {
            console.error(err);
            alert("Failed to send reset instructions.");
        }
    };

    return (
        <section className="login-container">
            <div className="left-place">
                <img className="background-img" src="back-pic.png" alt="background" />
                <div className="title">
                    <p>Enter your email to receive a one-time <br /> password and reset your account password.</p>
                </div>
            </div>

            <div className="right-place">
                <div className="logo">
                    <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" />
                </div>
                <div className="rght-header">
                    <h4>Reset password.</h4>
                    <div className="blue-line"></div>
                    
                    <label>Email address</label>
                    <input
                        type="email"
                        className="input-password3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <button className="signin-btn" onClick={handleSubmit}>
                        Send one-time code
                    </button>

                    <p className="register-link">
                        Back to <a href="/login">Login</a>
                    </p>

                    <p className="terms">
                        By using this feature, you agree to our <a href="https://mydormstore.ca/policies/terms-of-service">Terms and Privacy Policy</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
