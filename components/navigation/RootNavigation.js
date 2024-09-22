import * as React from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(route) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(route);
  }
}