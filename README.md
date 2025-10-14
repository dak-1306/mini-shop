# Mini Shop (React + Vite)

A small React practice project (Vite) for learning front-end topics: component structure, Tailwind CSS, Zustand state management, modals, and API calls with the built-in fetch API.

## Quick start

Prerequisites: Node.js (16+ recommended) and npm installed.

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Project structure (important files)

- `index.html` - Vite entry
- `src/main.jsx` - React entry
- `src/pages/Home.jsx` - Main page with product list
- `src/components` - UI components (Filter, Search, ProductCard, modals)
- `src/layout` - Header/Footer/Button
- `src/store` - Zustand store (global state)

## Tailwind CSS

This project uses Tailwind utility classes in components. If Tailwind isn't set up yet, follow these steps:

1. Install Tailwind and PostCSS plugins:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure `tailwind.config.js` `content` to include your source files:

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

3. Add Tailwind directives to `src/index.css` (or `src/main.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Import the CSS in `src/main.jsx`:

```js
import "./index.css";
```

If you see `npx tailwindcss init -p` errors like "could not determine executable to run", try installing packages first (`npm install`), or use `npx --ignore-existing tailwindcss init -p`, or install tailwindcss globally as a last resort.

## Zustand (state management)

The project keeps global state in `src/store/store.js`. A typical pattern:

```js
import { create } from "zustand";

const useStore = create((set) => ({
  products: [],
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  // fetchProducts: async () => { ... }
}));

export default useStore;
```

- Place the store file in `src/store/` (it already exists here).
- Components import store with `import useStore from '../store/store'` (adjust path as needed).
- If you fetch initial data from an API (JSONPlaceholder), call the fetch action in a `useEffect` within the page component so it runs once on mount.

## Using JSONPlaceholder with fetch (example)

Use JSONPlaceholder to get fake product-like data. Example `fetchProducts` using built-in fetch in your Zustand store or component:

```js
// inside a store action or component
async function fetchProducts() {
  try {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/photos?_limit=12"
    );
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    const products = data.map((item) => ({
      id: item.id,
      name: item.title,
      price: Math.floor(Math.random() * 100) + 10,
      image: item.url,
      description: `Demo product for ${item.title}`,
    }));
    // set products in store or component state
  } catch (err) {
    console.error(err);
  }
}
```

Call `fetchProducts()` in a `useEffect` from `Home.jsx`:

```js
useEffect(() => {
  fetchProducts();
}, [fetchProducts]);
```

## Add product UI (modal)

For learning, the app includes an `AddProductModal` component. If you don't want to handle file uploads or base64 data for images, allow entering an image URL (preferred for front-end practice). Example:

```html
<input type="url" placeholder="https://example.com/image.jpg" />
```

Then save the URL in the product object and render it in `ProductCard`.

## Accessibility note for `react-modal`

If you use `react-modal`, set the app element once (in `src/main.jsx`):

```js
import Modal from "react-modal";
Modal.setAppElement("#root");
```

Or pass `appElement={document.getElementById('root')}` to each Modal. Avoid `ariaHideApp={false}` unless you accept the accessibility tradeoff.

## Troubleshooting & tips

- If you get `Cannot read properties of undefined (reading 'id')` while filtering by category, use optional chaining: `product.category?.id` and ensure UI values are the same type (string vs number).
- For Tailwind classes like `w-4/5`, you can also use JIT arbitrary values: `w-[80%]`.
- Prefer `fetch` while learning (native API). Move to `axios` later for convenience (interceptors, request cancellation).

## Contributing / next steps

- Improve form validation in `AddProductModal`.
- Add persistence with localStorage or a small backend.
- Add tests for components and store actions.

---

If you want, I can: add usage examples inside `Home.jsx`, wire fetch into the existing Zustand store, or create a short demo branch with JSONPlaceholder wired in. Tell me which you'd prefer.
# mini-shop
