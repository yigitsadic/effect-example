import { Effect, Option, pipe, Schema } from "effect";
import { readQueryParams } from "../requests/queryParams";

const helloHandler = Effect.gen(function* () {
  yield* Effect.log("Received a request.");

  const queryParams = yield* readQueryParams;
  const name = pipe(
    queryParams.get("name"),
    Schema.decodeUnknownOption(Schema.NonEmptyString)
  );
  const message = Option.match(name, {
    onNone: () => "Hello there traveller!",
    onSome: (n) => `Greetings my dear ${n}`,
  });

  return new Response(message);
});

export { helloHandler };
