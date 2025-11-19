function Footer() {
  return (
    <footer className="w-full border-t px-4 py-6 text-center text-sm text-white backdrop-blur-md bg-[var(--color-bg-footer)] shadow-md">
      &copy; {new Date().getFullYear()} Mini Shop. All rights reserved.
    </footer>
  );
}

export default Footer;
