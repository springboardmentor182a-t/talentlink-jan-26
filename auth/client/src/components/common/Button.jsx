import React from 'react';
import '../../styles/theme.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick,
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const getButtonClass = () => {
    let classes = '';
    
    if (disabled) {
      classes += 'btn-disabled';
    } else {
      switch (variant) {
        case 'primary':
          classes += 'btn-primary';
          break;
        case 'secondary':
          classes += 'btn-secondary';
          break;
        case 'outline':
          classes += 'btn-outline';
          break;
        default:
          classes += 'btn-primary';
      }
    }
    
    if (size === 'sm') classes += ' btn-sm';
    if (size === 'lg') classes += ' btn-lg';
    if (fullWidth) classes += ' w-full';
    
    return classes;
  };

  return (
    <button
      type={type}
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : {}}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
