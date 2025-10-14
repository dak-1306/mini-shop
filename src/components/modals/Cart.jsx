import Modal from "react-modal";
import Button from "../../layout/Button";
function Cart({ cart, isOpen, onClose, removeFromCart }) {
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      appElement={document.getElementById("root")}
      className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl mb-4">Shopping Cart</h2>
        <button
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li
              className="border-b py-2 flex items-center justify-between"
              key={item.id}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover"
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
