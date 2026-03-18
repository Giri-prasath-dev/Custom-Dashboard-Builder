import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}, ref) => {
  const inputClasses = `peer w-full px-4 pt-6 pb-2 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all placeholder-transparent ${
    error 
      ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
      : 'border-gray-300 focus:ring-primary-100 focus:border-primary-500'
  } ${className}`;

  const labelClasses = `absolute left-4 transition-all pointer-events-none ${
    props.value 
      ? 'top-2 text-xs text-gray-500' 
      : 'top-1/2 -translate-y-1/2 text-gray-500'
  } peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs`;

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        placeholder={label}
        className={inputClasses}
        {...props}
      />
      <label className={labelClasses}>
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
