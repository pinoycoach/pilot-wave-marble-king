import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CFIMLYZc.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voices-Bfr8_hyD.js
var listVoices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("84915468fd4c5f600e67c1b25b7ed0b19d463d0fef1b9c93f047144287e2dab9"));
var listDomainLocks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d807120f000e37e3e09ef2fdf167d32eed8d94ddbe9d319e03ecf3d6d0c4d7c5"));
var updateVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("41d64e43b6e3362dd635aa823be08e71d3db0ed80914aa06d8a3684cabad024f"));
var duplicateVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7ffd18e81ac6aba9ab4551bc51c93481bb4eb66d8144aa987cce9a928c379940"));
var lockAsVoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("cd2e91107bd62bd631a193b114e869f07df5f0817175f0278220685a7e1dc8d2"));
var saveDomainLock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("737c379bc03adcf1e548837bf047170d72a6fa3bbce537f8c5a1163be3699fb4"));
var deleteDomainLock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("dcfa9a728bf75e69483fe41c63e8b10b660894977a73adff2cdeb2c8f495ab9b"));
//#endregion
export { lockAsVoice as a, listVoices as i, duplicateVoice as n, saveDomainLock as o, listDomainLocks as r, updateVoice as s, deleteDomainLock as t };
