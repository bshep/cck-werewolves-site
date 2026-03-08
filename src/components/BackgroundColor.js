import React from 'react';

export default function BackgroundColor({children, color}) {
  return (
    <span
      style={{
        backgroundColor: color,
      }}>
      {children}
    </span>
  );
}