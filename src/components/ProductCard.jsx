import Button from "../layout/Button";
import { Link } from "react-router-dom";
function ProductCard({ product, addToCart }) {
  return (
    <div className="border-none border-gray-300 rounded p-4 bg-white shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col justify-between">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover mb-4 "
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-blue-500">${product.price}</p>
      <Link
        to={`/product/${product.id}`}
        className="text-indigo-600 hover:underline mt-2"
        state={{ product }}
      >
        Xem chi tiết
      </Link>
      <Button
        onClick={() => addToCart(product)}
        className="mt-2"
        variant="success"
      >
        Add to Cart
      </Button>
    </div>
  );
}
export default ProductCard;
