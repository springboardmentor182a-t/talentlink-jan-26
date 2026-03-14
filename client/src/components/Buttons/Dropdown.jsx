import React from 'react';

const Dropdown = ({ setMinPrice }) => {
  return (
    <select 
      style={{ color: 'black', backgroundColor: 'white', display: 'block', width: '200px' }}
  onChange={(e) => setMinPrice(e.target.value)}
>
      {/* The 'value' is for the computer, the text inside is for YOU to see */}
      <option value="0">Select Budget Range</option> 
      <option value="1000">$1,000 - $3,000</option>
      <option value="3000">$3,000 - $5,000</option>
      <option value="5000">$5,000+</option>
    </select>
  );
};