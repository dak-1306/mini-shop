//Layout
import Header from "../layout/header";
import Footer from "../layout/Footer";
import Button from "../layout/Button";

//Components
import Search from "../components/search";
import ProductCard from "../components/productCard";
import Filter from "../components/filter";
import Categories from "../components/Categories";
import Pagination from "../components/Pagination";

//Modals
import AddProductModal from "../components/modals/AddProductModal";
import Cart from "../components/modals/Cart";

//Store
import useStore from "../store/store";
//React
import { useState, useEffect } from "react";

function Home() {
  // Lấy danh sách sản phẩm và giỏ hàng từ store
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    fetchProducts,
    categories,
    fetchCategories,
  } = useStore();

  // State để quản lý modal thêm sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // State để quản lý modal giỏ hàng
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  //State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State để quản lý kết quả tìm kiếm
  const [searchResults, setSearchResults] = useState(products);

  // State để quản lý việc hiển thị danh mục
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Hàm xử lý tìm kiếm
  const handleSearch = (query) => {
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  // Hàm xử lý lọc theo danh mục
  const handleSelectCategory = (categoryId) => {
    if (categoryId === null) {
      setSearchResults(products);
    } else {
      console.log("Selected category ID:", categoryId);
      const results = products.filter(
        (product) => product.category.id === categoryId
      );
      setSearchResults(results);
    }
  };

  //Hàm mở categories
  const handleOpenCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  //Hàm lọc price range
  const handleSelectPriceRange = (priceRange) => {
    if (priceRange === "Price Range") {
      setSearchResults(products);
      return;
    }
    const filteredProducts = products.filter((product) => {
      // Logic để lọc sản phẩm theo khoảng giá
      const [min, max] = priceRange.split(" - ").map(Number);
      return product.price >= min && product.price <= max;
    });
    console.log("Filtered products:", filteredProducts);
    setSearchResults(filteredProducts);
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  // Lấy sản phẩm cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sourceList = searchResults;
  const currentItems = sourceList.slice(indexOfFirstItem, indexOfLastItem);

  //reset currentPage khi currentItems thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [sourceList.length]);

  // Cập nhật kết quả tìm kiếm khi danh sách sản phẩm thay đổi
  useEffect(() => {
    setSearchResults(products);
  }, [products]);

  // Fetch products khi component được mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories khi component được mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <Header openCart={openCart} />
      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={closeCart}
        removeFromCart={removeFromCart}
      />
      <main className="bg-gray-100 min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold">HOME PAGE</h1>
        <Search onSearch={handleSearch} />
        <Button className="mb-4" onClick={handleOpenCategories}>
          Toggle Categories
        </Button>
        {isCategoriesOpen && (
          <Categories
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        )}
        <Filter
          handleAddProduct={openModal}
          categories={categories}
          handleSelectPriceRange={handleSelectPriceRange}
        />
        <AddProductModal isOpen={isModalOpen} onClose={closeModal} />
        <div className="w-4/5 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 border-gray-300 p-4 rounded bg-white shadow">
          {searchResults.length === 0 ? (
            <p>No products found</p>
          ) : (
            currentItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
      <Footer />
    </>
  );
}
export default Home;
