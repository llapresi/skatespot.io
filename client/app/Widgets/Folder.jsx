// This isn't actually a folder anymore, just a self-contained class for a dialog
import React from 'react';
import { Fab } from 'rmwc/Fab';
import { SimpleDialog } from 'rmwc/Dialog';
import PropTypes from 'prop-types';
import history from '../History';
import NoTransition from '../Transitions/NoTransition';


class Folder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showContent: false,
    };
    this.openReviewDialog = this.openReviewDialog.bind(this);
  }

  openReviewDialog() {
    const { userAuthed } = this.props;
    if (userAuthed) {
      this.setState({ showContent: true });
    } else {
      history.push('/login', { state: NoTransition });
    }
  }

  render() {
    const { folderName, children, acceptCallback } = this.props;
    const { showContent } = this.state;
    return (
      <React.Fragment>
        <Fab
          icon="add"
          className="fab__review"
          label={folderName}
          onClick={this.openReviewDialog}
        />
        <SimpleDialog
          title={folderName}
          body={children}
          open={showContent}
          onClose={() => this.setState({ showContent: false })}
          onAccept={acceptCallback}
          acceptLabel="Submit"
        />
      </React.Fragment>
    );
  }
}
Folder.propTypes = {
  folderName: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  acceptCallback: PropTypes.func.isRequired,
};

export default Folder;
