import React from 'react';
import PropTypes from 'prop-types';
import withRunOnMount from './Widgets/WithRunOnMount';

class Logout extends React.Component {
  componentDidMount() {
    const { onLogout, onError } = this.props;
    $.ajax({
      cache: false,
      type: 'GET',
      url: '/logout',
      success: () => {
        console.log('Logged out');
        onLogout();
      },
      error: (xhr) => {
        const messageObj = JSON.parse(xhr.responseText);
        onError(`Logout Error: ${messageObj.error}`);
      },
    });
  }

  render() {
    return (null);
  }
}
Logout.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withRunOnMount(Logout);
