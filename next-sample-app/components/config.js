const authScheme = process.env.REACT_APP_AUTH_SCHEME;
const is_b2b = authScheme === "B2B";

// unlike react.js, dynamic env var names such as process.env["abc" + authScheme] don't work
module.exports = {
  env: {
    apiURL: process.env.REACT_APP_API_URL,
    authScheme: authScheme,
    auth: {
      redirectURL: process.env.REACT_APP_AUTH_REDIRECT_URI,
      authorityURL: is_b2b ? process.env.REACT_APP_AUTH_AUTHORITY_URL_B2B : process.env.REACT_APP_AUTH_AUTHORITY_URL_B2C,
      apiScopes: is_b2b ? process.env.REACT_APP_AUTH_API_SCOPES_B2B.split(' ') : process.env.REACT_APP_AUTH_API_SCOPES_B2C.split(' '),
      loginScopes: is_b2b ? process.env.REACT_APP_AUTH_LOGIN_SCOPES_B2B.split(' ') : process.env.REACT_APP_AUTH_LOGIN_SCOPES_B2C.split(' '),
      clientId: is_b2b ? process.env.REACT_APP_AUTH_CLIENT_ID_B2B : process.env.REACT_APP_AUTH_CLIENT_ID_B2C,
      validateAuthority: is_b2b ? process.env.REACT_APP_AUTH_VALIDATE_AUTHORITY_B2B : process.env.REACT_APP_AUTH_VALIDATE_AUTHORITY_B2C,
      domain: process.env.REACT_APP_AUTH_DOMAIN_NAME,
    }
  }
};