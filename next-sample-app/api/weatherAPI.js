import React, { Component } from "react";
import PropTypes from "prop-types";
import { env } from "../components/config"
import withAPI, { Json } from "../components/withAPI";
import withAuth from "../components/withAuth";

class WeatherAPI extends Component {
    static propTypes = {
        isAuthenticated: PropTypes.bool,
        apiResult: PropTypes.object,
        apiError: PropTypes.object,
        onGetAPI: PropTypes.func.isRequired,
    };

    async onCallWeatherAPI() {
        const scopes = env.auth.apiScopes;
        const endpoint = env.apiURL + "/weatherforecast";
        this.props.onGetAPI(scopes, endpoint)
    }

    render() {
        return (
            <section>
                {this.props.isAuthenticated && (
                    <>
                    <button onClick={() => {this.onCallWeatherAPI();}}> Call Weather API </button>
                    <div className="data-graph">
                        {this.props.apiResult && (<Json data={this.props.apiResult} />)}
                        {this.props.apiError && (<p className="error">Error: {this.props.apiError}</p>)}
                    </div>
                    </>
                )}
            </section>
        );
    }
}

// order is important, the API HOC is the wrapper of the WeatherAPI
// wrapped object can see wrapper's prop
// wrapper can't see wrapped object's prop
export default withAuth(withAPI(WeatherAPI))