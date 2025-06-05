import React from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Content from "./components/Content";
import "./App.css"; // your main styles

function App() {
  return (
    <div className="App">
      <TopBar />
      <Header />
      <NavBar />
      <Content />
    </div>
  );
}

export default App;