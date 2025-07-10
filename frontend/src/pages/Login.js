import React, { useState, useEffect } from "react";
import "./Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    


    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/loginUser`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
            },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", email);  

                alert("Login successful");
                window.location.href = "/";
            } else {
                 alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong.");
        }
    };

    useEffect(() => {
        const savedEmail = localStorage.getItem("userEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);
      
    return (
        <section className="login-container">
            <div className="left-place">
                <img className="background-img" src="back-pic.png" alt="background" />
                <div className="title">
                    <h4>Join our <br />membership. </h4>
                    <p>Dorm move-in bundles and <br /> care packages that make <br /> campus life easy.</p>
                </div>
            </div>

            <div className="right-place">
                <div className="logo">
                    <img src="/mydormstroe_log.webp" alt="My Dorm Store Logo" />
                </div>
                <div className="rght-header">
                    <h4>Sign in or Create an account.</h4>
                    <div className="blue-line"></div>
                    
                    <label>Email address</label>
                    <input
                        type="email"
                        className="input-password3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <label>Password</label>
                    <div className="pswd-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input-password3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="eye-icon2" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                        <img src={showPassword ? "/eye.png" : "/eye-off.png"} alt="Toggle visibility" />
                      </span>
                    </div>

                    <div className="rem-for">
                        <label className="rememberme">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            Remember me
                        </label>
                        <p className="forgot-link" onClick={() => window.location.href = "/forgot-password"}>
                            Forgot password?
                        </p>
                    </div>

                    <button className="signin-btn" onClick={handleLogin}>
                        SIGN IN
                    </button>

                    <p className="register-link">
                        Don’t have an account? <a href="/register">Register here</a>
                    </p>

                    <p className="terms">
                        By signing or joining, you agree to the <a href="https://mydormstore.ca/policies/terms-of-service">Terms and Privacy Policy</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
