import { Effect } from "effect";
import { describe, it, expect } from "vitest";
import { helloHandler } from "./hello";
import { RequestService } from "../requests/requestService";

describe("helloHandler", () => {
  it("should greet anonymous user with expected message", async () => {
    const got = await Effect.runPromise(
      helloHandler.pipe(
        Effect.provideService(RequestService, {
          url: "http://hello.world",
        } as Bun.BunRequest)
      )
    );

    expect(await got.text()).toStrictEqual("Hello there traveller!");
  });

  it("should include name in the greeting message", async () => {
    const got = await Effect.runPromise(
      helloHandler.pipe(
        Effect.provideService(RequestService, {
          url: "http://hello.world?name=Yigit",
        } as Bun.BunRequest)
      )
    );

    expect(await got.text()).toStrictEqual("Greeting my dear Yigit");
  });
});
