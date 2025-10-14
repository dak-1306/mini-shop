import Button from "../layout/Button";
function Categories({ categories, onSelectCategory }) {
  return (
    <div className="w-4/5 mx-auto bg-white mb-4 p-4 rounded shadow">
      <div className="grid grid-cols-6 gap-4 w-full">
        <Button
          onClick={() => onSelectCategory(null)}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
export default Categories;
