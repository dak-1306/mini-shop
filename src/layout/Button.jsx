function Button({ onClick, children, variant, className, size, ...props }) {
  const baseClasses =
    "px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  };
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };
  const combinedClasses = `${baseClasses} ${
    variantClasses[variant] || variantClasses.primary
  } ${sizeClasses[size] || sizeClasses.medium} ${className}`;
  return (
    <button onClick={onClick} className={combinedClasses} {...props}>
      {children}
    </button>
  );
}

export default Button;
