import { useEffect } from 'react';
import PropTypes from 'prop-types';
import withRunOnMount from './Widgets/WithRunOnMount';

const Logout = (props) => {
  const { onLogout, onError } = props;
  useEffect(() => {
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
  }, []);

  return (null);
};

Logout.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withRunOnMount(Logout);
