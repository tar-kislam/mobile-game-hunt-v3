import React from 'react';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`shiny-text ${className}`}
    >
      {children}
    </span>
  );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
