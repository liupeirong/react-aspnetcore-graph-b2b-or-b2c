import React, { Component } from "react";
import PropTypes from "prop-types";
import { getAPI, postAPI } from "./auth-utils";

export default C =>
    class extends Component {
        static propTypes = {
            account: PropTypes.object,
            acquireToken: PropTypes.func.isRequired,
        };

        constructor(props) {
            super(props);

            this.state = {
                apiResult: null,
                apiError: null,
            };
        }

        async onGetAPI(scopes, endpoint) {
            const tokenResponse = await this.props.acquireToken(
                {"scopes": scopes}
            ).catch(e => {
                this.setState({
                    error: "Unable to acquire access token."
                });
            });

            if (tokenResponse) {
                const apiResult = await getAPI(
                    endpoint, 
                    tokenResponse.accessToken
                ).catch(() => {
                    this.setState({
                        apiError: "Unable to read web API."
                    });
                });

                if (apiResult) {
                    this.setState({
                        apiResult: apiResult,
                        apiError: null
                    });
                }
            }
        }

        async onPostAPI(scopes, endpoint, body) {
            const tokenResponse = await this.props.acquireToken(
                {"scopes": scopes}
            ).catch(e => {
                this.setState({
                    apiError: "Unable to acquire access token."
                });
            });

            if (tokenResponse) {
                const apiResult = await postAPI(
                    endpoint,
                    tokenResponse.accessToken,
                    body
                ).catch(e => {
                    this.setState({
                        apiError: "Unable to post web API."
                    });
                });

                if (apiResult) {
                    this.setState({
                        apiResult: apiResult,
                        apiError: null
                    });
                }
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
                    onPostAPI={(scopes, endpoint, body) => this.onPostAPI(scopes, endpoint, body)}
                />
            );
        }
    };

export const Json = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>;