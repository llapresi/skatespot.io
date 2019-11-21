import React from 'react';
import withRunOnMount from './WithRunOnMount';

const RunOnMount = ({ children }) => (
  <div>
    {children}
  </div>
);

export default withRunOnMount(RunOnMount);
