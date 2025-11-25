import React from "react";
import { Link } from "react-router-dom";

/**
 * ClickableCard
 * - to: nếu có -> render <Link> bao quanh children
 * - ariaLabel: truyền cho Link để accessibility
 * - className + rest forwarded
 */
export default function ClickableCard({
  to,
  ariaLabel,
  children,
  className,
  ...props
}) {
  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} className={className} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <div className={className} role="group" {...props}>
      {children}
    </div>
  );
}
