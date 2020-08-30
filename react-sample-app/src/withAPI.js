import React, { Component } from "react";
import PropTypes from "prop-types";
import { getAPI, postAPI } from "./auth-utils";

export default C =>
  class extends Component {
    static propTypes = {
      account: PropTypes.object,
      acquireToken: PropTypes.func.isRequired
    };

    constructor(props) {
      super(props);

      this.state = {
        apiResult: null,
        apiError: null
      };
    }

    async onGetAPI(scopes, endpoint) {
      try {
        const tokenResponse = await this.props.acquireToken({ scopes: scopes });
        if (tokenResponse) {
          const apiResult = await getAPI(endpoint, tokenResponse.accessToken);
          if (apiResult) {
            this.setState({
              apiResult: apiResult,
              apiError: null
            });
          }
        }
      } catch (e) {
        this.setState({
          apiError: e
        });
      }
    }

    async onPostAPI(scopes, endpoint, body) {
      try {
        const tokenResponse = await this.props.acquireToken({ scopes: scopes });
        if (tokenResponse) {
          const apiResult = await postAPI(
            endpoint,
            tokenResponse.accessToken,
            body
          );
          if (apiResult) {
            this.setState({
              apiResult: apiResult,
              apiError: null
            });
          }
        }
      } catch (e) {
        this.setState({
          apiError: e
        });
      }
    }

    render() {
      return (
        <C
          {...this.props}
          isAuthenticated={this.props.account !== null}
          isB2B={this.props.is_b2b}
          apiResult={this.state.apiResult}
          apiError={this.state.apiError}
          onGetAPI={(scopes, endpoint) => this.onGetAPI(scopes, endpoint)}
          onPostAPI={(scopes, endpoint, body) =>
            this.onPostAPI(scopes, endpoint, body)
          }
        />
      );
    }
  };

export const Json = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>;
