import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/buyer/Home";
import Cart from "./pages/buyer/Cart";
import SearchPage from "./pages/common/SearchPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProductDetails from "./pages/common/ProductDetails";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Profile from "@/pages/buyer/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
