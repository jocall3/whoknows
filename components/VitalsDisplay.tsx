import React from 'react';
import type { SystemVitals } from '../types';

export const VitalsDisplay: React.FC<{ vitals: SystemVitals }> = ({ vitals }) => {
  return (
    <div>
      <p>CPU: {vitals.cpu}</p>
      <p>Memory: {vitals.memory}</p>
    </div>
  );
};
