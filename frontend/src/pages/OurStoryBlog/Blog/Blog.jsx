import React, { useState } from "react";
import "./Blog.css";
import { useNavigate } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "Spring Semester Reset: Helping Your Student Regain Focus and Motivation",
    image: "/images/blog-thumb-1.jpg",
  },
  {
    id: 2,
    title: "Transitioning to College Life: Tips for Parents on Helping Your Student Adjust",
    image: "/images/blog-thumb-2.jpg",
  },
  {
    id: 3,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
  {
    id: 4,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 5,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 6,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 7,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 8,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 9,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 10,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 11,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
    {
    id: 12,
    title: "The Power of Small Gestures: How to Show Your College Student You’re Thinking of Them",
    image: "/images/blog-thumb-3.jpg",
  },
];

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const currentPosts = blogPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleNavigateToDetail = (id) => {
    navigate(`/blog/${id}`);
  };

  return (
    <main className="blog-container">
      <div className="blog-banner-grid">
        <div className="banner-img-box">
          <img src="/images/blog-header-1.png" alt="Blog Header Left" />
        </div>
        <div className="banner-img-box">
          <img src="/images/blog-header-2.png" alt="Blog Header Right" />
        </div>
        <div className="blog-header-overlay">
          <h1>My Dorm Store Blog</h1>
          <p>The go-to resource for everything related to college & university life</p>
        </div>
      </div>

      <div className="blog-grid">
        {currentPosts.map((post) => (
          <div key={post.id} className="blog-card" onClick={() => handleNavigateToDetail(post.id)}>
            <img src= "/images/blog-default.png" alt={post.title} />
            <h3>{post.title}</h3>
            <div className="arrow">
                <img src="/images/arrow-right.png" alt="Arrow right" />
            </div>
            </div>

        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <span
            key={i}
            className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => handlePageClick(i + 1)}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </main>
  );
};

export default Blog;
