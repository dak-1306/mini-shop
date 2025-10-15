const _uid = Math.random().toString(36).slice(2, 9); // dùng để tạo id gradient tránh trùng

function SvgWrapper({ children, className = "h-5 w-5", title, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? "false" : "true"}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/**
 * Props supported across icons:
 * - className: tailwind classes for size & color (e.g. "h-6 w-6 text-indigo-500")
 * - color: inline color (overrides currentColor)
 * - bgColor: if set, draws a colored rounded background circle
 * - gradient: boolean to use gradient fill (use gradientFrom/To)
 * - gradientFrom/gradientTo: colors for gradient stops (strings, e.g. "#7c3aed")
 * - gradientId: optional id for gradient (otherwise auto)
 */
export function CartIcon({
  className = "h-8 w-8",
  color,
  bgColor,
  gradient = false,
  gradientFrom = "#d2f8ffff",
  gradientTo = "#7c3aed",
  gradientId,
  title = "Cart",
  ...props
}) {
  const gid = gradientId || `g-cart-${_uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={title ? "false" : "true"}
      role={title ? "img" : "presentation"}
      {...props}
    >
      <defs>
        {gradient && (
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        )}
      </defs>

      {/* optional background circle */}
      {bgColor && (
        <circle cx="12" cy="12" r="11" fill={bgColor} opacity="0.12" />
      )}

      {/* icon paths: use gradient fill or currentColor stroke */}
      <path
        d="M6 6h15l-1.5 9h-12z"
        fill={gradient ? `url(#${gid})` : "none"}
        stroke={color || "currentColor"}
        strokeWidth="1.6"
      />
      <circle
        cx="9"
        cy="20"
        r="1.4"
        fill={gradient ? `url(#${gid})` : color || "currentColor"}
      />
      <circle
        cx="18"
        cy="20"
        r="1.4"
        fill={gradient ? `url(#${gid})` : color || "currentColor"}
      />
      {title ? <title>{title}</title> : null}
    </svg>
  );
}

export function AddIcon({
  className = "h-5 w-5",
  color,
  bgColor = "#10b981",
  gradient = false,
  gradientFrom = "#34d399",
  gradientTo = "#06b6d4",
  gradientId,
  title = "Add",
  ...props
}) {
  const gid = gradientId || `g-add-${_uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      aria-hidden={title ? "false" : "true"}
      role={title ? "img" : "presentation"}
      {...props}
    >
      <defs>
        {gradient && (
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        )}
      </defs>

      {/* background circle */}
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={gradient ? `url(#${gid})` : bgColor}
        opacity="0.95"
      />
      {/* plus sign */}
      <path
        d="M10 6v8M6 10h8"
        stroke={color || "#fff"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {title ? <title>{title}</title> : null}
    </svg>
  );
}

export function SearchIcon({
  className = "h-5 w-5",
  color,
  gradient = false,
  gradientFrom = "#f472b6",
  gradientTo = "#fb923c",
  gradientId,
  title = "Search",
  ...props
}) {
  const gid = gradientId || `g-search-${_uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={title ? "false" : "true"}
      role={title ? "img" : "presentation"}
      {...props}
    >
      <defs>
        {gradient && (
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        )}
      </defs>

      <circle
        cx="11"
        cy="11"
        r="7"
        stroke={color || "currentColor"}
        strokeWidth="1.6"
        fill={gradient ? `url(#${gid})` : "none"}
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={color || "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {title ? <title>{title}</title> : null}
    </svg>
  );
}

// export thêm icon cơ bản (Close/Image/Etc.) theo pattern tương tự nếu cần...
export function CloseIcon({
  className = "h-5 w-5",
  color,
  title = "Close",
  ...props
}) {
  return (
    <SvgWrapper className={className} title={title} {...props}>
      <path
        d="M6 6l12 12M6 18L18 6"
        stroke={color || "currentColor"}
        strokeWidth="1.6"
      />
    </SvgWrapper>
  );
}
export function ImageIcon({
  className = "h-5 w-5",
  color,
  title = "Image",
  ...props
}) {
  return (
    <SvgWrapper className={className} title={title} {...props}>
      <path
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zM8 8l2.5 3L13 8l3 4H4l4-4z"
        stroke={color || "currentColor"}
        strokeWidth="1.6"
      />
    </SvgWrapper>
  );
}
export function HomeIcon({
  className = "h-8 w-8",
  color,
  bgColor = "#ffffff",
  gradient = true,
  gradientFrom = "#7c3aed",
  gradientTo = "#06b6d4",
  gradientId,
  title = "Home",
  ...props
}) {
  const gid = gradientId || `g-home-${_uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden={title ? "false" : "true"}
      role={title ? "img" : "presentation"}
      {...props}
    >
      <defs>
        {gradient && (
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="60%" stopColor={gradientTo} />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        )}
        <filter id="homeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#000"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {/* subtle background circle for "badge" effect */}
      <circle cx="12" cy="12" r="11" fill={bgColor} opacity="0.06" />

      {/* house group with shadow */}
      <g filter="url(#homeShadow)">
        {/* roof */}
        <polygon
          points="3.5,10.5 12,4 20.5,10.5"
          fill={gradient ? `url(#${gid})` : color || "currentColor"}
          stroke="none"
          opacity="0.98"
        />
        {/* house body */}
        <rect
          x="5"
          y="10.5"
          width="14"
          height="8"
          rx="1.2"
          fill={gradient ? `url(#${gid})` : color || "currentColor"}
          opacity="0.95"
        />
        {/* door */}
        <rect
          x="10.5"
          y="13"
          width="3"
          height="5"
          rx="0.6"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* windows */}
        <rect
          x="6.6"
          y="12.2"
          width="2"
          height="2"
          rx="0.3"
          fill="#ffffff"
          opacity="0.95"
        />
        <rect
          x="15.4"
          y="12.2"
          width="2"
          height="2"
          rx="0.3"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* roof trim for contrast */}
        <path
          d="M4.2 10.2 L12 5.2 L19.8 10.2"
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      {title ? <title>{title}</title> : null}
    </svg>
  );
}
