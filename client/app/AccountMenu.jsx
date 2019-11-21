import React from 'react';
import { Snackbar } from '@rmwc/snackbar';
import PropTypes from 'prop-types';
import ChangePasswordForm from './Widgets/ChangePasswordForm';
import withRunOnMount from './Widgets/WithRunOnMount';

class AccountMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSnackbar: false,
      snackbarMsg: '',
    };
    this.setPasswordNotification = this.setPasswordNotification.bind(this);
    this.hideSnackbar = this.hideSnackbar.bind(this);
  }

  setPasswordNotification(message) {
    this.setState({ showSnackbar: true, snackbarMsg: message });
  }

  hideSnackbar() {
    this.setState({ showSnackbar: false });
  }

  render() {
    const { passwordChanged, showSnackbar, snackbarMsg } = this.state;
    const { csrf } = this.props;
    return (
      <div>
        {passwordChanged === true
        && <div>Password Changed Successfully!</div>
        }
        <ChangePasswordForm csrf={csrf} passwordCallback={this.setPasswordNotification} />
        <Snackbar
          show={showSnackbar}
          onHide={this.hideSnackbar}
          message={snackbarMsg}
          actionText="Close"
          actionHandler={() => {}}
        />
      </div>
    );
  }
}
AccountMenu.propTypes = {
  csrf: PropTypes.string.isRequired,
};

export default withRunOnMount(AccountMenu);
