import React from 'react';

const CategoryIcon = ({ category, style = {} }) => {
  const baseClasses = `
    inline-flex 
    items-center 
    justify-center 
    w-6 
    h-6 
    text-xs 
    font-bold 
    rounded
    ${category === 'NR' ? 'border border-black/20 text-black' : ''}
  `;

  return (
    <div className={baseClasses} style={style}>
      {category}
    </div>
  );
};

export default CategoryIcon;