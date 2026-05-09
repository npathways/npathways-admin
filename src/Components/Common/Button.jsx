import React from 'react';

const Button = ({ children, variant = 'primary', onClick, ...props }) => {
  return (
    <button 
      className={`btn-${variant}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
