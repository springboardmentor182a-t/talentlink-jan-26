import React from 'react';
import '../../assets/theme.css';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          className="ui-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={icon ? { paddingLeft: '40px' } : {}}
          {...props}
        />
      </div>
      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
