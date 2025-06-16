import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BlogDetail.css";

const blogPosts = [
  {
    id: 1,
    title: "Spring Semester Reset: Helping Your Student Regain Focus and Motivation",
    image: "/images/blog-default.png",
    content: `
      The spring semester often comes with a mix of excitement and exhaustion. After winter break, students might struggle to find their momentum again. Here’s how you can help them start fresh and stay on track.
1. Encourage a Clean Slate Mindset
Remind your student that a new semester is a fresh start. Whether last semester went well or had challenges, this is an opportunity to reset routines and set new goals.
2. Help Them Get Organized
Suggest they do a quick dorm refresh—decluttering their space and restocking essentials can make a big difference in productivity. A well-organized space helps with a focused mindset.
3. Support Healthy Habits
Winter months can be tough on energy levels. Encourage them to prioritize sleep, eat well, and find ways to stay active—even if it’s just walking to class instead of taking the bus.
4. Talk About Academic and Personal Goals
Ask your student what they hope to accomplish this semester—academically, socially, or personally. Help them break goals into small, achievable steps so they feel less overwhelming.
5. Send a Motivational Boost
A care package filled with study snacks, fresh notebooks, or even stress-relief items like tea and a cozy blanket can be a great way to kick off the semester.
By offering support and encouragement, you can help your student regain their focus and motivation to make the most of the spring semester.
    `,
  },
  {
    id: 2,
    title: "Transitioning to College Life: Tips for Parents on Helping Your Student Adjust",
    image: "/images/blog-default.png",
    content: `
      Starting college is a major life change for students—and their families.
      As a parent, you can help ease the transition by encouraging independence,
      listening without judgment, and checking in regularly without overwhelming them.

      Share your own experiences of adapting to new environments and let them know it's normal to struggle.
    `,
  },
  // need to add more post when finalize it
];

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === parseInt(id));

  if (!post) {
    return <div className="blog-detail-container">Post not found.</div>;
  }

  return (
    <main className="blog-detail-container">
      <div className="blog-detail-header">
        <img src={post.image} alt={post.title} />
        <h1>{post.title}</h1>
      </div>
      <div className="blog-detail-content">
        {post.content.trim().split("\n").map((para, idx) => (
          <p key={idx}>{para.trim()}</p>
        ))}
      </div>
          <div className="back-button-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
    </div>
    </main>
  );
};


export default BlogDetail;
