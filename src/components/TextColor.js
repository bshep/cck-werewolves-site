import React from 'react';

export default function TextColor({children, color}) {
  return (
    <span
      style={{
        color: color,
      }}>
      {children}
    </span>
  );
}