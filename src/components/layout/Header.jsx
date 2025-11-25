import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

import { Search, ShoppingCart, UserRound } from "lucide-react";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  return (
    <header className="fixed z-10 top-0 left-0 right-0 p-4 text-white flex justify-between items-center bg-[var(--color-bg-header)] shadow-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <h1 className="text-2xl font-bold">
            <Link to="/">Mini Shop</Link>
          </h1>
        </TooltipTrigger>
        <TooltipContent>The best place to buy everything!</TooltipContent>
      </Tooltip>

      <form onSubmit={handleSubmit} className="flex items-center">
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search..."
          className={cn("px-4 py-2 w-[280px] bg-white rounded-md text-black")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              variant="secondary"
              className="ml-2 px-4 py-2 text-white rounded-md"
              aria-label="Search"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click to search products</TooltipContent>
        </Tooltip>
      </form>

      <nav className="flex items-center space-x-6">
        <ul className="flex space-x-4">
          <li>
            {!authUser ? (
              <Button
                type="button"
                variant="secondary"
                className="px-4 py-2 text-white rounded-md"
              >
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </Button>
            ) : null}
          </li>
          {authUser ? (
            <>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/profile"
                      className="hover:underline"
                      aria-label="User Profile"
                    >
                      <UserRound className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>User Profile</TooltipContent>
                </Tooltip>
              </li>

              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/cart"
                      className="hover:underline"
                      aria-label="Shopping Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Shopping Cart</TooltipContent>
                </Tooltip>
              </li>
            </>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
