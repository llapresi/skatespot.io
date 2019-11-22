// This isn't actually a folder anymore, just a self-contained class for a dialog
import React, { useState } from 'react';
import { Fab } from '@rmwc/fab';
import { SimpleDialog } from '@rmwc/dialog';
import PropTypes from 'prop-types';
import history from '../History';
import NoTransition from '../Transitions/NoTransition';


const Folder = (props) => {
  const [showContent, setShowContent] = useState(false);
  const {
    folderName,
    children,
    acceptCallback,
    userAuthed,
  } = props;

  const openReviewDialog = () => {
    if (userAuthed) {
      setShowContent(true);
    } else {
      history.push('/login', { NoTransition });
    }
  };

  return (
    <React.Fragment>
      <Fab
        icon="add"
        className="fab__review"
        label={folderName}
        onClick={openReviewDialog}
      />
      <SimpleDialog
        title={folderName}
        body={children}
        open={showContent}
        onClose={() => setShowContent(false)}
        onAccept={acceptCallback}
        acceptLabel="Submit"
      />
    </React.Fragment>
  );
};

Folder.propTypes = {
  folderName: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  acceptCallback: PropTypes.func.isRequired,
  userAuthed: PropTypes.bool.isRequired,
};

export default Folder;
