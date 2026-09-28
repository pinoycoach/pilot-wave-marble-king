import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trends-CVCTwcFb.js
var listTrendScans = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d704364dd7d6d163b6332e15d1e89d2b46281cfffc6271b7f5126be372ff95a5"));
var runTrendScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6366da7806ec418ab65c3a8927d5f64d1d03be48ef802d0d7c6605e28dc24bac"));
//#endregion
export { runTrendScan as n, listTrendScans as t };
