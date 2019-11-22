// TODO: We need to refactor a bunch of stuff

import { hot } from 'react-hot-loader';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@rmwc/theme';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Map, TileLayer, AttributionControl } from 'react-leaflet';
import SpotSearch from './Search';
import SpotCard from './Widgets/SpotCard';
import CardSlide from './Transitions/CardSlide';
import ShowAddSpotBottomBar from './Transitions/ShowAddSpotBottomBar';
import SpotForm from './addspot';
import AccountMenu from './AccountMenu';
import { sendAjax, distance } from '../helper/helper';
import SpotViewParent from './SpotDisplay';
import RunOnMount from './Widgets/RunOnMount';
import AppToolbar from './Toolbar';
import { SkateSpotMarker, AddSpotMarker } from './Widgets/SkateSpotMarker';
import history from './History';
import LoginWindow from './Login';
import Logout from './Logout';
import AuthRoute from './AuthRoute';
import Snackbar from './Widgets/Snackbar';
import MapFABs from './Widgets/MapFABs';

const makePublicSpotsURL = (latlng = null) => {
  const maxDistanceKM = 6; // Width of rit
  const locCenter = latlng !== null ? `lng=${latlng.lng}&lat=${latlng.lat}&dist=${maxDistanceKM}` : '';
  return `/spots?${locCenter}`;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 43.082854, lng: -77.686937 },
      lastFetchedCenter: { lat: 43.082854, lng: -77.686937 },
      newSpotLocation: {},
      zoom: 17,
      spots: [], // New main spot list, have skatespotlist send state to this
      addingNewSpot: 0, // 0 = not adding spot, 1 = current center, 2 = spot location set
      csrf: '',
      toolbarTitle: '',
      locationWatchId: null,
      watchingLocation: false,
      selectedSpot: null, // Spot to show card of in base route
      userAuthed: false, // Stores local state regarding if we're logged in or not
      userAuthedName: '', // Username of the authed user
    };
    this.onFetchSpots = this.onFetchSpots.bind(this);
    this.onChange = this.onChange.bind(this);
    this.updateSpots = this.updateSpots.bind(this);
    this.onNewSpot = this.onNewSpot.bind(this);
    this.setNewSpotLocation = this.setNewSpotLocation.bind(this);
    this.onZoomChange = this.onZoomChange.bind(this);
    this.hideSpotCard = this.hideSpotCard.bind(this);
    this.setSpotCard = this.setSpotCard.bind(this);
    this.setSnackbar = this.setSnackbar.bind(this);
    this.checkUserAuth = this.checkUserAuth.bind(this);
    this.getUserGeolocation = this.getUserGeolocation.bind(this);
    this.snackbar = React.createRef();
    this.setParentState = this.setParentState.bind(this);
  }

  componentDidMount() {
    sendAjax('GET', '/getToken', null, (result) => {
      console.log(result.csrfToken);
      this.setState({ csrf: result.csrfToken });
    });

    sendAjax('GET', '/spots', null, (data) => {
      console.log('fetching ajax spots');
      this.onFetchSpots(data.spots);
    });

    this.checkUserAuth();
  }

  onFetchSpots(newSpots) {
    this.setState({ spots: newSpots });
  }

  onChange(e) {
    this.setState({ center: e.target.getCenter(), selectedSpot: null });
    this.stopWatchingGeolocation();
    this.updateSpots();
  }

  onZoomChange(e) {
    this.setState({ zoom: e.target.getZoom() });
  }

  onNewSpot() {
    this.updateSpots(true);
    this.setSnackbar('New Spot Added');
  }

  setSnackbar(message) {
    this.snackbar.current.setSnackbar(message);
  }

  getUserGeolocation() {
    const { watchingLocation } = this.state;
    if ('geolocation' in navigator) {
      if (watchingLocation === false) {
        this.setState({ watchingLocation: true });
        console.log('Asking for user location/Starting');
        const watchID = navigator.geolocation.watchPosition((position) => {
          console.log('Fetching position');
          this.setState({
            center: { lat: position.coords.latitude, lng: position.coords.longitude },
          });
        }, (error) => {
          console.log(error);
          if (error.code === 1) {
            console.log("User doesn't allow location");
          }
          this.stopWatchingGeolocation();
        }, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
        this.setState({ locationWatchId: watchID });
        console.log(watchID);
      } else {
        this.stopWatchingGeolocation();
      }
    } else {
      /* geolocation IS NOT available */
    }
  }

  setNewSpotLocation(loc) {
    this.setState({ newSpotLocation: loc, addingNewSpot: 2 });
  }

  getCSRFToken() {
    sendAjax('GET', '/getToken', null, (result) => {
      console.log(result.csrfToken);
      this.setState({ csrf: result.csrfToken });
    });
  }

  setSpotCard(spot) {
    this.setState({
      selectedSpot: spot,
      center: {
        lat: spot.location[1],
        lng: spot.location[0],
      },
    });
    if (history.location.pathname.includes('/spot/')) {
      history.push('/');
    }
  }

  setParentState(state) {
    this.setState(state);
  }

  hideSpotCard() {
    this.setState({ selectedSpot: null });
    if (history.location.pathname.includes('/spot/')) {
      history.push('/');
    }
  }

  stopWatchingGeolocation() {
    const { watchingLocation, locationWatchId } = this.state;
    if (watchingLocation === true) {
      console.log('Stopping location watch');
      navigator.geolocation.clearWatch(locationWatchId);
      this.setState({ watchingLocation: false });
    }
  }

  updateSpots(forceUpate = false) {
    // current search dist is 1700 m
    const { center, lastFetchedCenter } = this.state;
    if (distance(center, lastFetchedCenter) > 0.8 || forceUpate === true) {
      const toFetch = makePublicSpotsURL(center);
      sendAjax('GET', toFetch, null, (data) => {
        console.log('fetching ajax spots');
        this.setState({ spots: data.spots, lastFetchedCenter: center });
      });
    }
  }

  checkUserAuth() {
    sendAjax('GET', '/isUserAuthed', null, (data) => {
      if (data.account !== undefined) {
        this.setState({ userAuthed: true, userAuthedName: data.account.username });
      }
    });
  }

  render() {
    const {
      center,
      zoom,
      spots,
      addingNewSpot,
      csrf,
      toolbarTitle,
      watchingLocation,
      newSpotLocation,
      selectedSpot,
      userAuthed,
      userAuthedName,
    } = this.state;
    return (
      <ThemeProvider options={{
        primary: '#263238',
        secondary: '#d50000',
      }}
      >
        <AppToolbar
          title={toolbarTitle}
          userAuthed={userAuthed}
          username={userAuthedName}
          refreshAction={() => this.updateSpots(true)}
        />
        <div className="appGrid">
          <Route render={({ location }) => {
            // Use default if animation vales are not provided by the Link
            const transitionToUse = (location.state !== undefined
              && location.state.transition !== undefined)
              ? location.state.transition : CardSlide.transition;
            const timeoutToUse = (location.state !== undefined
              && location.state.duration !== undefined)
              ? location.state.duration : CardSlide.duration;

            return (
              <TransitionGroup
                childFactory={child => React.cloneElement(
                  child,
                  {
                    classNames: transitionToUse,
                    timeout: timeoutToUse,
                  },
                )}
              >
                <CSSTransition key={location.key}>
                  <Switch location={location}>
                    <Route
                      exact
                      path="/"
                      render={() => (
                        <RunOnMount
                          onMount={this.setParentState}
                          onMountParams={{ addingNewSpot: 0, toolbarTitle: '' }}
                        >
                          {selectedSpot !== null
                          && <SpotCard spot={selectedSpot} />
                          }
                        </RunOnMount>
                      )}
                    />
                    <Route
                      exact
                      path="/login"
                      render={() => (
                        <LoginWindow
                          onMount={this.setParentState}
                          onMountParams={{ toolbarTitle: 'Login' }}
                          csrf={csrf}
                          onLogin={() => {
                            this.checkUserAuth();
                            this.setSnackbar('Logged In');
                          }}
                          onError={this.setSnackbar}
                        />
                      )}
                    />

                    <Route
                      exact
                      path="/logout"
                      render={() => (
                        <Logout
                          onLogout={() => {
                            this.setState({ userAuthed: false, userAuthedName: '' }, () => {
                              this.setSnackbar('Logged Out');
                              this.getCSRFToken();
                              history.goBack();
                            });
                          }}
                          onError={this.setSnackbar}
                          onMount={this.setParentState}
                          onMountParams={{ toolbarTitle: '' }}
                        />
                      )}
                    />

                    <Route
                      path="/search"
                      render={() => (
                        <SpotSearch
                          center={center}
                          onMount={this.setParentState}
                          onMountParams={{ toolbarTitle: 'Search' }}
                        />
                      )}
                    />

                    <Route
                      path="/spot/:id"
                      render={props => (
                        <SpotViewParent
                          key={props.match.params.id}
                          csrf={csrf}
                          onOpen={(newCenter, title) => {
                            this.setState({ center: newCenter, toolbarTitle: title }, () => {
                              this.updateSpots(true);
                            });
                          }}
                          userAuthed={userAuthed}
                          onReviewAdd={this.setSnackbar}
                          onMount={() => {
                            this.setState({ addingNewSpot: 0 });
                            this.stopWatchingGeolocation();
                          }}
                          {...props}
                        />
                      )}
                    />

                    <Route
                      path="/profile"
                      render={() => (
                        <AccountMenu
                          csrf={csrf}
                          onMount={this.setParentState}
                          onMountParams={{ toolbarTitle: 'Change Password' }}
                        />
                      )}
                    />

                    <AuthRoute
                      path="/add"
                      userAuthed={userAuthed}
                      render={() => (
                        <SpotForm
                          csrf={csrf}
                          loc={center}
                          submitCallback={this.onNewSpot}
                          setSpotCallback={this.setNewSpotLocation}
                          onMount={() => {
                            this.setState({ addingNewSpot: 1, toolbarTitle: 'Add Spot' });
                            this.stopWatchingGeolocation();
                          }}
                        />
                      )}
                    />
                  </Switch>
                </CSSTransition>
              </TransitionGroup>
            );
          }}
          />
          <div className="skatespot-map__parent">
            <Map
              center={[center.lat, center.lng]}
              zoom={zoom}
              onDragend={this.onChange}
              onZoomend={this.onZoomChange}
              onClick={this.hideSpotCard}
              attributionControl={false}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
              />
              <AttributionControl position="topright" />
              {
                spots.map(spot => (
                  <SkateSpotMarker
                    key={spot._id}
                    spot={spot}
                    position={[spot.location[1], spot.location[0]]}
                    onClick={this.setSpotCard}
                  />
                ))
              }
              {addingNewSpot === 1
              && <AddSpotMarker position={[center.lat, center.lng]} />
              }
              {addingNewSpot === 2
              && <AddSpotMarker position={[newSpotLocation.lat, newSpotLocation.lng]} />
              }
            </Map>
            <MapFABs
              ShowAddSpotBottomBar={ShowAddSpotBottomBar}
              watchingLocation={watchingLocation}
              getUserGeolocation={this.getUserGeolocation}
            />
          </div>
        </div>
        <Snackbar ref={this.snackbar} />
      </ThemeProvider>
    );
  }
}

export default hot(module)(App);
