import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm",
              "focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50",
              "transition duration-150 ease-in-out",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;