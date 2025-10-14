import { useState } from "react";
import Button from "../layout/Button";
function Search({ onSearch }) {
  const [query, setQuery] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center mx-auto m-4"
    >
      <input
        type="text"
        placeholder="Search..."
        className="border border-gray-300 bg-white rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" variant="success" className="ml-2">
        Search
      </Button>
    </form>
  );
}
export default Search;
