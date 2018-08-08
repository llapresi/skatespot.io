import React from 'react';
import { Button, ButtonIcon } from 'rmwc/Button';
import { TextField, TextFieldIcon, TextFieldHelperText } from 'rmwc/TextField';
import { Typography } from 'rmwc/Typography';
import { Checkbox } from 'rmwc/Checkbox';
import { Snackbar } from 'rmwc/Snackbar';
import { Redirect } from 'react-router-dom';


class SpotForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: '',
      errorSnackbar: false,
      spotAdded: false,
    };
  }

  createSpot(e) {
    e.preventDefault();
    $.ajax({
      cache: false,
      type: 'POST',
      url: '/spots',
      data: $(e.target).serialize(),
      dataType: "json",
      error: function(xhr, status, error) {
        var messageObj = JSON.parse(xhr.responseText);
        this.setState({errorSnackbar: true, errorMessage: messageObj.error})
      }.bind(this),
    }).done(() => {
      this.props.submitCallback();
      this.setState({spotAdded: true});
    });
  }

  render() {
    return(
      <div className="spot_infobox">
        <form id="spotForm"
        onSubmit={this.createSpot.bind(this)}
        name="spotForm"
        action="/spots"
        method="POST"
        className="spotForm">
          <Typography use="subheading2">Drag map to new spot position</Typography>
          <TextField className="spot_name" label="Spot Name" name="name"/>
          <br />
          <TextField textarea fullwidth label="Spot Description" rows="4" name="description"  />
          <Checkbox name="isSponsored">Sponsored Post</Checkbox>
          <br />
          <div>
            <Typography use="caption">Increase your visibility with a Sponsored Post.
            Sponsored Posts always show at the top of search listings, ensuring
            "premium placement for a premium&trade;"</Typography>
          </div>
          <br />
          <Button raised theme={['secondary-bg', 'text-primary-on-secondary']}>Submit</Button>

          <input id="spotLong" type="hidden" name="longitude" value={this.props.loc.lng} />
          <input id="spotLat" type="hidden" name="latitude" value={this.props.loc.lat} />
          <input type="hidden" name="_csrf" value={this.props.csrf} />
        </form>
        <Snackbar
          show={this.state.errorSnackbar}
          onHide={evt => this.setState({errorSnackbar: false})}
          message={this.state.errorMessage}
          actionText="Close"
          actionHandler={() => {}}
        />

        {this.state.spotAdded == true &&
          <Redirect to='/'/>
        }
      </div>
    );
  }
};

export default SpotForm;