import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

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
        
        <select
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50",
            "transition duration-150 ease-in-out",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          onChange={handleChange}
          ref={ref}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;