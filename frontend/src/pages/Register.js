import React, { useState } from "react";
import "./Login.css";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
  
    const handleRegister = async () => {
      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:5000/registerUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert("Account created successfully.");
          window.location.href = "/login";
        } else {
          alert(data.error || "Registration failed.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("Something went wrong.");
      }
    };

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
                    <h4>Join us.</h4>
                    <div className="blue-line"></div>

                    <label>Email</label>
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
                        className="input-password2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                        <img src={showPassword ? "/eye.png" : "/eye-off.png"} alt="Toggle visibility" />
                      </span>
                    </div>

                    <div className="pswd-rules">
                        Your password must have at least 8 characters, including a lowercase letter, an uppercase letter, and a number. 
                    </div>

                    <button className="signin-btn" onClick={handleRegister}>
                        CREATE AN ACCOUNT
                    </button>

                    <p className="register-link">
                        Already have an account? <a href="/login">Login here</a>
                    </p>

                    <p className="terms">
                        By signing or joining, you agree to the <a href="https://mydormstore.ca/policies/terms-of-service">Terms and Privacy Policy</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
