import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/buyer/Home";
import Profile from "./pages/buyer/Profile";
import Cart from "./pages/buyer/Cart";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;
