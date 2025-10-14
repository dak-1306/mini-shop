import "./App.css";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Hoặc ID của phần tử gốc app
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<div>Cart Page</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
