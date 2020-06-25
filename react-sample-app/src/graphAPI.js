import React, { Component } from "react";
import PropTypes from "prop-types";
import { env } from "./config"
import {
    getAPI,
    postAPI
} from "./auth-utils";
import withAuth, { Json } from "./withAuth";

class GraphAPI extends Component {
    static propTypes = {
        account: PropTypes.object,
        acquireToken: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            result: null,
            error: null,
            targetEmail: ""
        }
    }

    async onInputChange(e) {
        this.setState({
            targetEmail: e.target.value
        });
    }

    async onInviteB2BUser() {
        const tokenResponse = await this.props.acquireToken(
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
                    result: invitations,
                    error: null
                });
            }
        }
    }

    async onCheckInvitationStatus() {
        const tokenResponse = await this.props.acquireToken(
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
                    result: invitationStatus,
                    error: null
                });
            }
        }
    }

    render() {
        return (
            <section>
                {this.props.account && this.props.is_b2b && (
                    <>
                        <input type="text" value={ this.state.targetEmail } onChange={(evt) => this.onInputChange(evt)} />
                        <input
                            type="button"
                            value="Invite B2B User"
                            onClick={() => this.onInviteB2BUser()}
                        />
                        <input
                            type="button"
                            value="Check Invitation Status"
                            onClick={() => this.onCheckInvitationStatus()}
                        />
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

export default withAuth(GraphAPI);
