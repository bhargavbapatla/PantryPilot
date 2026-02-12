import { useAuth } from "../features/auth/authContext";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

const Button = ({
  loading,
  children,
  className = "",
  fullWidth = false,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const { theme } = useAuth();

  const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: `
      bg-[#635BFF]
      text-white
      border border-[#635BFF]
      bg-gradient-to-r from-[#635BFF] via-[#6F6BFF] to-[#0A2540]
      btn-gradient
    `,
    secondary: `
      bg-white text-[#0A2540] border border-[#E6EBF1]
      hover:bg-[#F6F9FC]
    `,
    ghost: `
      bg-transparent border border-transparent
      hover:bg-[#F6F9FC]
    `,
    danger: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700
    `,
  };


  let backgroundColor = "transparent";
  let color = theme.text;
  let border = "1px solid transparent";
  let hoverBg = "";
  let boxShadow = "0 1px 2px rgba(16, 24, 40, 0.1)";

  if (variant === "primary") {
    backgroundColor = theme.primary;
    color = theme.primaryText;
    border = "1px solid " + theme.primary;
    hoverBg = "#4f46e5"; // Stripe-like hover
  }

  if (variant === "secondary") {
    backgroundColor = "#ffffff";
    color = theme.text;
    border = "1px solid " + theme.border;
    hoverBg = "#f6f9fc";
    boxShadow = "none";
  }

  if (variant === "ghost") {
    backgroundColor = "transparent";
    color = "inherit";
    // color = theme.primary;
    border = "1px solid transparent";
    hoverBg = "#f6f9fc";
    boxShadow = "none";
  }

  if (variant === "danger") {
    backgroundColor = "#dc2626"; // red-600
    color = "#ffffff";
    border = "1px solid #dc2626";
    hoverBg = "#b91c1c"; // red-700
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        ${fullWidth ? "w-full" : "w-auto"}
        inline-flex items-center justify-center
        rounded-md px-3.5 py-2
        text-sm font-medium
        transition-all duration-150
        disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      style={{
        backgroundColor,
        color,
        border,
        boxShadow,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled && !loading && hoverBg) {
          e.currentTarget.style.backgroundColor = hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
      }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
