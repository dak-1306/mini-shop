import { Link } from "react-router-dom";
import { CartIcon, HomeIcon } from "../assets/icons";
function Header({ openCart }) {
  return (
    <>
      <header className="bg-green-500 text-white p-2 flex justify-between items-center">
        <h1>MY SHOP</h1>
        <nav className="m-3">
          <ul className="flex space-x-4 list-none p-0 m-0">
            <li className="mr-4 cursor-pointer">
              <Link to="/" className="hover:underline">
                <HomeIcon className="h-8 w-8" gradient />
              </Link>
            </li>
            <li>
              <button
                onClick={openCart}
                className="hover:underline cursor-pointer"
              >
                <CartIcon className="h-8 w-8" gradient />
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Header;
