import React from 'react';
import { TextField } from '@rmwc/textfield';
import {
  Dialog,
  DialogSurface,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogFooterButton,
  DialogBackdrop,
} from '@rmwc/dialog';
import { TabBar, Tab } from '@rmwc/tabs';
import PropTypes from 'prop-types';
import history from './History';
import NoTransition from './Transitions/NoTransition';
import withRunOnMount from './Widgets/WithRunOnMount';

class LoginWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      openTab: 0,
    };

    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.password2Ref = React.createRef();

    this.onDialogClose = this.onDialogClose.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.loginThenClose = this.loginThenClose.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ dialogOpen: true });
    }, 100);
  }

  onDialogClose() {
    this.setState({ dialogOpen: false }, () => {
      setTimeout(() => {
        console.log('onDialogClose going back');
        history.goBack({ state: NoTransition });
      }, 100);
    });
  }

  loginThenClose() {
    this.submitLogin(() => {
      this.setState({ dialogOpen: false }, () => {
        console.log('loginThenClose going back');
        history.goBack({ state: NoTransition });
      });
    });
  }

  submitLogin(callback) {
    const { csrf, onLogin, onError } = this.props;
    const { openTab } = this.state;
    const username = this.usernameRef.current.value;
    const password = this.passwordRef.current.value;
    let seralized = `username=${username}&pass=${password}&_csrf=${csrf}`;
    let formAction = '/login';

    if (openTab === 1) {
      const password2 = this.password2Ref.current.value;
      formAction = '/signup';
      seralized = `username=${username}&pass=${password}&pass2=${password2}&_csrf=${csrf}`;
    }
    // replace this Jquery with something else eventually
    $.ajax({
      cache: false,
      type: 'POST',
      url: formAction,
      data: seralized,
      dataType: 'json',
      success: () => {
        console.log('logged in I guess');
        onLogin();
        if (callback) {
          callback();
        }
      },
      error: (xhr) => {
        const messageObj = JSON.parse(xhr.responseText);
        let errorType = 'Login';
        if (formAction === '/signup') {
          errorType = 'Signup';
        }
        onError(`${errorType} Error: ${messageObj.error}`);
      },
    });
  }

  render() {
    const { csrf } = this.props;
    const { dialogOpen, openTab } = this.state;
    let submitButtonLabel = 'Log-In';
    if (openTab === 1) {
      submitButtonLabel = 'Sign-Up';
    }
    return (
      <Dialog
        open={dialogOpen}
        onClose={this.onDialogClose}
        onAccept={this.submitLogin}
      >
        <DialogSurface>
          <DialogHeader>
            <TabBar
              activeTabIndex={openTab}
              onActivate={(evt) => {
                this.setState({ openTab: evt.detail.index });
                console.log(evt.detail);
              }}
              style={{ width: '100%' }}
            >
              <Tab>Login</Tab>
              <Tab>Sign-up</Tab>
            </TabBar>
          </DialogHeader>
          <DialogBody>
            <form
              id="loginForm"
              style={{ padding: '12px', display: 'flex', flexDirection: 'column' }}
              onSubmit={(e) => {
                e.preventDefault();
                this.loginThenClose();
              }}
            >
              <TextField ref={this.usernameRef} id="user" name="username" label="Username" />
              <TextField type="password" ref={this.passwordRef} name="pass" label="Password" />
              {openTab === 1
              && <TextField type="password" ref={this.password2Ref} name="pass2" label="Confirm Password" />
              }
              <input type="hidden" name="_csrf" value={csrf} />
              <input type="submit" style={{ display: 'none' }} />
            </form>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButton cancel>Cancel</DialogFooterButton>
            <DialogFooterButton onClick={this.loginThenClose}>
              {submitButtonLabel}
            </DialogFooterButton>
          </DialogFooter>
        </DialogSurface>
        <DialogBackdrop />
      </Dialog>
    );
  }
}

LoginWindow.propTypes = {
  csrf: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withRunOnMount(LoginWindow);
