import React from 'react';
import { useMediaQuery } from 'react-responsive';

export default ({ children }) => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
  return isTablet ? children : null
}