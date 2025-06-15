import React from "react";
import "./OurStory.css";

const OurStory = () => {
  return (
    <main>
        <div className="section-wrapper">
            <section className="ourstoryblog-section1">
                <div className="ourstoryblog-img1">
                    <img src="/images/ourstoryblog1.png" className="fade-in-up"  />
                </div>
                <div className="ourstoryblog-card">
                    <h2 className="card-subtitle">Our Story</h2>
                    <h1 className="card-title">Made by students,<br />for students.</h1>
                    <p>As university students, no one understands the stress and challenges involved with moving into a dorm or an apartment better than we do.</p>
                    <p>Having lived in dorms and apartments, we know how much is involved with moving into a new space and making it into a home.</p>
                    <p>My Dorm Store is the service we wish we had - a way to take the worry out of moving. We work with universities and colleges to ensure our packages have exactly what you need.</p>
                </div>
            </section>
        </div>


        <div className="section-wrapper">
            <section className="ourstoryblog-section2">
                <div className="intro-text">
                    <h1>Your dorm is your home.</h1>
                    <p>
                        Moving for anyone can be a challenge. Leaving your home and moving into a dorm can be even more challenging. It's not just about going to a new place and meeting new people; it's about making sure your dorm becomes your home away from home.
                    </p>
                </div>
                <div className="ourstoryblog-img2">
                    <img src="/images/ourstoryblog2.png" className="fade-in-up" />
                </div>
            </section>
        </div>

        <div className="section-wrapper"> 
            <section className="ourstoryblog-section3">
                <div className="ourstoryblog-img3">
                    <img src="/images/ourstoryblog3.png" className="fade-in-up" />
                </div>
                <div className="intro-text">
                    <h1>We get it because we've been there.</h1>
                    <p>My Dorm Store is here to reduce the stress of moving. We get it because we've been there. We know everyone has a different style and we want to help you make your dorm express who you are. ​</p>
                </div>
            </section>
        </div>

        <div className="section-wrapper">
            <section className="ourstoryblog-section4">
                <div className="intro-text">
                    <h1>The dorm shopping solution.</h1>
                    <p>
                        My Dorm Store is a curated dorm shopping solution made by students, for students. Students can order everything to make their dorm into their home. We work with schools to design affordable packages and deliver everything before students arrive. As students ourselves, we know how hectic moving into your dorm is. Once you find what you’re looking for, we guarantee a smooth checkout and delivery experience with personalized customer service support.
                    </p>
                </div>
                <div className="ourstoryblog-img4">
                    <img src="/images/ourstoryblog4.png" className="fade-in-up" />
                </div>
            </section>
        </div>
    </main>
  );
};

export default OurStory;
