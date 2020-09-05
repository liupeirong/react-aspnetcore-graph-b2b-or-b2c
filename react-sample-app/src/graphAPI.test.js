import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";
import { env } from "./config";

let container = null;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

let GraphAPI = null;
describe("when acquired token silently", () => {
  beforeAll(() => {
    jest.resetModules();
    jest.mock("msal", () => {
      return {
        UserAgentApplication: jest.fn().mockImplementation(() => {
          return {
            acquireTokenSilent: request => {
              return new Promise((resolve, reject) => {
                resolve({ accessToken: "foo" });
              });
            },
            acquireTokenRedirect: () => null,
            handleRedirectCallback: () => null,
            getAccount: () => {}
          };
        }),
        Logger: jest.fn().mockImplementation(() => null)
      };
    });
    GraphAPI = require("./graphAPI").default;
  });

  it("does not render when not B2B", async () => {
    await act(async () => {
      render(<GraphAPI isB2B={false} />, container);
    });

    const button = container.querySelector("button");
    expect(button).toBeNull();
  });

  it("invites user successfully when graph api returned 201", async () => {
    const http_status = 201;
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: http_status
      })
    );

    await act(async () => {
      render(<GraphAPI />, container);
    });
    const button = document.getElementById("inviteBtn");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    const actualAPIResult = JSON.parse(rendered);
    expect(actualAPIResult.http_status).toBe(http_status);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      env.apiURL + "/user",
      expect.objectContaining({ method: "POST" })
    );

    global.fetch.mockRestore();
  });
});

describe("when acquireTokenSilent fails without requiring interaction", () => {
  beforeAll(() => {
    jest.resetModules();
    jest.mock("msal", () => {
      return {
        UserAgentApplication: jest.fn().mockImplementation(() => {
          return {
            acquireTokenSilent: () =>
              Promise.reject({ errorCode: "interaction false" }),
            acquireTokenRedirect: () => null,
            handleRedirectCallback: () => null,
            getAccount: () => {}
          };
        }),
        Logger: jest.fn().mockImplementation(() => null)
      };
    });
    GraphAPI = require("./graphAPI").default;
  });

  it("fails to invite user", async () => {
    await act(async () => {
      render(<GraphAPI />, container);
    });

    const button = document.getElementById("inviteBtn");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    expect(rendered).toContain("interaction false");
  });
});

describe("when acquireTokenRedirect succeeds", () => {
  beforeAll(() => {
    jest.resetModules();
    jest.mock("msal", () => {
      return {
        UserAgentApplication: jest.fn().mockImplementation(() => {
          return {
            acquireTokenSilent: () =>
              Promise.reject({ errorCode: "consent_required" }),
            acquireTokenRedirect: () => Promise.resolve({ accessToken: "foo" }),
            handleRedirectCallback: () => null,
            getAccount: () => {
              return { idTokenClaims: { email: "me" } };
            }
          };
        }),
        Logger: jest.fn().mockImplementation(() => null)
      };
    });
    GraphAPI = require("./graphAPI").default;
  });

  it("invites user successfully", async () => {
    const http_status = 201;
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: http_status
      })
    );

    await act(async () => {
      render(<GraphAPI />, container);
    });

    const button = document.getElementById("inviteBtn");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    const actualAPIResult = JSON.parse(rendered);
    expect(actualAPIResult.http_status).toBe(http_status);

    global.fetch.mockRestore();
  });
});
