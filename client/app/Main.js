// TODO: We need to refactor a bunch of stuff + clean up legacy callbacks
// to stuff from the pre-material web components UI
// Also, move toolbar to it's own file

import { hot } from 'react-hot-loader';
import React from 'react';
import SpotForm from './addspot.js';
import {AccountMenu} from './profile.js';
import { sendAjax } from '../helper/helper.js'
import GoogleMapReact from 'google-map-react';
import { Fab } from 'rmwc/Fab';
import { SkateSpotListParent } from './SpotList.js';
import SearchBox from './Widgets/Searchbox';
import { Button, ButtonIcon } from 'rmwc/Button';
import { Elevation } from 'rmwc/Elevation';
import { Snackbar } from 'rmwc/Snackbar';
import { Route, Link, Switch } from 'react-router-dom';
import SpotViewParent from './SpotDisplay.js';
import RunOnMount from './Widgets/RunOnMount.js';
import AppToolbar from './Toolbar.js';
import { ThemeProvider } from 'rmwc/Theme';
import { CSSTransition, TransitionGroup, } from 'react-transition-group';
import ShowAddSpot from './Transitions/ShowAddSpot.js'


let defaultURL = '/spots';

const makePublicSpotsURL = (name = '', description = '', showOurSpots = false) => {
  let profileSpots = showOurSpots ? 'profileSpots=true' : '';
  return `/spots?filter=${name}&${profileSpots}`;
};

const SkateSpotMarker = (props) => {
  return(
    <Link to={{pathname: '/spot/' + props.spot._id, state: {spot: props.spot}}}><div className="mapMarker"></div></Link>
  );
}

const AddSpotMarker = (props) => {
  return(
    <div className='mapMarker mapMarker__addspot'></div>
  );
}

