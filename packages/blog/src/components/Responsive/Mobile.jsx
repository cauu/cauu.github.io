import React from 'react';
import { useMediaQuery } from 'react-responsive';

export default ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return isMobile ? children : null
}