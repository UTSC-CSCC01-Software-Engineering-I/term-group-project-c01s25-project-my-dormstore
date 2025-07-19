import React from "react";
import { Link } from "react-router-dom";
import Content from "../../components/Content";
import "./Homepage.css";

const HomePage = () => {
  return (
    <main>
        <Content />

        <div className="section-wrapper">
            <section className="feature-section">
                <div className="feature-video">
                    <video
                    controls
                    className="feature-video-player"
                    >
                        <source src="/videos/students.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                <div className="feature-cards">

                    <div className="feature-card">
                        <h3>
                        Built for <span style={{ fontStyle: "italic" }}>students</span>.
                        </h3>
                        <h3>
                        Backed by <span style={{ fontStyle: "italic" }}>residences</span>.
                        </h3>
                        <p>The only package allowed to arrive before you do.</p>
                        <div className="display-arrow">  
                            <Link to="/products">
                                <img
                                    src="/images/arrow-circle-icon.png"
                                    alt="arrow icon"
                                    className="arrow-icon"
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="feature-row">
                        <div className="feature-card">
                            <h3>Bedding that makes your dorm feel like home</h3>
                            <div className="display-arrow">  
                                <Link to="/bedding">
                                    <img
                                    src="/images/arrow-circle-icon.png"
                                    alt="arrow icon"
                                    className="arrow-icon"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="feature-card">
                            <h3>Everything your dorm room needs</h3>
                            <div className="display-arrow">  
                                <Link to="/products">
                                    <img
                                        src="/images/arrow-circle-icon.png"
                                        alt="arrow icon"
                                        className="arrow-icon"
                                    />
                                </Link>
                            </div> 
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
        <div className="section-wrapper">
            <section className="parents-section">
                <div className="parents-text">
                    <h3>Peace of Mind for Parents</h3>
                    <p>From move-in day to midterms, we<br />
                    help you stay connected and<br />
                    support your student all year long.</p>
                    <Link to="/our-story">
                        <img
                            src="/images/arrow-circle-icon.png"
                            alt="arrow icon"
                            className="arrow-icon"
                            />
                    </Link>
                </div>

                <div className="parents-video">
                    <video
                    controls
                    className="parents-video-player"
                    >
                    <source src="/videos/parents.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>
                </div>
            </section>
        </div>

        <div className="section-wrapper">
            <section className="apartment-section">
                <div className="apartment-text">
                    <h3>Off-Campus Apartment Living, Covered.</h3>
                    <Link to="/products">
                        <img
                        src="/images/arrow-right.png"
                        alt="arrow right"
                        className="arrow-icon"
                    />
                    </Link>
                </div>

                <div className="apartment-image-container">
                    <img
                    src="/images/apartment-boxes.png"
                    alt="apartment boxes"
                    className="apartment-image"
                    />
                </div>
            </section>
        </div>

        <section className="campus-section">
        <h2 className="campus-title">Campuses We Deliver To</h2>
            <div className="logo-marquee-wrapper">
                <div className="logo-marquee-track">
                    <img src="/images/logo-york.png" alt="York" />
                    <img src="/images/logo-western.png" alt="Western" />
                    <img src="/images/logo-waterloo.png" alt="Waterloo" />
                    <img src="/images/logo-uoft.png" alt="UofT" />
                    <img src="/images/logo-queens.png" alt="Queen's" />
                    <img src="/images/logo-mcmaster.png" alt="McMaster" />
                    <img src="/images/logo-algoma.png" alt="Algoma" />
                    <img src="/images/logo-alberta.png" alt="Alberta" />
                    <img src="/images/logo-trent.jpeg" alt="Trent" />
                
                    <img src="/images/logo-york.png" alt="York-copy" />
                    <img src="/images/logo-western.png" alt="Western-copy" />
                    <img src="/images/logo-waterloo.png" alt="Waterloo-copy" />
                    <img src="/images/logo-uoft.png" alt="UofT-copy" />
                    <img src="/images/logo-queens.png" alt="Queen's-copy" />
                    <img src="/images/logo-mcmaster.png" alt="McMaster-copy" />
                    <img src="/images/logo-algoma.png" alt="Algoma-copy" />
                    <img src="/images/logo-alberta.png" alt="Alberta-copy" />
                    <img src="/images/logo-trent.png" alt="Trent-copy" />
                </div>
            </div>
        </section>

        <section className="gallery-section">
            <div className="gallery-row-upper">
                <img src="/images/room-1.png" alt="Room 1" />
                <img src="/images/room-2.png" alt="Room 2" />
            </div>
            <div className="gallery-row-lower">
                <img src="/images/room-3.png" alt="Room 3" />
                <img src="/images/room-4.png" alt="Room 4" />
            </div>
        </section>
    </main>
  );
}
export default HomePage;
