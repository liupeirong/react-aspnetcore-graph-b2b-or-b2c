import { PublicClientApplication, Logger } from "@azure/msal-browser";
import { env } from "./config";

export const requiresInteraction = errorMessage => {
    if (!errorMessage || !errorMessage.length) {
        return false;
    }

    return (
        errorMessage.indexOf("consent_required") > -1 ||
        errorMessage.indexOf("interaction_required") > -1 ||
        errorMessage.indexOf("login_required") > -1 ||
        errorMessage.indexOf("no_tokens_found") > -1
    );
};

export const getAPI = async (url, accessToken) => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response.json();
};

export const postAPI = async (url, accessToken, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });

    return "Status code: " + response.status;
};

export const msalApp = new PublicClientApplication({
    auth: {
        clientId: env.auth.clientId,
        authority: env.auth.authorityURL,
        redirectUri: env.auth.redirectURL,
        validateAuthority: (env.auth.validateAuthority === 'true'),
        postLogoutRedirectUri: env.auth.redirectURL,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    },
    system: {
        navigateFrameWait: 500,
        logger: new Logger((logLevel, message) => {
            console.log(message);
        }),
    }
});