const GeolocationFAB = (props) => {
  let cssClassNames = props.watchingLocation ? "skatespot-map__location skatespot-map__location-active" : "skatespot-map__location";
  return(
    <Fab className={cssClassNames} onClick={props.onClick}>gps_fixed</Fab>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {lat: 43.084727, lng: -77.674423},
      zoom: 17,
      spots: [], // New main spot list, have skatespotlist send state to this
      addingNewSpot: false,
      csrf: '',
      showOurSpots: false,
      showSnackbar: false,
      toolbarTitle: "",
      locationWatchId: null,
      watchingLocation: false
    };
    this.onFetchSpots = this.onFetchSpots.bind(this);
  }

  componentDidMount() {
    sendAjax("GET", "/getToken", null, (result) => {
      console.log(result.csrfToken);
      this.setState({csrf: result.csrfToken});
    });

    sendAjax('GET', '/spots', null, (data) => {
      console.log("fetching ajax spots");
      this.onFetchSpots(data.spots);
    });
  }

  updatePublicView() {
    let toFetch = makePublicSpotsURL($('#spotName').val(), $('#spotDesc').val(), this.state.showOurSpots);
    console.log(toFetch);
    sendAjax('GET', toFetch, null, (data) => {
      console.log("fetching ajax spots");
      this.setState({spots: data.spots})
    });
  }

  onFetchSpots(newSpots) {
    this.setState({spots: newSpots})
  }

  onChange({center, zoom}) {
    this.setState({center: center});
  }

  onNewSpot() {
    this.updatePublicView();
    this.setState({showSnackbar: true});
  }

  render() {
    return(
      <ThemeProvider options={{
        primary: '#263238',
        secondary: '#d50000'
      }}>
        <AppToolbar title={this.state.toolbarTitle}/>
        <div className="appGrid">
          <div className="skatespot-map__parent">
            <GoogleMapReact className="skatespot-map__map"
              bootstrapURLKeys={{ key: 'AIzaSyCLrWfeNtdjy7sTf9YKsqYn5ZUqYVbjhWo' }}
              center={this.state.center}
              zoom={this.state.zoom}
              onChange={this.onChange.bind(this)}
              options={{
                zoomControl: false,
                fullscreenControl: false,
              }}
              onDrag={() => this.stopWatchingGeolocation()}
            >
              {
                this.state.spots.map((spot) => {
                  return(
                    <SkateSpotMarker key={spot._id} spot={spot} text={spot.name}
                      lat={spot.location[1]} lng={spot.location[0]}>
                    </SkateSpotMarker>
                  );
                })
              }
              {this.state.addingNewSpot == true &&
                <AddSpotMarker addspot={true} lat={this.state.center.lat} lng={this.state.center.lng} />
              }
            </GoogleMapReact>

            <Link to={{pathname: '/add', state: ShowAddSpot}}><Fab className="skatespot-map__fab">add_location</Fab></Link>
            <GeolocationFAB watchingLocation={this.state.watchingLocation} onClick={() => this.getUserGeolocation()}/>
            <Elevation z={2}>
              <SearchBox searchCallback={(newLoc) => this.setState({center: newLoc})} />
            </Elevation>
          </div>
          <Route render={({location}) => {
            // Use default if animation vales are not provided by the Link
            let transitionToUse = (location.state !== undefined && location.state.transition !== undefined) ? location.state.transition : "transition__show_addspot";
            let timeoutToUse = (location.state !== undefined && location.state.duration !== undefined) ? location.state.duration: 250;              
            return (
            <TransitionGroup
              childFactory={child => React.cloneElement(
                child,
                {
                  classNames: transitionToUse,
                  timeout: timeoutToUse
                }
              )}
            >
              <CSSTransition key={location.key}>
                <div className="skatespot-sidebar">
                  <Switch location={location}>
                    <Route exact path='/' render={() =>
                      <React.Fragment>
                        <RunOnMount func={() => this.setState({addingNewSpot: false, toolbarTitle: ""})}/>
                        <SkateSpotListParent
                          spots={this.state.spots}
                          csrf={this.state.csrf } 
                          url={defaultURL} 
                          updatePublicView={this.updatePublicView.bind(this)}
                        />
                      </React.Fragment>
                    }/>

                    <Route path='/spot/:id' render={(props)=> <React.Fragment>
                      <RunOnMount func={() => {
                        this.setState({addingNewSpot: false});
                        this.stopWatchingGeolocation();
                      }}/>
                      <SpotViewParent 
                        key={props.match.params.id}
                        csrf={this.state.csrf}
                        onOpen={(newCenter, title) => this.setState({center: newCenter, toolbarTitle: title}) } 
                        {...props} 
                      />
                    </React.Fragment>} />

                    <Route path='/profile' render={() => <React.Fragment>
                      <RunOnMount func={() => this.setState({addingNewSpot: false, toolbarTitle: "Change Password"})}/>
                      <AccountMenu csrf={this.state.csrf} />
                    </React.Fragment>} />

                    <Route path='/add' render={() => <React.Fragment>
                      <RunOnMount func={() => {
                        this.setState({addingNewSpot: true, toolbarTitle: "Add Spot"})
                        this.stopWatchingGeolocation();
                      }}/>
                      <SpotForm csrf={this.state.csrf} loc={this.state.center} submitCallback={this.onNewSpot.bind(this)} />
                    </React.Fragment>}/>
                  </Switch>
                </div>
              </CSSTransition>
            </TransitionGroup>
          )}} />
        </div>
        <Snackbar
          show={this.state.showSnackbar}
          onHide={evt => this.setState({showSnackbar: false})}
          message="New Spot Created"
          actionText="Close"
          actionHandler={() => {}}
        />
      </ThemeProvider>
    )
  }
  
  getUserGeolocation() {
    if ("geolocation" in navigator) {
      if (this.state.watchingLocation === false) {
        this.setState({watchingLocation: true});
        console.log("Asking for user location/Starting");
        let watchID = navigator.geolocation.watchPosition((position) => {
          console.log("Fetching position");
          this.setState({center: {lat: position.coords.latitude, lng: position.coords.longitude}});
        }, (error) => {
          console.log(error);
          if(error.code === 1) {
            console.log("User doesn't allow location");
            this.setState({watchingLocation: false});
          }
        });
        this.setState({locationWatchId: watchID});
        console.log(watchID);
      } else {
        this.stopWatchingGeolocation();
      }
    } else {
      /* geolocation IS NOT available */
    }
  }

  stopWatchingGeolocation() {
    if(this.state.watchingLocation === true) {
      console.log("Stopping location watch");
      navigator.geolocation.clearWatch(this.state.locationWatchId);
      this.setState({watchingLocation: false});
    }
  }
}

export default hot(module)(App);