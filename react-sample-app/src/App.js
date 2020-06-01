import React from "react";
import PropTypes from "prop-types";
import AuthProvider from "./authProvider";

import "./App.css";

const Json = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>;

class App extends React.Component {
    static propTypes = {
        is_b2b: PropTypes.bool,
        account: PropTypes.object,
        error: PropTypes.string,
        apiResults: PropTypes.object,
        targetEmail: PropTypes.string,
        onSignIn: PropTypes.func.isRequired,
        onSignOut: PropTypes.func.isRequired,
        onCallWeatherAPI: PropTypes.func.isRequired,
        onInviteB2BUser: PropTypes.func.isRequired,
        onCheckInvitationStatus: PropTypes.func.isRequired,
        onInputChange: PropTypes.func.isRequired,
    };

    render() {
        return (
            <div>
                <section>
                    <h1>
                        MSAL React sample to call an authenticate weather API, invite b2b user, and check invitation status
                    </h1>
                    {!this.props.account ? (
                        <button onClick={this.props.onSignIn}>Sign In</button>
                    ) : (
                        <>
                            <button onClick={this.props.onSignOut}>
                                Sign Out
                            </button>
                            <button onClick={this.props.onCallWeatherAPI}>
                                Call Weather API
                            </button>
                        </>
                    )}
                    {this.props.account && this.props.is_b2b ? (
                        <>
                            <input type="text" value={ this.props.targetEmail } onChange={ evt => this.props.onInputChange(evt) } />
                            <input
                                type="button"
                                value="Invite B2B User"
                                onClick={this.props.onInviteB2BUser}
                            />
                            <input
                                type="button"
                                value="Check Invitation Status"
                                onClick={this.props.onCheckInvitationStatus}
                            />
                        </>
                    ) : (<></>)}
                    {this.props.error && (
                        <p className="error">Error: {this.props.error}</p>
                    )}
                </section>
                <section className="data">
                    {this.props.account && (
                        <div className="data-account">
                            <h2>Logged in User ID Token Claims</h2>
                            <Json data={this.props.account.idTokenClaims} />
                        </div>
                    )}
                    {this.props.apiResults && (
                        <div className="data-graph">
                            <h2>API Results</h2>
                            <Json data={this.props.apiResults} />
                        </div>
                    )}
                </section>
            </div>
        );
    }
}

export default AuthProvider(App);
