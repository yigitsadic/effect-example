import { Effect } from "effect";

export const getPort = Effect.sync(() => process.env.PORT || "5540");
