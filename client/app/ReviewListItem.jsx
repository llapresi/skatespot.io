import React, { useState } from 'react';
import { SimpleListItem } from '@rmwc/list';
import ObjectPropTypes from './ObjectShapes';

const ReviewListItem = (props) => {
  const [fullText, setFullText] = useState(false);
  const { review } = props;
  const { author, rating: reviewRating, reviewText } = review;

  const className = fullText ? 'review-list-item review-list-item__active' : 'review-list-item';
  const username = author && author.username ? author.username : '[invalid username]';
  const reviewBody = reviewText || '[invalid review text]';
  const rating = reviewRating || '[invalid rating]';

  const usernameRating = `${username} - ${rating}`;
  return (
    <SimpleListItem
      onClick={() => setFullText(!fullText)}
      className={className}
      text={reviewBody}
      secondaryText={usernameRating}
    />
  );
};

ReviewListItem.propTypes = {
  review: ObjectPropTypes.Review.isRequired,
};

export default ReviewListItem;
