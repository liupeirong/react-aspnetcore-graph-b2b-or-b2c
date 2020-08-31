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

describe("when authenticated", () => {
  beforeAll(() => {
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
  });

  it("does not render when not B2B", async () => {
    const GraphAPIModuleHasAccount = require("./graphAPI");
    const GraphAPIHasAccount = GraphAPIModuleHasAccount.default;

    await act(async () => {
      render(<GraphAPIHasAccount isB2B={false} />, container);
    });

    const button = container.querySelector("button");
    expect(button).toBeNull();
  });

  it("invites user successfully when graph api returned 201", async () => {
    const GraphAPIModuleHasAccount = require("./graphAPI");
    const GraphAPIHasAccount = GraphAPIModuleHasAccount.default;

    const http_status = 201;
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: http_status
      })
    );

    await act(async () => {
      render(<GraphAPIHasAccount />, container);
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
