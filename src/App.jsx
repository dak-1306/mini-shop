import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/buyer/Home";
import Profile from "./pages/buyer/Profile";
import Cart from "./pages/buyer/Cart";
import SearchPage from "./pages/common/SearchPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProductDetails from "./pages/common/ProductDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
