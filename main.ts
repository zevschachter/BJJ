import { serveDir } from "jsr:@std/http/file-server";

Deno.serve((req) => {
  const url = new URL(req.url);
  if (url.hostname !== "zev.life") {
    return Response.redirect(`https://zev.life${url.pathname}${url.search}`, 301);
  }
  return serveDir(req, { fsRoot: "." });
});
