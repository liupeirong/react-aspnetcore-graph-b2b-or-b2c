import React, { Component } from "react";
import { env } from "./config"
import {
    msalApp,
    requiresInteraction,
    getAPI,
    postAPI
} from "./auth-utils";

export default C =>
    class AuthProvider extends Component {
        constructor(props) {
            super(props);

            this.state = {
                is_b2b: false,
                account: null,
                error: null,
                apiResults: null,
                targetEmail: "",
            };
        }

        async acquireToken(request) {
            return msalApp.acquireTokenSilent(request).catch(error => {
                // Call acquireTokenPopup (popup window) in case of acquireTokenSilent failure
                // due to consent or interaction required ONLY
                if (requiresInteraction(error.errorCode)) {
                    return msalApp.acquireTokenRedirect({
                            ...request,
                            redirectUri: env.auth.redirectURL
                        });
                } else {
                    console.error('Non-interactive error:', error.errorCode)
                }
            });
        }

        async onSignIn() {
            return msalApp.loginRedirect({
                "scopes": env.auth.loginScopes,
                redirectUri: env.auth.redirectURL 
            });

        }

        onSignOut() {
            msalApp.logout();
        }

        async onCallWeatherAPI() {
            const tokenResponse = await this.acquireToken(
                {"scopes": env.auth.apiScopes}
            ).catch(e => {
                this.setState({
                    error: "Unable to acquire access token."
                });
            });

            if (tokenResponse) {
                const apiResults = await getAPI(
                    env.apiURL + "/weatherforecast", 
                    tokenResponse.accessToken
                ).catch(() => {
                    this.setState({
                        error: "Unable to read web API."
                    });
                });

                if (apiResults) {
                    this.setState({
                        apiResults,
                        error: null
                    });
                }
            }
        }

        async onInputChange(e) {
            this.setState({
                targetEmail: e.target.value
            });
        }

        async onInviteB2BUser() {
            const tokenResponse = await this.acquireToken(
                {"scopes": env.auth.apiScopes}
            ).catch(e => {
                this.setState({
                    error: "Unable to acquire access token."
                });
            });

            if (tokenResponse) {
                const data = {"Email": this.state.targetEmail};
                const invitations = await postAPI(
                    env.apiURL + "/user", 
                    tokenResponse.accessToken,
                    data
                ).catch(e => {
                    this.setState({
                        error: "Unable to invite user."
                    });
                });

                if (invitations) {
                    this.setState({
                        apiResults: invitations,
                        error: null
                    });
                }
            }
        }

        async onCheckInvitationStatus() {
            const tokenResponse = await this.acquireToken(
                {"scopes": env.auth.apiScopes}
            ).catch(e => {
                this.setState({
                    error: "Unable to acquire access token."
                });
            });

            const emailToCheck = this.state.targetEmail.endsWith("@" + env.auth.domain) ?
                this.state.targetEmail :
                // convert alias@company.com to alias_company.com#EXT#@domain 
                this.state.targetEmail.replace("@", "_")
                     + "#EXT#@" + env.auth.domain

            if (tokenResponse) {
                const invitationStatus = await getAPI(
                    env.apiURL + "/user/" +
                        encodeURIComponent(emailToCheck),
                    tokenResponse.accessToken
                ).catch(() => {
                    this.setState({
                        error: "Unable to fetch Graph profile."
                    });
                });

                if (invitationStatus) {
                    this.setState({
                        apiResults: invitationStatus,
                        error: null
                    });
                }
            }
        }

        async componentDidMount() {
            msalApp.handleRedirectCallback(error => {
                if (error) {
                    const errorMessage = error.errorMessage ? error.errorMessage : "Unable to acquire access token.";
                    // setState works as long as navigateToLoginRequestUrl: false
                    this.setState({
                        error: errorMessage
                    });
                }
            });

            const account = msalApp.getAccount();
            const is_b2b = (env.authScheme === 'B2B');

            this.setState({
                account,
                is_b2b
            });
        }

        render() {
            return (
                <C
                    {...this.props}
                    is_b2b={this.state.is_b2b}
                    account={this.state.account}
                    error={this.state.error}
                    apiResults={this.state.apiResults}
                    targetEmail={this.state.targetEmail}
                    onSignIn={() => this.onSignIn()}
                    onSignOut={() => this.onSignOut()}
                    onCallWeatherAPI={() => this.onCallWeatherAPI()}
                    onInviteB2BUser={() => this.onInviteB2BUser()}
                    onCheckInvitationStatus={() => this.onCheckInvitationStatus()}
                    onInputChange={(e) => this.onInputChange(e)}
                />
            );
        }
    };
