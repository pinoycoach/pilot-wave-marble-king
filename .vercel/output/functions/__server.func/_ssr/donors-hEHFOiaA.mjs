import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/donors-hEHFOiaA.js
var listDonorScans = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9ea5f4c4f50f90fbbf0847682e10f2c6a6aa0248925501bea473a23246de58d7"));
var runDonorScan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8b4a073858070580b1471d56266f6f3b372868a0d631e81d5afb87c55c230761"));
//#endregion
export { runDonorScan as n, listDonorScans as t };
