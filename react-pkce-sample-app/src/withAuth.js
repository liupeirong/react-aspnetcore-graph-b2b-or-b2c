import React, { Component } from "react";
import { env } from "./config"
import {
    msalApp,
    requiresInteraction,
} from "./auth-utils";

export default C =>
    class extends Component {
        constructor(props) {
            super(props);

            this.state = {
                is_b2b: false,
                account: null,
                error: null,
            };
        }

        async acquireToken(request) {
            return await msalApp.acquireTokenSilent(request).catch((error) => {
                if (requiresInteraction(error.errorCode)) {
                    // acquireTokenPopup is a promise that returns AuthenticationResult;
                    // acquireTokenRedirect is a pomise that returns void, so you can't get accessToken
                    // from the resolved promise value. Instead, you'll need to call acquireTokenSilent again 
                    // to get the accessToken to call an API.
                    return msalApp.acquireTokenPopup(request);
                } else {
                    console.error('Non-interactive error:', error.errorCode);
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

        async componentDidMount() {
            // using msal-browser2.0.0-beta.2 for now, because 2.0.0-beta.4 will always return null as tokenResponse,
            // and msalApp.getAllAccounts() are always null as well. This is likely due to bug 
            // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/1846 
            msalApp.handleRedirectPromise().then((tokenResponse) => {
                const account = msalApp.getAccount();
                if (account) {
                    this.setState({
                        account: account
                    });
                }
            }).catch((error) => {
                const errorMessage = error.errorMessage ? error.errorMessage : "Unable to acquire access token.";
                // setState works as long as navigateToLoginRequestUrl: false
                this.setState({
                    error: errorMessage
                });
            });

            const is_b2b = (env.authScheme === 'B2B');
            this.setState({
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
                    onSignIn={() => this.onSignIn()}
                    onSignOut={() => this.onSignOut()}
                    acquireToken={(request) => this.acquireToken(request)}
                />
            );
        }
    };
