import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        style={{ background: "#F6F7F5" }}
        className="flex-grow container mx-auto px-4 py-6"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
