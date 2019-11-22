import React, { useState, useEffect } from 'react';
import { List, SimpleListItem } from '@rmwc/list';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TextField, TextFieldIcon } from '@rmwc/textfield';
import { Typography } from '@rmwc/typography';
import { Button } from '@rmwc/button';
import { sendAjax } from '../helper/helper';
import HideAddSpot from './Transitions/HideAddSpot';
import history from './History';
import withRunOnMount from './Widgets/WithRunOnMount';

const makePublicSpotsURL = (name = '', latlng = null, showAll = false) => {
  const maxDistanceKm = 6;
  let locCenter = latlng !== null ? `&lat=${latlng.lat}&lng=${latlng.lng}` : '';
  if (showAll === false) {
    locCenter = `${locCenter}&dist=${maxDistanceKm}`;
  }
  return `/spots?filter=${name}${locCenter}`;
};

const SpotSearchParent = (props) => {
  const [spots, setSpots] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchField, setSearchField] = useState('');

  const { center } = props;

  useEffect(() => {
    const searchAll = searchField === '' ? showAll : true;
    const toFetch = makePublicSpotsURL(searchField, center, searchAll);
    sendAjax('GET', toFetch, null, (data) => {
      setSpots(data.spots);
    });
  }, [searchField, showAll]);

  const showLocalControl = searchField === '';

  return (
    <div className="skateSpotListParent desktop-400 horizontal__desktop">
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f2f2f2' }}>
        <TextField
          className="newSearchBar"
          onChange={e => setSearchField(e.target.value)}
          label="Search all spots"
          withLeadingIcon={(
            <TextFieldIcon
              tabIndex="0"
              icon="arrow_back"
              onClick={() => history.push('/', { HideAddSpot })}
            />
          )}
        />
      </div>
      {showLocalControl
      && (
      <SpotNearbyControl
        onClick={() => setShowAll(!showAll)}
        showAll={showAll}
      />
      )}
      <SpotSearch spots={spots} />
    </div>
  );
};

SpotSearchParent.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

const SpotNearbyControl = ({ onClick, showAll }) => {
  console.log(showAll);
  const labelText = showAll === true ? 'Showing All Spots' : 'Showing Nearby Spots';
  const buttonText = showAll === true ? 'Show Nearby' : 'Show All';
  return (
    <div style={{
      padding: '.5em 1em .5em 1em',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgb(240, 240, 240)',
    }}
    >
      <Typography use="body2">{labelText}</Typography>
      <Button
        style={{ marginLeft: 'auto' }}
        onClick={onClick}
      >
        <span>{buttonText}</span>
      </Button>
    </div>
  );
};

SpotNearbyControl.propTypes = {
  onClick: PropTypes.func.isRequired,
  showAll: PropTypes.bool.isRequired,
};

const SpotSearch = ({ spots }) => (
  <List twoLine className="spotList">
    {spots.map((spot) => {
      let classNameString = '';
      let descriptionAppend = '';
      if (spot.isSponsored === true) {
        classNameString += 'spot__sponsored';
        descriptionAppend += 'Sponsored: ';
      }
      return (
        <Link key={spot._id} className="remove-link-styling force-block" to={{ pathname: `/spot/${spot._id}`, state: { spot } }}>
          <SimpleListItem className={classNameString} text={spot.name} secondaryText={descriptionAppend + spot.description} meta="info" />
        </Link>
      );
    })}
  </List>
);
SpotSearch.propTypes = {
  spots: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withRunOnMount(SpotSearchParent);
