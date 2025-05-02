import {
  Config,
  Data,
  Effect,
  ParseResult,
  pipe,
  Redacted,
  Schema,
} from "effect";
import { RequestService } from "../requests/requestService";

class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  message: string;
}> {}

const userCredentials = Schema.Struct({
  username: Schema.String,
  password: Schema.String,
});

const basicAuthSchema = Schema.transformOrFail(
  Schema.Trimmed,
  userCredentials,
  {
    strict: true,
    encode: ({ username, password }) =>
      pipe(
        `${username}:${password}`,
        btoa,
        (encoded) => `Basic ${encoded}`,
        ParseResult.succeed
      ),
    decode: (fullHeaderContent, _, ast) => {
      let text = fullHeaderContent.replace("Basic ", "");

      try {
        text = atob(text);
      } catch {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            fullHeaderContent,
            "Failed to decode from base64"
          )
        );
      }

      const [username, password] = text.split(":");

      if (username == null || password == null) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            fullHeaderContent,
            "Could not find username or password from payload"
          )
        );
      }

      return pipe(
        userCredentials.make({
          username,
          password,
        }),
        ParseResult.succeed
      );
    },
  }
);

const basicAuthentication = Effect.gen(function* () {
  const USERNAME = pipe(yield* Config.string("AUTH_USERNAME"), Redacted.make);
  const PASSWORD = pipe(yield* Config.string("AUTH_PASSWORD"), Redacted.make);

  const req = yield* RequestService;

  const { username, password } = yield* Schema.decodeUnknown(basicAuthSchema)(
    req.headers.get("Authorization")
  );

  if (
    username !== Redacted.value(USERNAME) ||
    password !== Redacted.value(PASSWORD)
  ) {
    yield* Effect.fail(
      new UnauthorizedError({ message: "Invalid credentials" })
    );
  }
}).pipe(
  Effect.catchTag("ParseError", (e) =>
    Effect.fail(new UnauthorizedError({ message: e.message }))
  ),
  Effect.catchAll(() =>
    Effect.fail(new UnauthorizedError({ message: "Something went wrong" }))
  )
);

const unauthorizedHandler = (err: { message: string }) =>
  Effect.gen(function* () {
    yield* Effect.logError("Unauthorized access", "Problem=", err.message);

    return new Response("Unauthorized", {
      status: 401,
    });
  });

export {
  UnauthorizedError,
  basicAuthSchema,
  unauthorizedHandler,
  basicAuthentication,
};
