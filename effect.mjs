import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { HttpServer } from "@effect/platform";
import { Effect, Layer } from "effect";
import { createServer } from "node:http";
import { generateFakeDataEffect } from "./src/fakedata.mjs";

const listen = (app, port) =>
  NodeRuntime.runMain(
    Layer.launch(
      Layer.provide(
        app,
        NodeHttpServer.server.layer(() => createServer(), { port }),
      ),
    ),
  );

const router = HttpServer.router.empty.pipe(
  HttpServer.router.get("/", HttpServer.response.text("pin")),
  HttpServer.router.post(
    "/api",
    HttpServer.request.ServerRequest.pipe(
      Effect.flatMap((req) => req.json),
      Effect.flatMap(generateFakeDataEffect),
      Effect.flatMap((result) => HttpServer.response.json(result)),
      Effect.catchTag("ConfigError", (err) => {
        return HttpServer.response.text(err.content, { status: 400 });
      }),
    ),
  ),
);

const app = router.pipe(
  HttpServer.server.serve(),
  HttpServer.server.withLogAddress,
);

listen(app, 3000);
