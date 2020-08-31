import React, { Component } from "react";
import PropTypes from "prop-types";
import { env } from "./config";
import withAPI, { Json } from "./withAPI";
import withAuth from "./withAuth";

class GraphAPI extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    isB2B: PropTypes.bool,
    apiResult: PropTypes.object,
    apiError: PropTypes.object,
    onGetAPI: PropTypes.func.isRequired,
    onPostAPI: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      targetEmail: ""
    };
  }

  async onInputChange(e) {
    this.setState({
      targetEmail: e.target.value
    });
  }

  async onInviteB2BUser() {
    const scopes = env.auth.apiScopes;
    const endpoint = env.apiURL + "/user";
    const data = { Email: this.state.targetEmail };
    this.props.onPostAPI(scopes, endpoint, data);
  }

  async onCheckInvitationStatus() {
    const scopes = env.auth.apiScopes;
    const emailToCheck = this.state.targetEmail.endsWith("@" + env.auth.domain)
      ? this.state.targetEmail
      : // convert alias@company.com to alias_company.com#EXT#@domain
        this.state.targetEmail.replace("@", "_") + "#EXT#@" + env.auth.domain;
    const endpoint = env.apiURL + "/user/" + encodeURIComponent(emailToCheck);
    this.props.onGetAPI(scopes, endpoint);
  }

  render() {
    return (
      <section>
        {this.props.isAuthenticated && this.props.isB2B && (
          <>
            <input
              type="text"
              value={this.state.targetEmail}
              onChange={evt => this.onInputChange(evt)}
            />
            <input
              type="button"
              id="inviteBtn"
              value="Invite B2B User"
              onClick={() => this.onInviteB2BUser()}
            />
            <input
              type="button"
              id="inviteStatusBtn"
              value="Check Invitation Status"
              onClick={() => this.onCheckInvitationStatus()}
            />
            <div className="data-graph" id="data">
              {this.props.apiResult && <Json data={this.props.apiResult} />}
              {this.props.apiError && (
                <p className="error">Error: {this.props.apiError}</p>
              )}
            </div>
          </>
        )}
      </section>
    );
  }
}

export default withAuth(withAPI(GraphAPI));
