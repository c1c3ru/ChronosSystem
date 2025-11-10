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

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\n// Definir variáveis para garantir que estejam disponíveis\nconst GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;\nconst GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma),\n    debug: false,\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                try {\n                    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        }\n                    });\n                    if (!user || !user.password) {\n                        return null;\n                    }\n                    const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.password);\n                    if (!isPasswordValid) {\n                        return null;\n                    }\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role,\n                        profileComplete: user.profileComplete,\n                        image: user.image\n                    };\n                } catch (error) {\n                    console.error(\"Auth error:\", error);\n                    return null;\n                }\n            }\n        }),\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            clientId: GOOGLE_CLIENT_ID,\n            clientSecret: GOOGLE_CLIENT_SECRET,\n            allowDangerousEmailAccountLinking: true\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/auth/signin\",\n        error: \"/auth/error\"\n    },\n    callbacks: {\n        async jwt ({ token, user, account, trigger }) {\n            // Se é um novo login ou trigger de update\n            if (user || trigger === \"update\") {\n                if (user) {\n                    token.role = user.role;\n                    token.sub = user.id;\n                    token.profileComplete = user.profileComplete;\n                }\n                // Sempre buscar dados atualizados do banco para garantir consistência\n                if (token.sub) {\n                    const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                        where: {\n                            id: token.sub\n                        },\n                        select: {\n                            role: true,\n                            profileComplete: true,\n                            name: true,\n                            email: true\n                        }\n                    });\n                    if (dbUser) {\n                        token.role = dbUser.role;\n                        token.profileComplete = dbUser.profileComplete;\n                        token.name = dbUser.name;\n                        token.email = dbUser.email;\n                    }\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n                session.user.profileComplete = token.profileComplete;\n            }\n            return session;\n        },\n        async signIn ({ user, account, profile }) {\n            console.log(\"\\uD83D\\uDD35 [SIGNIN] Callback iniciado:\", {\n                provider: account?.provider,\n                email: user.email,\n                userId: user.id\n            });\n            if (account?.provider === \"google\") {\n                try {\n                    console.log(\"\\uD83D\\uDD0D [SIGNIN] Processando login Google para:\", user.email);\n                    // Buscar usuário existente no banco de dados\n                    const existingUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                        where: {\n                            email: user.email\n                        },\n                        select: {\n                            id: true,\n                            email: true,\n                            name: true,\n                            role: true,\n                            profileComplete: true,\n                            image: true\n                        }\n                    });\n                    console.log(\"\\uD83D\\uDC64 [SIGNIN] Usu\\xe1rio existente:\", existingUser ? \"SIM\" : \"N\\xc3O\");\n                    if (existingUser) {\n                        console.log(\"✅ [SIGNIN] Usu\\xe1rio autorizado encontrado:\", {\n                            id: existingUser.id,\n                            email: existingUser.email,\n                            role: existingUser.role,\n                            profileComplete: existingUser.profileComplete\n                        });\n                        // Atualizar dados do usuário no objeto user para o JWT\n                        user.id = existingUser.id;\n                        user.role = existingUser.role;\n                        user.profileComplete = existingUser.profileComplete;\n                        user.name = existingUser.name || user.name;\n                        user.image = existingUser.image || user.image;\n                        return true;\n                    } else {\n                        // SEGURANÇA: Não criar usuários automaticamente\n                        // Apenas usuários pré-cadastrados podem fazer login\n                        console.log(\"❌ [SIGNIN] Usu\\xe1rio n\\xe3o autorizado:\", user.email);\n                        console.log(\"\\uD83D\\uDD12 [SIGNIN] Email n\\xe3o est\\xe1 cadastrado no sistema\");\n                        // Retornar false bloqueia o login\n                        return false;\n                    }\n                } catch (error) {\n                    console.error(\"❌ [SIGNIN] Erro ao processar usu\\xe1rio Google:\", error);\n                    return false;\n                }\n            }\n            console.log(\"✅ [SIGNIN] Login com outros providers permitido\");\n            return true;\n        },\n        async redirect ({ url, baseUrl }) {\n            // Se for callback do Google ou outros providers OAuth\n            if (url.includes(\"/api/auth/callback/\")) {\n                // Para callbacks OAuth, sempre redirecionar para a página inicial\n                // O middleware irá verificar o role e redirecionar adequadamente\n                return `${baseUrl}/`;\n            }\n            // Se for URL relativa, usar baseUrl\n            if (url.startsWith(\"/\")) {\n                return `${baseUrl}${url}`;\n            }\n            // Se for mesma origem, permitir\n            if (new URL(url).origin === baseUrl) {\n                return url;\n            }\n            return baseUrl;\n        }\n    },\n    secret: \"chronos-secret-key-2024-production-ready\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFDRjtJQUNBSyxRQUFRcEQsMENBQTJCO0FBQ3JDLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaHJvbm9zLXN5c3RlbS8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgUHJpc21hQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvcHJpc21hLWFkYXB0ZXInXG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnXG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzJ1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcydcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcblxuZGVjbGFyZSBtb2R1bGUgJ25leHQtYXV0aCcge1xuICBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgdXNlcjoge1xuICAgICAgaWQ6IHN0cmluZ1xuICAgICAgZW1haWw6IHN0cmluZ1xuICAgICAgbmFtZT86IHN0cmluZyB8IG51bGxcbiAgICAgIGltYWdlPzogc3RyaW5nIHwgbnVsbFxuICAgICAgcm9sZTogc3RyaW5nXG4gICAgICBwcm9maWxlQ29tcGxldGU6IGJvb2xlYW5cbiAgICB9XG4gIH1cbiAgXG4gIGludGVyZmFjZSBVc2VyIHtcbiAgICBpZDogc3RyaW5nXG4gICAgZW1haWw6IHN0cmluZ1xuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsXG4gICAgaW1hZ2U/OiBzdHJpbmcgfCBudWxsXG4gICAgcm9sZTogc3RyaW5nXG4gICAgcHJvZmlsZUNvbXBsZXRlPzogYm9vbGVhblxuICB9XG59XG5cbi8vIERlZmluaXIgdmFyacOhdmVpcyBwYXJhIGdhcmFudGlyIHF1ZSBlc3RlamFtIGRpc3BvbsOtdmVpc1xuY29uc3QgR09PR0xFX0NMSUVOVF9JRCA9IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSURcbmNvbnN0IEdPT0dMRV9DTElFTlRfU0VDUkVUID0gcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVRcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSxcbiAgZGVidWc6IGZhbHNlLFxuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6ICdjcmVkZW50aWFscycsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogJ0VtYWlsJywgdHlwZTogJ2VtYWlsJyB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogJ1Bhc3N3b3JkJywgdHlwZTogJ3Bhc3N3b3JkJyB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpXG5cbiAgICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcbiAgICAgICAgICAgIHByb2ZpbGVDb21wbGV0ZTogdXNlci5wcm9maWxlQ29tcGxldGUsXG4gICAgICAgICAgICBpbWFnZTogdXNlci5pbWFnZVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRoIGVycm9yOicsIGVycm9yKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcbiAgICBHb29nbGVQcm92aWRlcih7XG4gICAgICBjbGllbnRJZDogR09PR0xFX0NMSUVOVF9JRCBhcyBzdHJpbmcsXG4gICAgICBjbGllbnRTZWNyZXQ6IEdPT0dMRV9DTElFTlRfU0VDUkVUIGFzIHN0cmluZyxcbiAgICAgIGFsbG93RGFuZ2Vyb3VzRW1haWxBY2NvdW50TGlua2luZzogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiAnand0JyxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46ICcvYXV0aC9zaWduaW4nLFxuICAgIGVycm9yOiAnL2F1dGgvZXJyb3InLFxuICB9LFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgYWNjb3VudCwgdHJpZ2dlciB9KSB7XG4gICAgICAvLyBTZSDDqSB1bSBub3ZvIGxvZ2luIG91IHRyaWdnZXIgZGUgdXBkYXRlXG4gICAgICBpZiAodXNlciB8fCB0cmlnZ2VyID09PSAndXBkYXRlJykge1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgIHRva2VuLnJvbGUgPSB1c2VyLnJvbGVcbiAgICAgICAgICB0b2tlbi5zdWIgPSB1c2VyLmlkXG4gICAgICAgICAgdG9rZW4ucHJvZmlsZUNvbXBsZXRlID0gdXNlci5wcm9maWxlQ29tcGxldGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2VtcHJlIGJ1c2NhciBkYWRvcyBhdHVhbGl6YWRvcyBkbyBiYW5jbyBwYXJhIGdhcmFudGlyIGNvbnNpc3TDqm5jaWFcbiAgICAgICAgaWYgKHRva2VuLnN1Yikge1xuICAgICAgICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgICAgd2hlcmU6IHsgaWQ6IHRva2VuLnN1YiB9LFxuICAgICAgICAgICAgc2VsZWN0OiB7IFxuICAgICAgICAgICAgICByb2xlOiB0cnVlLCBcbiAgICAgICAgICAgICAgcHJvZmlsZUNvbXBsZXRlOiB0cnVlLFxuICAgICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgICBlbWFpbDogdHJ1ZSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChkYlVzZXIpIHtcbiAgICAgICAgICAgIHRva2VuLnJvbGUgPSBkYlVzZXIucm9sZVxuICAgICAgICAgICAgdG9rZW4ucHJvZmlsZUNvbXBsZXRlID0gZGJVc2VyLnByb2ZpbGVDb21wbGV0ZVxuICAgICAgICAgICAgdG9rZW4ubmFtZSA9IGRiVXNlci5uYW1lXG4gICAgICAgICAgICB0b2tlbi5lbWFpbCA9IGRiVXNlci5lbWFpbFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLnN1YiFcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlIGFzIHN0cmluZ1xuICAgICAgICBzZXNzaW9uLnVzZXIucHJvZmlsZUNvbXBsZXRlID0gdG9rZW4ucHJvZmlsZUNvbXBsZXRlIGFzIGJvb2xlYW5cbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uXG4gICAgfSxcbiAgICBhc3luYyBzaWduSW4oeyB1c2VyLCBhY2NvdW50LCBwcm9maWxlIH0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCfwn5S1IFtTSUdOSU5dIENhbGxiYWNrIGluaWNpYWRvOicsIHsgXG4gICAgICAgIHByb3ZpZGVyOiBhY2NvdW50Py5wcm92aWRlciwgXG4gICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICB1c2VySWQ6IHVzZXIuaWQgXG4gICAgICB9KVxuICAgICAgXG4gICAgICBpZiAoYWNjb3VudD8ucHJvdmlkZXIgPT09ICdnb29nbGUnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ/CflI0gW1NJR05JTl0gUHJvY2Vzc2FuZG8gbG9naW4gR29vZ2xlIHBhcmE6JywgdXNlci5lbWFpbClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBCdXNjYXIgdXN1w6FyaW8gZXhpc3RlbnRlIG5vIGJhbmNvIGRlIGRhZG9zXG4gICAgICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgICB3aGVyZTogeyBlbWFpbDogdXNlci5lbWFpbCEgfSxcbiAgICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICAgICAgZW1haWw6IHRydWUsXG4gICAgICAgICAgICAgIG5hbWU6IHRydWUsXG4gICAgICAgICAgICAgIHJvbGU6IHRydWUsXG4gICAgICAgICAgICAgIHByb2ZpbGVDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgaW1hZ2U6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUubG9nKCfwn5GkIFtTSUdOSU5dIFVzdcOhcmlvIGV4aXN0ZW50ZTonLCBleGlzdGluZ1VzZXIgPyAnU0lNJyA6ICdOw4NPJylcblxuICAgICAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgW1NJR05JTl0gVXN1w6FyaW8gYXV0b3JpemFkbyBlbmNvbnRyYWRvOicsIHtcbiAgICAgICAgICAgICAgaWQ6IGV4aXN0aW5nVXNlci5pZCxcbiAgICAgICAgICAgICAgZW1haWw6IGV4aXN0aW5nVXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgcm9sZTogZXhpc3RpbmdVc2VyLnJvbGUsXG4gICAgICAgICAgICAgIHByb2ZpbGVDb21wbGV0ZTogZXhpc3RpbmdVc2VyLnByb2ZpbGVDb21wbGV0ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXR1YWxpemFyIGRhZG9zIGRvIHVzdcOhcmlvIG5vIG9iamV0byB1c2VyIHBhcmEgbyBKV1RcbiAgICAgICAgICAgIHVzZXIuaWQgPSBleGlzdGluZ1VzZXIuaWRcbiAgICAgICAgICAgIHVzZXIucm9sZSA9IGV4aXN0aW5nVXNlci5yb2xlXG4gICAgICAgICAgICB1c2VyLnByb2ZpbGVDb21wbGV0ZSA9IGV4aXN0aW5nVXNlci5wcm9maWxlQ29tcGxldGVcbiAgICAgICAgICAgIHVzZXIubmFtZSA9IGV4aXN0aW5nVXNlci5uYW1lIHx8IHVzZXIubmFtZVxuICAgICAgICAgICAgdXNlci5pbWFnZSA9IGV4aXN0aW5nVXNlci5pbWFnZSB8fCB1c2VyLmltYWdlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNFR1VSQU7Dh0E6IE7Do28gY3JpYXIgdXN1w6FyaW9zIGF1dG9tYXRpY2FtZW50ZVxuICAgICAgICAgICAgLy8gQXBlbmFzIHVzdcOhcmlvcyBwcsOpLWNhZGFzdHJhZG9zIHBvZGVtIGZhemVyIGxvZ2luXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn4p2MIFtTSUdOSU5dIFVzdcOhcmlvIG7Do28gYXV0b3JpemFkbzonLCB1c2VyLmVtYWlsKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ/CflJIgW1NJR05JTl0gRW1haWwgbsOjbyBlc3TDoSBjYWRhc3RyYWRvIG5vIHNpc3RlbWEnKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXRvcm5hciBmYWxzZSBibG9xdWVpYSBvIGxvZ2luXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIFtTSUdOSU5dIEVycm8gYW8gcHJvY2Vzc2FyIHVzdcOhcmlvIEdvb2dsZTonLCBlcnJvcilcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zb2xlLmxvZygn4pyFIFtTSUdOSU5dIExvZ2luIGNvbSBvdXRyb3MgcHJvdmlkZXJzIHBlcm1pdGlkbycpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gICAgYXN5bmMgcmVkaXJlY3QoeyB1cmwsIGJhc2VVcmwgfSkge1xuICAgICAgLy8gU2UgZm9yIGNhbGxiYWNrIGRvIEdvb2dsZSBvdSBvdXRyb3MgcHJvdmlkZXJzIE9BdXRoXG4gICAgICBpZiAodXJsLmluY2x1ZGVzKCcvYXBpL2F1dGgvY2FsbGJhY2svJykpIHtcbiAgICAgICAgLy8gUGFyYSBjYWxsYmFja3MgT0F1dGgsIHNlbXByZSByZWRpcmVjaW9uYXIgcGFyYSBhIHDDoWdpbmEgaW5pY2lhbFxuICAgICAgICAvLyBPIG1pZGRsZXdhcmUgaXLDoSB2ZXJpZmljYXIgbyByb2xlIGUgcmVkaXJlY2lvbmFyIGFkZXF1YWRhbWVudGVcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9L2BcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gU2UgZm9yIFVSTCByZWxhdGl2YSwgdXNhciBiYXNlVXJsXG4gICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0ke3VybH1gXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFNlIGZvciBtZXNtYSBvcmlnZW0sIHBlcm1pdGlyXG4gICAgICBpZiAobmV3IFVSTCh1cmwpLm9yaWdpbiA9PT0gYmFzZVVybCkge1xuICAgICAgICByZXR1cm4gdXJsXG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBiYXNlVXJsXG4gICAgfSxcbiAgfSxcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG59XG4iXSwibmFtZXMiOlsiUHJpc21hQWRhcHRlciIsIkdvb2dsZVByb3ZpZGVyIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsInByaXNtYSIsIkdPT0dMRV9DTElFTlRfSUQiLCJwcm9jZXNzIiwiZW52IiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJkZWJ1ZyIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiY29tcGFyZSIsImlkIiwicm9sZSIsInByb2ZpbGVDb21wbGV0ZSIsImltYWdlIiwiZXJyb3IiLCJjb25zb2xlIiwiY2xpZW50SWQiLCJjbGllbnRTZWNyZXQiLCJhbGxvd0Rhbmdlcm91c0VtYWlsQWNjb3VudExpbmtpbmciLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJwYWdlcyIsInNpZ25JbiIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwiYWNjb3VudCIsInRyaWdnZXIiLCJzdWIiLCJkYlVzZXIiLCJzZWxlY3QiLCJwcm9maWxlIiwibG9nIiwicHJvdmlkZXIiLCJ1c2VySWQiLCJleGlzdGluZ1VzZXIiLCJyZWRpcmVjdCIsInVybCIsImJhc2VVcmwiLCJpbmNsdWRlcyIsInN0YXJ0c1dpdGgiLCJVUkwiLCJvcmlnaW4iLCJzZWNyZXQiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@next-auth"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();