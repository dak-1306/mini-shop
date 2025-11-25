function LayoutAuth({ children, title }) {
  return (
    <div className="w-full min-h-screen mx-auto p-6 bg-gradient-to-r from-green-800 via-green-600 to-green-400 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl text-center text-[var(--color-foreground)] font-semibold mb-4">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

export default LayoutAuth;
