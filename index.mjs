import {
  createApp,
  toNodeListener,
  defineEventHandler,
  getRequestHeader,
  readBody,
  assertMethod,
  createError,
} from "h3";
import { createServer } from "node:http";
import { tap } from "./src/utils.mjs";
import { generateFakeData } from "./src/fakedata.mjs";

const app = createApp();

app.use(
  "/",
  defineEventHandler((event) =>
    Promise.resolve(event)
      .then(tap((event) => assertMethod(event, "POST")))
      .then(
        tap((event) => {
          if (getRequestHeader(event, "content-type") !== "application/json") {
            throw createError({
              statusCode: 400,
              statusMessage: "Invalid content type",
            });
          }
        }),
      )
      .then(readBody)
      .then((config) => {
        try {
          return generateFakeData(config);
        } catch (err) {
          throw createError({
            statusCode: 400,
            statusMessage: err.message,
          });
        }
      }),
  ),
);

createServer(toNodeListener(app)).listen(3000);
