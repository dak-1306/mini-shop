import { Link } from "react-router-dom";
function Header({ openCart }) {
  return (
    <>
      <header className="bg-green-500 text-white p-4 flex justify-between items-center">
        <h1>MY SHOP</h1>
        <nav className="m-3">
          <ul className="flex space-x-4 list-none p-0 m-0">
            <li className="mr-4 cursor-pointer">
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <button
                onClick={openCart}
                className="hover:underline cursor-pointer"
              >
                Cart
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Header;
