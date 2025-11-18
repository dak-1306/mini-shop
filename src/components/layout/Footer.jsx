function Footer() {
  return (
    <footer
      style={{ background: "#032C21" }}
      className="w-full border-t px-4 py-6 text-center text-sm text-white backdrop-blur-md"
    >
      &copy; {new Date().getFullYear()} Mini Shop. All rights reserved.
    </footer>
  );
}

export default Footer;
