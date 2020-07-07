import React, { Component } from "react";
import PropTypes from "prop-types";
import withAuth from "../components/withAuth";
import { Json } from "../components/withAPI";
import WeatherAPI from "../api/weatherAPI";
import GraphAPI from "../api/graphAPI";

class App extends Component {
    static propTypes = {
        is_b2b: PropTypes.bool,
        account: PropTypes.object,
        error: PropTypes.string,
        onSignIn: PropTypes.func.isRequired,
        onSignOut: PropTypes.func.isRequired,
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
                        </>
                    )}
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
                </section>
                <WeatherAPI />
                <GraphAPI />
            </div>
        );
    }
}

export default withAuth(App);
