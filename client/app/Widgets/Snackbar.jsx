import React, { useState, useEffect } from 'react';

const Snackbar = (props) => {
  const { message } = props;
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (message !== '') {
      setShowSnackbar(true);
    }
  }, [message]);

  useEffect(() => {
    setTimeout(() => {
      setShowSnackbar(false);
    }, 2000);
  }, [showSnackbar]);

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
};

export default Snackbar;
