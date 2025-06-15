import React from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import HomePage from "./pages/Homepage/Homepage"; 
import OurStory from "./pages/OurStoryBlog/OurStory/OurStory";
import Blog from "./pages/OurStoryBlog/Blog/Blog";
// import Ambassador from "./pages/OurStoryBlog/Ambassador/Ambassador";
import "./App.css"; // your main styles
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogDetail from "./pages/OurStoryBlog/Blog/BlogDetail";

function App() {
  return (
    <Router>
      <div className="App">
            <TopBar />
            <Header />
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                {/* <Route path="/ambassador" element={<Ambassador />} /> */}
            </Routes>
      </div>
    </Router>
  );
}

export default App;