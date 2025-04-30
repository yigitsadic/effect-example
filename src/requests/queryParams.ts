import { Effect } from "effect";
import { RequestService } from "./requestService";

export const readQueryParams = RequestService.pipe(
  Effect.map((req) => new URL(req.url).searchParams)
);
