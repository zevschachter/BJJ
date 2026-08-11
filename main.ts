import { serveDir } from "jsr:@std/http/file-server";

Deno.serve((req) => {
  const url = new URL(req.url);
  if (url.hostname === "www.zev.it.com") {
    return Response.redirect(`https://zev.it.com${url.pathname}${url.search}`, 301);
  }
  return serveDir(req, { fsRoot: "." });
});
