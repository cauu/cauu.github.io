import React from 'react';
import { useMediaQuery } from 'react-responsive';

export default ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 992 })
  return isDesktop ? children : null
}