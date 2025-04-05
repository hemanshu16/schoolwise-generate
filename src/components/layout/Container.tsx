import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Container = ({ children, className, fullWidth = false }: ContainerProps) => {
  return (
    <div className={cn(
      "w-full mx-auto",
      // Responsive padding
      "px-3 sm:px-4 md:px-6 lg:px-8",
      // Responsive width constraints, unless fullWidth is true
      !fullWidth && "max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
      className
    )}>
      {children}
    </div>
  );
};

export default Container;
