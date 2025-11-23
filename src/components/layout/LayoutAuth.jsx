function LayoutAuth({ children, title }) {
  return (
    <div className="w-full min-h-screen mx-auto p-6 bg-gradient-to-r from-green-800 via-green-600 to-green-400 flex flex-col items-center justify-center">
      <h1 className="text-2xl text-white font-semibold mb-4">{title}</h1>
      {children}
    </div>
  );
}

export default LayoutAuth;
