import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

type FieldProps = {
  label: string;
  error?: string;
  id: string;
};

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-brown-dark">
      {label}
    </label>
    <input
      {...props}
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-lg border border-brown-light bg-white px-4 py-3 text-base text-brown-dark placeholder:text-brown-light outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        className
      )}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-brown-dark">
      {label}
    </label>
    <textarea
      {...props}
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-lg border border-brown-light bg-white px-4 py-3 text-base text-brown-dark placeholder:text-brown-light outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold min-h-[120px] resize-y",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        className
      )}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
