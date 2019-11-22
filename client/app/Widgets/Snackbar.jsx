import React from 'react';

class Snackbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSnackbar: false,
      message: '',
      timerID: undefined,
    };
    this.setSnackbar = this.setSnackbar.bind(this);
  }

  setSnackbar(message) {
    const { showSnackbar, timerID } = this.state;
    if (showSnackbar === false) {
      this.setState({ showSnackbar: true, message }, () => {
        const newTimerID = setTimeout(() => {
          this.setState({ showSnackbar: false });
        }, 2000);
        this.setState({ timerID: newTimerID });
      });
    } else {
      clearTimeout(timerID);
      this.setState({ showSnackbar: false }, () => {
        setTimeout(() => {
          this.setSnackbar(message);
        }, 600);
      });
    }
  }

  render() {
    const { message, showSnackbar } = this.state;

    const style = showSnackbar ? 'mdc-snackbar mdc-snackbar--active' : 'mdc-snackbar';
    return (
      <div
        className={style}
        aria-live="assertive"
        aria-atomic="true"
        aria-hidden="true"
      >
        <div className="mdc-snackbar__text">{message}</div>
      </div>
    );
  }
}

export default Snackbar;
