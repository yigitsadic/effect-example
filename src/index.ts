import { Effect, pipe } from "effect";
import { getPort } from "./utils/getPort";
import { helloHandler } from "./handlers/hello";
import { RequestService } from "./requests/requestService";

const program = Effect.gen(function* () {
  const port = yield* getPort;
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
  Effect.runPromise
);
