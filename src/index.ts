import { Config, ConfigProvider, Effect, Logger, pipe, Schema } from "effect";
import { helloHandler } from "./handlers/hello";
import { RequestService } from "./requests/requestService";
import {
  basicAuthentication,
  unauthorizedHandler,
} from "./guards/basicAuthentication";

const program = Effect.gen(function* () {
  const port = yield* Config.string("PORT");
  const server = Bun.serve({
    routes: {
      "/hello": (req) =>
        pipe(
          basicAuthentication.pipe(
            Effect.flatMap(() => helloHandler),
            Effect.provideService(RequestService, req),
            Effect.catchTag("UnauthorizedError", unauthorizedHandler),
            Effect.withLogSpan("helloHandler")
          ),
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
  Effect.runPromise
);
