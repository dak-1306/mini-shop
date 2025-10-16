import { useState } from "react";
import Modal from "react-modal";
import useStore from "../../store/store";
import Button from "../../layout/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus as AddIcon } from "@fortawesome/free-solid-svg-icons";
import { faTimes as CloseIcon } from "@fortawesome/free-solid-svg-icons";

function AddProductModal({ isOpen, onClose }) {
  //Hàm xử lý thêm sản phẩm
  const { addProduct } = useStore();
  // State để quản lý dữ liệu form
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  // Hàm xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !productPrice || !productImage)
      return alert("Please fill in all fields");
    addProduct({
      id: Date.now(),
      name: productName,
      price: productPrice,
      description: productDescription,
      image: productImage,
    });
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setProductImage("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      appElement={document.getElementById("root")}
      className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-20 border border-gray-300"
    >
      <h2 className="text-2xl mb-4 text-green-500 font-bold mx-auto">
        Thêm sản phẩm mới
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>
          Tên sản phẩm:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Nhập tên sản phẩm"
            className="border p-2 mb-4 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-300 hover:bg-gray-100"
            required
          />
        </label>
        <label>
          Giá sản phẩm:
          <input
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            placeholder="Nhập giá sản phẩm"
            className="border p-2 mb-4 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-300 hover:bg-gray-100"
            required
          />
        </label>
        <label>
          Mô tả sản phẩm:
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Nhập mô tả sản phẩm"
            className="border p-2 mb-4 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-300 hover:bg-gray-100"
            required
          />
        </label>
        <label>
          Hình ảnh sản phẩm:
          <input
            type="url"
            value={productImage}
            onChange={(e) => setProductImage(e.target.value)}
            placeholder="URL hình ảnh"
            className="border p-2 mb-4 w-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-300 hover:bg-gray-100"
            required
          />
        </label>
        <div className="flex justify-end space-x-2">
          <Button
            className=""
            type="button"
            onClick={onClose}
            variant="danger"
          >
            <FontAwesomeIcon icon={CloseIcon} />
          </Button>
          <Button className="" variant="success" gradient={true} type="submit">
            <FontAwesomeIcon icon={AddIcon} /> Thêm sản phẩm
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default AddProductModal;
