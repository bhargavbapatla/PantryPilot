import type { ChangeEvent } from "react";

interface TextFieldProps {
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled,
  required,
  className = "",
  containerClassName = "",
  onBlur
}: TextFieldProps) {
const baseInput =
  "w-full px-3 py-2 border rounded-md bg-white text-left text-gray-900 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed";

  const errorInput =
    "border-red-500 focus:ring-red-500 focus:border-red-500";
  const inputClasses = `${baseInput} ${error ? errorInput : ""} ${className}`;

  return (
    <div className={`flex flex-col space-y-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 text-left"
        >
          {label}
          {required ? <span className="text-red-600 ml-0.5">*</span> : null}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onBlur={onBlur}
        className={inputClasses}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
