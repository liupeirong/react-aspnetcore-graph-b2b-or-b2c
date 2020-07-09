const authScheme = process.env.REACT_APP_AUTH_SCHEME;

module.exports = {
  env: {
    apiURL: process.env.REACT_APP_API_URL,
    authScheme: authScheme,
    auth: {
      redirectURL: process.env.REACT_APP_AUTH_REDIRECT_URI,
      authorityURL: process.env['REACT_APP_AUTH_AUTHORITY_URL_' + authScheme],
      apiScopes: process.env['REACT_APP_AUTH_API_SCOPES_' + authScheme].split(' '),
      loginScopes: process.env['REACT_APP_AUTH_LOGIN_SCOPES_' + authScheme].split(' '),
      clientId: process.env['REACT_APP_AUTH_CLIENT_ID_' + authScheme],
      validateAuthority: process.env['REACT_APP_AUTH_VALIDATE_AUTHORITY_' + authScheme],
      domain: process.env.REACT_APP_AUTH_DOMAIN_NAME,
    }
  }
};
