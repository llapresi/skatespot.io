import React, { useEffect } from 'react';

// HOC that runs a function with passed params on mount
const withRunOnMount = WrappedComponent => (props) => {
  const { onMount, onMountParams } = props;
  useEffect(() => {
    if (onMountParams) {
      if (Array.isArray(onMountParams)) {
        onMount(...onMountParams);
      } else {
        onMount(onMountParams);
      }
    } else {
      onMount();
    }
  }, []);

  // BUG
  // This currently passes func and funcParams into the wrapped component
  // Need to change to wahtever ES version supported excluding those two thhrough destructuring
  // ex.
  // const { onMount, onMountParams, ...rest } = this.props;
  // return <WrappedComponent {...rest} />;
  return <WrappedComponent {...props} />;
};

export default withRunOnMount;
