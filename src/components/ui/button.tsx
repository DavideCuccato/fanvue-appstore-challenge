import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-fanvue-blue to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white",
        destructive: "bg-red-500 hover:bg-red-600 text-white",
        outline:
          "border border-fanvue-blue text-fanvue-blue hover:bg-blue-50 hover:border-blue-600",
        secondary: "bg-fanvue-light text-fanvue-dark hover:bg-gray-300",
        ghost: "hover:bg-fanvue-light hover:text-fanvue-dark",
        link: "text-fanvue-blue underline-offset-4 hover:underline hover:text-blue-600",
        success:
          "bg-fanvue-green hover:bg-green-500 text-white hover:shadow-md",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
