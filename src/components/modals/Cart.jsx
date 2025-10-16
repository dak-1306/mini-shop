import Modal from "react-modal";
import Button from "../../layout/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes as CloseIcon } from "@fortawesome/free-solid-svg-icons";
function Cart({ cart, isOpen, onClose, removeFromCart }) {
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      appElement={document.getElementById("root")}
      className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl color-gray-800">Shopping Cart</h2>
        <Button onClick={onClose} variant="danger">
          <FontAwesomeIcon icon={CloseIcon} />
        </Button>
      </div>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li
              className="border border-gray-200 rounded  p-4 mt-2 flex items-center justify-between"
              key={item.id}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p>{item.name}</p>
                  <p>${item.price}</p>
                </div>
              </div>
              <div>
                <Button
                  className="text-red-500 cursor-pointer"
                  onClick={() => removeFromCart(item.id)}
                  variant="danger"
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default Cart;
