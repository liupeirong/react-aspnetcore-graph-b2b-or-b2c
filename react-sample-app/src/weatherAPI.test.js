import React from "react";
import { unmountComponentAtNode, render } from "react-dom";
import { act } from "react-dom/test-utils";

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

let WeatherAPI = null;
describe("when authenticated", () => {
  beforeAll(() => {
    // in order to mock a module with different behavior for each test,
    // and if the module doesn't just export a function,
    // you need to require the module after the mock. See:
    // https://github.com/facebook/jest/issues/2582
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
    WeatherAPI = require("./weatherAPI").default;
  });

  it("renders result when weather api returned 200", async () => {
    const apiResult = { temp: 10 };
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(apiResult),
        status: 200
      })
    );

    await act(async () => {
      render(<WeatherAPI />, container);
    });
    const button = container.querySelector("button");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    const actualAPIResult = JSON.parse(rendered);
    expect(actualAPIResult.temp).toBe(apiResult.temp);
    expect(fetch).toHaveBeenCalledTimes(1);

    global.fetch.mockRestore();
  });

  it("renders error when fetch failed", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.reject({ error: "network error" })
        //status: 400
      })
    );

    await act(async () => {
      render(<WeatherAPI />, container);
    });
    const button = container.querySelector("button");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    expect(rendered).toContain("Error");
    expect(fetch).toHaveBeenCalledTimes(1);

    global.fetch.mockRestore();
  });

  it("renders error when weather API did not return 200", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: 400
      })
    );

    await act(async () => {
      render(<WeatherAPI />, container);
    });
    const button = container.querySelector("button");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const rendered = document.getElementById("data").textContent;
    expect(rendered).toContain("Error");
    expect(fetch).toHaveBeenCalledTimes(1);

    global.fetch.mockRestore();
  });
});

describe("when not authenticated", () => {
  beforeAll(() => {
    jest.resetModules();
    jest.mock("msal", () => {
      return {
        UserAgentApplication: jest.fn().mockImplementation(() => {
          return {
            handleRedirectCallback: () => null,
            getAccount: () => null
          };
        }),
        Logger: jest.fn().mockImplementation(() => null)
      };
    });
    WeatherAPI = require("./weatherAPI").default;
  });

  it("does not have call API button", async () => {
    await act(async () => {
      render(<WeatherAPI />, container);
    });

    const button = container.querySelector("button");
    expect(button).toBeNull();
  });
});
