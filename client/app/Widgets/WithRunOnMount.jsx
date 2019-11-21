import React from 'react';

// HOC that runs a function with passed params on mount
function withRunOnMount(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      const { onMount, onMountParams } = this.props;
      if (onMountParams) {
        if (Array.isArray(onMountParams)) {
          onMount(...onMountParams);
        } else {
          onMount(onMountParams);
        }
      } else {
        onMount();
      }
    }

    render() {
      // BUG
      // This currently passes func and funcParams into the wrapped component
      // Need to change to wahtever ES version supported excluding those two thhrough destructuring
      // ex.
      // const { onMount, onMountParams, ...rest } = this.props;
      // return <WrappedComponent {...rest} />;
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withRunOnMount;
