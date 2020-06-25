import React, { Component } from "react";
import PropTypes from "prop-types";
import { env } from "./config"
import { getAPI } from "./auth-utils";
import withAuth, { Json } from "./withAuth";

class WeatherAPI extends Component {
    static propTypes = {
        account: PropTypes.object,
        acquireToken: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            result: null,
            error: null
        }
    }

    async onCallWeatherAPI() {
        const tokenResponse = await this.props.acquireToken(
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
                    result: apiResults,
                    error: null
                });
            }
        }
    }

    render() {
        return (
            <section>
                {this.props.account && (
                    <>
                    <button onClick={() => {this.onCallWeatherAPI();}}> Call Weather API </button>
                    <div className="data-graph">
                        {this.state.result && (<Json data={this.state.result} />)}
                        {this.state.error && (<p className="error">Error: {this.state.error}</p>)}
                    </div>
                    </>
                )}
            </section>
        );
    }
}

export default withAuth(WeatherAPI)