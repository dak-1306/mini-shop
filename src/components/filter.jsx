import Button from "../layout/Button";
function Filter({
  handleAddProduct,
  categories,
  onSelectCategories,
  handleSelectPriceRange,
}) {
  return (
    <>
      <div className=" w-4/5 mx-auto bg-white mb-4 p-4 flex justify-between items-center rounded shadow ">
        <div className="flex space-x-4">
          <select
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => onSelectCategories(e.target.value)}
          >
            <option>All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => handleSelectPriceRange(e.target.value)}
          >
            <option>Price Range</option>
            <option>0 - 50</option>
            <option>50 - 100</option>
            <option>100 - 200</option>
          </select>
        </div>
        <Button variant="primary" onClick={handleAddProduct}>
          Thêm sản phẩm
        </Button>
      </div>
    </>
  );
}
export default Filter;
