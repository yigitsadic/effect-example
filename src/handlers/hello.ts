import { Effect, Option, Schema } from "effect";
import { readQueryParams } from "../requests/queryParams";

const nameSchema = Schema.NonEmptyString;

const helloHandler = Effect.gen(function* () {
  yield* Effect.log("Received a request.");

  const queryParams = yield* readQueryParams;
  const name = Schema.decodeUnknownOption(nameSchema)(queryParams.get("name"));
  const message = Option.map(name, (n) => `Greeting my dear ${n}`).pipe(
    Option.getOrElse(() => "Hello there traveller!")
  );

  return new Response(message);
}).pipe(Effect.withLogSpan("helloHandler"));

export { helloHandler };
