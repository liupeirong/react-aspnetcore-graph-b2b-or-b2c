import { env } from "./config";

describe("Environment variables", () => {
  it("authScheme must be B2B or B2C", () => {
    expect(env.authScheme === "B2B" || env.authScheme === "B2C").toEqual(true);
  });
});
