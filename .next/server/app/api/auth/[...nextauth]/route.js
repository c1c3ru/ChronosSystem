"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_deppi_ChronosSystem_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/home/deppi/ChronosSystem/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _home_deppi_ChronosSystem_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGZGVwcGklMkZDaHJvbm9zU3lzdGVtJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZob21lJTJGZGVwcGklMkZDaHJvbm9zU3lzdGVtJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNhO0FBQzFGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb25vcy1zeXN0ZW0vPzIwMzciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL2hvbWUvZGVwcGkvQ2hyb25vc1N5c3RlbS9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9kZXBwaS9DaHJvbm9zU3lzdGVtL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFnQztBQUNRO0FBRXhDLE1BQU1FLFVBQVVGLGdEQUFRQSxDQUFDQyxrREFBV0E7QUFFTSIsInNvdXJjZXMiOlsid2VicGFjazovL2Nocm9ub3Mtc3lzdGVtLy4vYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/YzhhNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJ1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpXG5cbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfVxuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n// Verificar variáveis de ambiente na inicialização\nconsole.log(\"\\uD83D\\uDD0D [AUTH INIT] GOOGLE_CLIENT_ID:\", process.env.GOOGLE_CLIENT_ID ? \"DEFINIDO\" : \"N\\xc3O DEFINIDO\");\nconsole.log(\"\\uD83D\\uDD0D [AUTH INIT] GOOGLE_CLIENT_SECRET:\", process.env.GOOGLE_CLIENT_SECRET ? \"DEFINIDO\" : \"N\\xc3O DEFINIDO\");\n// Definir variáveis para garantir que estejam disponíveis\nconst GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;\nconst GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;\nconsole.log(\"\\uD83D\\uDD0D [AUTH INIT] Vari\\xe1veis locais:\", {\n    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? \"DEFINIDO\" : \"N\\xc3O DEFINIDO\",\n    GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? \"DEFINIDO\" : \"N\\xc3O DEFINIDO\"\n});\nconst authOptions = {\n    // Temporariamente desabilitar adapter para testar Google OAuth\n    // adapter: PrismaAdapter(prisma),\n    debug: true,\n    logger: {\n        error (code, metadata) {\n            console.error(\"\\uD83D\\uDD25 [NEXTAUTH ERROR]\", code, metadata);\n        },\n        warn (code) {\n            console.warn(\"⚠️ [NEXTAUTH WARN]\", code);\n        },\n        debug (code, metadata) {\n            console.log(\"\\uD83D\\uDD0D [NEXTAUTH DEBUG]\", code, metadata);\n        }\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                console.log(\"\\uD83D\\uDD10 [AUTH] Tentativa de login:\", credentials?.email);\n                if (!credentials?.email || !credentials?.password) {\n                    console.log(\"❌ [AUTH] Credenciais faltando\");\n                    return null;\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                console.log(\"\\uD83D\\uDC64 [AUTH] Usu\\xe1rio encontrado:\", user ? \"SIM\" : \"N\\xc3O\");\n                if (!user || !user.password) {\n                    console.log(\"❌ [AUTH] Usu\\xe1rio n\\xe3o encontrado ou sem senha\");\n                    return null;\n                }\n                const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                console.log(\"\\uD83D\\uDD11 [AUTH] Senha v\\xe1lida:\", isPasswordValid ? \"SIM\" : \"N\\xc3O\");\n                if (!isPasswordValid) {\n                    console.log(\"❌ [AUTH] Senha inv\\xe1lida\");\n                    return null;\n                }\n                console.log(\"✅ [AUTH] Login autorizado para:\", user.email);\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name,\n                    role: user.role,\n                    image: user.image\n                };\n            }\n        }),\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: GOOGLE_CLIENT_ID,\n            clientSecret: GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/auth/signin\",\n        error: \"/auth/error\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role || \"EMPLOYEE\";\n                token.sub = user.id;\n                // Buscar dados completos do usuário para verificar profileComplete\n                const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        id: user.id\n                    },\n                    select: {\n                        profileComplete: true\n                    }\n                });\n                token.profileComplete = dbUser?.profileComplete ?? true;\n                console.log(\"JWT Callback - User ID:\", user.id);\n                console.log(\"JWT Callback - Role:\", token.role);\n                console.log(\"JWT Callback - ProfileComplete:\", token.profileComplete);\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n                session.user.profileComplete = token.profileComplete;\n            }\n            return session;\n        },\n        async signIn ({ user, account, profile }) {\n            console.log(\"\\uD83D\\uDD35 [SIGNIN] Callback chamado:\", {\n                provider: account?.provider,\n                email: user.email\n            });\n            // Sem adapter, sempre permitir login\n            console.log(\"✅ [SIGNIN] Permitindo login (sem adapter)\");\n            return true;\n        },\n        async redirect ({ url, baseUrl }) {\n            console.log(\"\\uD83D\\uDD04 [REDIRECT] URL:\", url, \"BaseURL:\", baseUrl);\n            // Se for callback do Google, redirecionar para employee\n            if (url.includes(\"/api/auth/callback/google\")) {\n                console.log(\"\\uD83D\\uDD04 [REDIRECT] Google callback, redirecionando para /employee\");\n                return `${baseUrl}/employee`;\n            }\n            // Se for URL relativa, usar baseUrl\n            if (url.startsWith(\"/\")) {\n                console.log(\"\\uD83D\\uDD04 [REDIRECT] URL relativa:\", `${baseUrl}${url}`);\n                return `${baseUrl}${url}`;\n            }\n            // Se for mesma origem, permitir\n            if (new URL(url).origin === baseUrl) {\n                console.log(\"\\uD83D\\uDD04 [REDIRECT] Mesma origem:\", url);\n                return url;\n            }\n            console.log(\"\\uD83D\\uDD04 [REDIRECT] Fallback para baseUrl:\", baseUrl);\n            return baseUrl;\n        }\n    },\n    secret: \"chronos-secret-key-2024-production-ready\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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UUMsR0FBRyxDQUFDLGdDQUFzQjhDLEtBQUssWUFBWUM7WUFFbkQsd0RBQXdEO1lBQ3hELElBQUlELElBQUlFLFFBQVEsQ0FBQyw4QkFBOEI7Z0JBQzdDakQsUUFBUUMsR0FBRyxDQUFDO2dCQUNaLE9BQU8sQ0FBQyxFQUFFK0MsUUFBUSxTQUFTLENBQUM7WUFDOUI7WUFFQSxvQ0FBb0M7WUFDcEMsSUFBSUQsSUFBSUcsVUFBVSxDQUFDLE1BQU07Z0JBQ3ZCbEQsUUFBUUMsR0FBRyxDQUFDLHlDQUErQixDQUFDLEVBQUUrQyxRQUFRLEVBQUVELElBQUksQ0FBQztnQkFDN0QsT0FBTyxDQUFDLEVBQUVDLFFBQVEsRUFBRUQsSUFBSSxDQUFDO1lBQzNCO1lBRUEsZ0NBQWdDO1lBQ2hDLElBQUksSUFBSUksSUFBSUosS0FBS0ssTUFBTSxLQUFLSixTQUFTO2dCQUNuQ2hELFFBQVFDLEdBQUcsQ0FBQyx5Q0FBK0I4QztnQkFDM0MsT0FBT0E7WUFDVDtZQUVBL0MsUUFBUUMsR0FBRyxDQUFDLGtEQUF3QytDO1lBQ3BELE9BQU9BO1FBQ1Q7SUFDRjtJQUNBSyxRQUFRbkQsMENBQTJCO0FBQ3JDLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaHJvbm9zLXN5c3RlbS8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvcHJpc21hLWFkYXB0ZXInXG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnXG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzJ1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcydcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcblxuZGVjbGFyZSBtb2R1bGUgJ25leHQtYXV0aCcge1xuICBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IHN0cmluZ1xuICAgICAgZW1haWw6IHN0cmluZ1xuICAgICAgbmFtZT86IHN0cmluZyB8IG51bGxcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbFxuICAgICAgcm9sZTogc3RyaW5nXG4gICAgICBwcm9maWxlQ29tcGxldGU6IGJvb2xlYW5cbiAgICB9XG4gIH1cbiAgXG4gIGludGVyZmFjZSBVc2VyIHtcbiAgICBpZDogc3RyaW5nXG4gICAgZW1haWw6IHN0cmluZ1xuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsXG4gICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsXG4gICAgcm9sZTogc3RyaW5nXG4gICAgcHJvZmlsZUNvbXBsZXRlPzogYm9vbGVhblxuICB9XG59XG5cbi8vIFZlcmlmaWNhciB2YXJpw6F2ZWlzIGRlIGFtYmllbnRlIG5hIGluaWNpYWxpemHDp8Ojb1xuY29uc29sZS5sb2coJ/CflI0gW0FVVEggSU5JVF0gR09PR0xFX0NMSUVOVF9JRDonLCBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEID8gJ0RFRklOSURPJyA6ICdOw4NPIERFRklOSURPJylcbmNvbnNvbGUubG9nKCfwn5SNIFtBVVRIIElOSVRdIEdPT0dMRV9DTElFTlRfU0VDUkVUOicsIHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUID8gJ0RFRklOSURPJyA6ICdOw4NPIERFRklOSURPJylcblxuLy8gRGVmaW5pciB2YXJpw6F2ZWlzIHBhcmEgZ2FyYW50aXIgcXVlIGVzdGVqYW0gZGlzcG9uw612ZWlzXG5jb25zdCBHT09HTEVfQ0xJRU5UX0lEID0gcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRFxuY29uc3QgR09PR0xFX0NMSUVOVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVFxuXG5jb25zb2xlLmxvZygn8J+UjSBbQVVUSCBJTklUXSBWYXJpw6F2ZWlzIGxvY2FpczonLCB7IFxuICBHT09HTEVfQ0xJRU5UX0lEOiBHT09HTEVfQ0xJRU5UX0lEID8gJ0RFRklOSURPJyA6ICdOw4NPIERFRklOSURPJyxcbiAgR09PR0xFX0NMSUVOVF9TRUNSRVQ6IEdPT0dMRV9DTElFTlRfU0VDUkVUID8gJ0RFRklOSURPJyA6ICdOw4NPIERFRklOSURPJ1xufSlcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIC8vIFRlbXBvcmFyaWFtZW50ZSBkZXNhYmlsaXRhciBhZGFwdGVyIHBhcmEgdGVzdGFyIEdvb2dsZSBPQXV0aFxuICAvLyBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIGRlYnVnOiB0cnVlLFxuICBsb2dnZXI6IHtcbiAgICBlcnJvcihjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5lcnJvcign8J+UpSBbTkVYVEFVVEggRVJST1JdJywgY29kZSwgbWV0YWRhdGEpXG4gICAgfSxcbiAgICB3YXJuKGNvZGUpIHtcbiAgICAgIGNvbnNvbGUud2Fybign4pqg77iPIFtORVhUQVVUSCBXQVJOXScsIGNvZGUpXG4gICAgfSxcbiAgICBkZWJ1Zyhjb2RlLCBtZXRhZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ/CflI0gW05FWFRBVVRIIERFQlVHXScsIGNvZGUsIG1ldGFkYXRhKVxuICAgIH1cbiAgfSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiAnY3JlZGVudGlhbHMnLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6ICdFbWFpbCcsIHR5cGU6ICdlbWFpbCcgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6ICdQYXNzd29yZCcsIHR5cGU6ICdwYXNzd29yZCcgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+UkCBbQVVUSF0gVGVudGF0aXZhIGRlIGxvZ2luOicsIGNyZWRlbnRpYWxzPy5lbWFpbClcbiAgICAgICAgXG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn4p2MIFtBVVRIXSBDcmVkZW5jaWFpcyBmYWx0YW5kbycpXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5GkIFtBVVRIXSBVc3XDoXJpbyBlbmNvbnRyYWRvOicsIHVzZXIgPyAnU0lNJyA6ICdOw4NPJylcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn4p2MIFtBVVRIXSBVc3XDoXJpbyBuw6NvIGVuY29udHJhZG8gb3Ugc2VtIHNlbmhhJylcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpXG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5SRIFtBVVRIXSBTZW5oYSB2w6FsaWRhOicsIGlzUGFzc3dvcmRWYWxpZCA/ICdTSU0nIDogJ07Dg08nKVxuXG4gICAgICAgIGlmICghaXNQYXNzd29yZFZhbGlkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ+KdjCBbQVVUSF0gU2VuaGEgaW52w6FsaWRhJylcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ+KchSBbQVVUSF0gTG9naW4gYXV0b3JpemFkbyBwYXJhOicsIHVzZXIuZW1haWwpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcbiAgICAgICAgICBpbWFnZTogdXNlci5pbWFnZSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuICAgIEdvb2dsZVByb3ZpZGVyKHtcbiAgICAgIGNsaWVudElkOiBHT09HTEVfQ0xJRU5UX0lEIGFzIHN0cmluZyxcbiAgICAgIGNsaWVudFNlY3JldDogR09PR0xFX0NMSUVOVF9TRUNSRVQgYXMgc3RyaW5nLFxuICAgICAgYWxsb3dEYW5nZXJvdXNFbWFpbEFjY291bnRMaW5raW5nOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6ICdqd3QnLFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9hdXRoL3NpZ25pbicsXG4gICAgZXJyb3I6ICcvYXV0aC9lcnJvcicsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLnJvbGUgPSB1c2VyLnJvbGUgfHwgJ0VNUExPWUVFJ1xuICAgICAgICB0b2tlbi5zdWIgPSB1c2VyLmlkXG4gICAgICAgIFxuICAgICAgICAvLyBCdXNjYXIgZGFkb3MgY29tcGxldG9zIGRvIHVzdcOhcmlvIHBhcmEgdmVyaWZpY2FyIHByb2ZpbGVDb21wbGV0ZVxuICAgICAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogdXNlci5pZCB9LFxuICAgICAgICAgIHNlbGVjdDogeyBwcm9maWxlQ29tcGxldGU6IHRydWUgfVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgdG9rZW4ucHJvZmlsZUNvbXBsZXRlID0gZGJVc2VyPy5wcm9maWxlQ29tcGxldGUgPz8gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ0pXVCBDYWxsYmFjayAtIFVzZXIgSUQ6JywgdXNlci5pZClcbiAgICAgICAgY29uc29sZS5sb2coJ0pXVCBDYWxsYmFjayAtIFJvbGU6JywgdG9rZW4ucm9sZSlcbiAgICAgICAgY29uc29sZS5sb2coJ0pXVCBDYWxsYmFjayAtIFByb2ZpbGVDb21wbGV0ZTonLCB0b2tlbi5wcm9maWxlQ29tcGxldGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW5cbiAgICB9LFxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uc3ViIVxuICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGUgYXMgc3RyaW5nXG4gICAgICAgIHNlc3Npb24udXNlci5wcm9maWxlQ29tcGxldGUgPSB0b2tlbi5wcm9maWxlQ29tcGxldGUgYXMgYm9vbGVhblxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb25cbiAgICB9LFxuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUgfSkge1xuICAgICAgY29uc29sZS5sb2coJ/CflLUgW1NJR05JTl0gQ2FsbGJhY2sgY2hhbWFkbzonLCB7IHByb3ZpZGVyOiBhY2NvdW50Py5wcm92aWRlciwgZW1haWw6IHVzZXIuZW1haWwgfSlcbiAgICAgIFxuICAgICAgLy8gU2VtIGFkYXB0ZXIsIHNlbXByZSBwZXJtaXRpciBsb2dpblxuICAgICAgY29uc29sZS5sb2coJ+KchSBbU0lHTklOXSBQZXJtaXRpbmRvIGxvZ2luIChzZW0gYWRhcHRlciknKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIGFzeW5jIHJlZGlyZWN0KHsgdXJsLCBiYXNlVXJsIH0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCfwn5SEIFtSRURJUkVDVF0gVVJMOicsIHVybCwgJ0Jhc2VVUkw6JywgYmFzZVVybClcbiAgICAgIFxuICAgICAgLy8gU2UgZm9yIGNhbGxiYWNrIGRvIEdvb2dsZSwgcmVkaXJlY2lvbmFyIHBhcmEgZW1wbG95ZWVcbiAgICAgIGlmICh1cmwuaW5jbHVkZXMoJy9hcGkvYXV0aC9jYWxsYmFjay9nb29nbGUnKSkge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+UhCBbUkVESVJFQ1RdIEdvb2dsZSBjYWxsYmFjaywgcmVkaXJlY2lvbmFuZG8gcGFyYSAvZW1wbG95ZWUnKVxuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0vZW1wbG95ZWVgXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNlIGZvciBVUkwgcmVsYXRpdmEsIHVzYXIgYmFzZVVybFxuICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/CflIQgW1JFRElSRUNUXSBVUkwgcmVsYXRpdmE6JywgYCR7YmFzZVVybH0ke3VybH1gKVxuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0ke3VybH1gXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNlIGZvciBtZXNtYSBvcmlnZW0sIHBlcm1pdGlyXG4gICAgICBpZiAobmV3IFVSTCh1cmwpLm9yaWdpbiA9PT0gYmFzZVVybCkge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+UhCBbUkVESVJFQ1RdIE1lc21hIG9yaWdlbTonLCB1cmwpXG4gICAgICAgIHJldHVybiB1cmxcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ/CflIQgW1JFRElSRUNUXSBGYWxsYmFjayBwYXJhIGJhc2VVcmw6JywgYmFzZVVybClcbiAgICAgIHJldHVybiBiYXNlVXJsXG4gICAgfSxcbiAgfSxcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG59XG4iXSwibmFtZXMiOlsiR29vZ2xlUHJvdmlkZXIiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiYmNyeXB0IiwicHJpc21hIiwiY29uc29sZSIsImxvZyIsInByb2Nlc3MiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0lEIiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImRlYnVnIiwibG9nZ2VyIiwiZXJyb3IiLCJjb2RlIiwibWV0YWRhdGEiLCJ3YXJuIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpc1Bhc3N3b3JkVmFsaWQiLCJjb21wYXJlIiwiaWQiLCJyb2xlIiwiaW1hZ2UiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsImFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZyIsInNlc3Npb24iLCJzdHJhdGVneSIsInBhZ2VzIiwic2lnbkluIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJzdWIiLCJkYlVzZXIiLCJzZWxlY3QiLCJwcm9maWxlQ29tcGxldGUiLCJhY2NvdW50IiwicHJvZmlsZSIsInByb3ZpZGVyIiwicmVkaXJlY3QiLCJ1cmwiLCJiYXNlVXJsIiwiaW5jbHVkZXMiLCJzdGFydHNXaXRoIiwiVVJMIiwib3JpZ2luIiwic2VjcmV0IiwiTkVYVEFVVEhfU0VDUkVUIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFFO0FBRWxFLElBQUlJLElBQXlCLEVBQWNILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2Nocm9ub3Mtc3lzdGVtLy4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KClcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWFcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@panva","vendor-chunks/oidc-token-hash"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();