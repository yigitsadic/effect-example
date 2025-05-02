import { Config, ConfigProvider, Effect, pipe } from "effect";
import { helloHandler } from "./handlers/hello";
import { RequestService } from "./requests/requestService";
import { BunRuntime } from "@effect/platform-bun";

const program = Effect.gen(function* () {
  const port = yield* Config.string("PORT");
  const server = Bun.serve({
    routes: {
      "/hello": (req) =>
        pipe(
          Effect.provideService(helloHandler, RequestService, req),
          Effect.runPromise
        ),
    },
    port,
    fetch: () => new Response("OK"),
  });

  yield* Effect.log(`Server started on port=${port}`);

  return server;
});

pipe(
  Effect.withConfigProvider(program, ConfigProvider.fromEnv()),
  BunRuntime.runMain
);
