import { requiresInteraction, msalApp } from "./auth-utils";

describe("Auth Utils", () => {
  it("requiresInteraction should return false when error is null", () => {
    expect(requiresInteraction()).toEqual(false);
  });
  it("requiresInteraction should return true when login is required", () => {
    expect(requiresInteraction("login_required")).toEqual(true);
  });
  it("msalApp should use session storage", () => {
    expect(msalApp.cacheStorage.cacheLocation).toEqual("sessionStorage");
  });
});
