import { Context } from "effect";

export class RequestService extends Context.Tag("Request")<
  RequestService,
  Bun.BunRequest
>() {}
