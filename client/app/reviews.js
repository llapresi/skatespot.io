import React from 'react';
import { List, SimpleListItem } from 'rmwc/List';
import { TextField, TextFieldIcon, TextFieldHelperText } from 'rmwc/TextField';
import { Select } from 'rmwc/Select';
import { Button } from 'rmwc/Button';
import { Snackbar } from 'rmwc/Snackbar';
import Folder from './folder.js';


export const ReviewForm = (props) => {
  return(
    <div>
      <form id="reviewForm" className="reviewForm" action="/reviews" method="POST" onSubmit={props.submitAction}>
        <TextField label="Rating" name="rating" />
        <TextField textarea fullwidth label="Write review here..." rows="4" name="reviewText"  />
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input type="hidden" id="reviewFormSpotID" name="spot" value={props.spotId} />
      </form>
    </div>
  );
};

export class ReviewList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: [],
      errorMsg: '',
      showSnackbar: false,
      snackbarMsg: '',
    };
    this.updateReviews = this.updateReviews.bind(this);
  }

  updateReviews (id) {
    $.ajax({
      method: 'GET',
      url: `/reviews?spot=${id}`
    }).done((data) => {
      this.setState({reviews: data.reviews});
    });
  }
  
  componentDidMount() {
    this.updateReviews(this.props.spotId);
  }

  submitReview(e) {
    $.ajax({
      cache: false,
      type: 'POST',
      url: '/reviews',
      data: $("#reviewForm").serialize(),
      dataType: "json",
      error: function(xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        this.setState({snackbarMsg: messageObj.error, showSnackbar: true});
      }.bind(this),
    }).done(() => {
      this.updateReviews(this.props.spotId);
      this.setState({snackbarMsg: 'Review Submitted', showSnackbar: true});
    });
  }

  render() {
    return(
      <React.Fragment>
        <div className='review_section'>
          <h3 className='reviews-header'>Reviews:</h3>
          <Folder folderName="Add Review" acceptCallback={this.submitReview.bind(this)}>
            <ReviewForm spotId={this.props.spotId} csrf={this.props.csrf} />
          </Folder>
          <List twoLine="true" nonInteractive="true">
            {this.state.reviews.map(function(review) {
              return(
                <ReviewListItem
                  id={review.author}
                  rating={review.rating}
                  reviewText={review.reviewText} />
              );
            })}
          </List>
        </div>
        <Snackbar
          show={this.state.showSnackbar}
          onHide={evt => this.setState({showSnackbar: false})}
          message={this.state.snackbarMsg}
          actionText="Close"
          actionHandler={() => {}}
        />
      </React.Fragment>
    );
  }
};

export class ReviewListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '(username)',
    }
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `/getUsernameForId?id=${this.props.id}`
    }).done((data) => {
      this.setState({username: data.username});
    });
  }
  
  render() {
    const reviewText = this.props.reviewText;
    const usernameRating = `${this.state.username} - ${this.props.rating}`;
    return(
      <SimpleListItem text={this.props.reviewText} secondaryText={usernameRating} />
    );
  }
}