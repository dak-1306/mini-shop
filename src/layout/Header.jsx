import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
function Header({ openCart }) {
  return (
    <>
      <header className="bg-green-500 text-white p-2 flex justify-between items-center">
        <h1>MY SHOP</h1>
        <nav className="m-3">
          <ul className="flex space-x-4 list-none p-0 m-0">
            <li className="mr-4 cursor-pointer">
              <Link to="/" className="hover:underline ">
                <FontAwesomeIcon className="h-6 w-6" icon={faHouse} />
              </Link>
            </li>
            <li className="mr-4 cursor-pointer">
              <Link to="/profile" className="hover:underline">
                <FontAwesomeIcon className="h-6 w-6" icon={faUser} />
              </Link>
            </li>
            <li>
              <button
                onClick={openCart}
                className="hover:underline cursor-pointer"
              >
                <FontAwesomeIcon className="h-6 w-6" icon={faShoppingCart} />
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Header;
