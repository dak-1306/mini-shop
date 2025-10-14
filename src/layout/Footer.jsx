import Button from "./Button";
function Footer() {
  return (
    <>
      <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <p>© 2024 My Shop. All rights reserved.</p>
        <Button variant="primary">Contact Us</Button>
      </footer>
    </>
  );
}

export default Footer;
