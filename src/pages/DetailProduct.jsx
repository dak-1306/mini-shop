import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useStore from "../store/store";
import Button from "../layout/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus as AddIcon } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft as BackIcon } from "@fortawesome/free-solid-svg-icons";
function DetailProduct() {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    const foundProduct = products.find((p) => p.id === parseInt(id));
    setProduct(foundProduct);
  }, [id, products]);

  if (!product) {
    return <div>Loading...</div>;
  }
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-white shadow rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover mb-4"
        />
      </div>
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="text-xl font-bold mb-4">${product.price}</p>
        <Button onClick={() => addToCart(product)} variant="success">
          <FontAwesomeIcon icon={AddIcon} /> Add to Cart
        </Button>
        <Button
          onClick={() => window.history.back()}
          variant="secondary"
          className="ml-2"
        >
          <FontAwesomeIcon icon={BackIcon} /> Go Back
        </Button>
      </div>
    </div>
  );
}

export default DetailProduct;
