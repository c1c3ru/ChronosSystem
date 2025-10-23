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
exports.id = "app/api/dashboard/activity/route";
exports.ids = ["app/api/dashboard/activity/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Factivity%2Froute&page=%2Fapi%2Fdashboard%2Factivity%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Factivity%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Factivity%2Froute&page=%2Fapi%2Fdashboard%2Factivity%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Factivity%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_deppi_ChronosSystem_app_api_dashboard_activity_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/dashboard/activity/route.ts */ \"(rsc)/./app/api/dashboard/activity/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/dashboard/activity/route\",\n        pathname: \"/api/dashboard/activity\",\n        filename: \"route\",\n        bundlePath: \"app/api/dashboard/activity/route\"\n    },\n    resolvedPagePath: \"/home/deppi/ChronosSystem/app/api/dashboard/activity/route.ts\",\n    nextConfigOutput,\n    userland: _home_deppi_ChronosSystem_app_api_dashboard_activity_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/dashboard/activity/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZkYXNoYm9hcmQlMkZhY3Rpdml0eSUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGZGFzaGJvYXJkJTJGYWN0aXZpdHklMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZkYXNoYm9hcmQlMkZhY3Rpdml0eSUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGZGVwcGklMkZDaHJvbm9zU3lzdGVtJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZob21lJTJGZGVwcGklMkZDaHJvbm9zU3lzdGVtJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNhO0FBQzFGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb25vcy1zeXN0ZW0vPzI1MWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL2hvbWUvZGVwcGkvQ2hyb25vc1N5c3RlbS9hcHAvYXBpL2Rhc2hib2FyZC9hY3Rpdml0eS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvZGFzaGJvYXJkL2FjdGl2aXR5L3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZGFzaGJvYXJkL2FjdGl2aXR5XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9kYXNoYm9hcmQvYWN0aXZpdHkvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9kZXBwaS9DaHJvbm9zU3lzdGVtL2FwcC9hcGkvZGFzaGJvYXJkL2FjdGl2aXR5L3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9kYXNoYm9hcmQvYWN0aXZpdHkvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Factivity%2Froute&page=%2Fapi%2Fdashboard%2Factivity%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Factivity%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/dashboard/activity/route.ts":
/*!*********************************************!*\
  !*** ./app/api/dashboard/activity/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n// GET /api/dashboard/activity - Atividade recente\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || ![\n            \"ADMIN\",\n            \"SUPERVISOR\"\n        ].includes(session.user.role)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"N\\xe3o autorizado\"\n            }, {\n                status: 401\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const limit = parseInt(searchParams.get(\"limit\") || \"10\");\n        // Buscar registros recentes com dados do usuário e máquina\n        const recentRecords = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.attendanceRecord.findMany({\n            take: limit,\n            orderBy: {\n                timestamp: \"desc\"\n            },\n            include: {\n                user: {\n                    select: {\n                        name: true,\n                        email: true\n                    }\n                },\n                machine: {\n                    select: {\n                        name: true,\n                        location: true\n                    }\n                }\n            }\n        });\n        // Formatar dados para o frontend\n        const activity = recentRecords.map((record)=>({\n                id: record.id,\n                user: record.user.name || record.user.email,\n                action: record.type === \"ENTRY\" ? \"registrou entrada\" : \"registrou sa\\xedda\",\n                timestamp: formatTimeAgo(record.timestamp),\n                type: record.type,\n                location: record.machine.name,\n                fullLocation: record.machine.location,\n                rawTimestamp: record.timestamp\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(activity);\n    } catch (error) {\n        console.error(\"Erro ao buscar atividade recente:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erro interno do servidor\"\n        }, {\n            status: 500\n        });\n    }\n}\n// Função auxiliar para formatar tempo relativo\nfunction formatTimeAgo(date) {\n    const now = new Date();\n    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);\n    if (diffInSeconds < 60) {\n        return \"h\\xe1 poucos segundos\";\n    } else if (diffInSeconds < 3600) {\n        const minutes = Math.floor(diffInSeconds / 60);\n        return `há ${minutes} minuto${minutes > 1 ? \"s\" : \"\"}`;\n    } else if (diffInSeconds < 86400) {\n        const hours = Math.floor(diffInSeconds / 3600);\n        return `há ${hours} hora${hours > 1 ? \"s\" : \"\"}`;\n    } else {\n        const days = Math.floor(diffInSeconds / 86400);\n        return `há ${days} dia${days > 1 ? \"s\" : \"\"}`;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Rhc2hib2FyZC9hY3Rpdml0eS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBdUQ7QUFDWDtBQUNKO0FBQ0g7QUFFckMsa0RBQWtEO0FBQzNDLGVBQWVJLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO1FBRWxELElBQUksQ0FBQ0ksV0FBVyxDQUFDO1lBQUM7WUFBUztTQUFhLENBQUNDLFFBQVEsQ0FBQ0QsUUFBUUUsSUFBSSxDQUFDQyxJQUFJLEdBQUc7WUFDcEUsT0FBT1QscURBQVlBLENBQUNVLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFpQixHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDdEU7UUFFQSxNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlULFFBQVFVLEdBQUc7UUFDNUMsTUFBTUMsUUFBUUMsU0FBU0osYUFBYUssR0FBRyxDQUFDLFlBQVk7UUFFcEQsMkRBQTJEO1FBQzNELE1BQU1DLGdCQUFnQixNQUFNaEIsK0NBQU1BLENBQUNpQixnQkFBZ0IsQ0FBQ0MsUUFBUSxDQUFDO1lBQzNEQyxNQUFNTjtZQUNOTyxTQUFTO2dCQUFFQyxXQUFXO1lBQU87WUFDN0JDLFNBQVM7Z0JBQ1BqQixNQUFNO29CQUNKa0IsUUFBUTt3QkFDTkMsTUFBTTt3QkFDTkMsT0FBTztvQkFDVDtnQkFDRjtnQkFDQUMsU0FBUztvQkFDUEgsUUFBUTt3QkFDTkMsTUFBTTt3QkFDTkcsVUFBVTtvQkFDWjtnQkFDRjtZQUNGO1FBQ0Y7UUFFQSxpQ0FBaUM7UUFDakMsTUFBTUMsV0FBV1osY0FBY2EsR0FBRyxDQUFDQyxDQUFBQSxTQUFXO2dCQUM1Q0MsSUFBSUQsT0FBT0MsRUFBRTtnQkFDYjFCLE1BQU15QixPQUFPekIsSUFBSSxDQUFDbUIsSUFBSSxJQUFJTSxPQUFPekIsSUFBSSxDQUFDb0IsS0FBSztnQkFDM0NPLFFBQVFGLE9BQU9HLElBQUksS0FBSyxVQUFVLHNCQUFzQjtnQkFDeERaLFdBQVdhLGNBQWNKLE9BQU9ULFNBQVM7Z0JBQ3pDWSxNQUFNSCxPQUFPRyxJQUFJO2dCQUNqQk4sVUFBVUcsT0FBT0osT0FBTyxDQUFDRixJQUFJO2dCQUM3QlcsY0FBY0wsT0FBT0osT0FBTyxDQUFDQyxRQUFRO2dCQUNyQ1MsY0FBY04sT0FBT1QsU0FBUztZQUNoQztRQUVBLE9BQU94QixxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDcUI7SUFDM0IsRUFBRSxPQUFPcEIsT0FBTztRQUNkNkIsUUFBUTdCLEtBQUssQ0FBQyxxQ0FBcUNBO1FBQ25ELE9BQU9YLHFEQUFZQSxDQUFDVSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUEyQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNoRjtBQUNGO0FBRUEsK0NBQStDO0FBQy9DLFNBQVN5QixjQUFjSSxJQUFVO0lBQy9CLE1BQU1DLE1BQU0sSUFBSUM7SUFDaEIsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUMsQ0FBQ0osSUFBSUssT0FBTyxLQUFLTixLQUFLTSxPQUFPLEVBQUMsSUFBSztJQUVwRSxJQUFJSCxnQkFBZ0IsSUFBSTtRQUN0QixPQUFPO0lBQ1QsT0FBTyxJQUFJQSxnQkFBZ0IsTUFBTTtRQUMvQixNQUFNSSxVQUFVSCxLQUFLQyxLQUFLLENBQUNGLGdCQUFnQjtRQUMzQyxPQUFPLENBQUMsR0FBRyxFQUFFSSxRQUFRLE9BQU8sRUFBRUEsVUFBVSxJQUFJLE1BQU0sR0FBRyxDQUFDO0lBQ3hELE9BQU8sSUFBSUosZ0JBQWdCLE9BQU87UUFDaEMsTUFBTUssUUFBUUosS0FBS0MsS0FBSyxDQUFDRixnQkFBZ0I7UUFDekMsT0FBTyxDQUFDLEdBQUcsRUFBRUssTUFBTSxLQUFLLEVBQUVBLFFBQVEsSUFBSSxNQUFNLEdBQUcsQ0FBQztJQUNsRCxPQUFPO1FBQ0wsTUFBTUMsT0FBT0wsS0FBS0MsS0FBSyxDQUFDRixnQkFBZ0I7UUFDeEMsT0FBTyxDQUFDLEdBQUcsRUFBRU0sS0FBSyxJQUFJLEVBQUVBLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQztJQUMvQztBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb25vcy1zeXN0ZW0vLi9hcHAvYXBpL2Rhc2hib2FyZC9hY3Rpdml0eS9yb3V0ZS50cz80YzJhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnXG5cbi8vIEdFVCAvYXBpL2Rhc2hib2FyZC9hY3Rpdml0eSAtIEF0aXZpZGFkZSByZWNlbnRlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gICAgXG4gICAgaWYgKCFzZXNzaW9uIHx8ICFbJ0FETUlOJywgJ1NVUEVSVklTT1InXS5pbmNsdWRlcyhzZXNzaW9uLnVzZXIucm9sZSkpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTsOjbyBhdXRvcml6YWRvJyB9LCB7IHN0YXR1czogNDAxIH0pXG4gICAgfVxuXG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxdWVzdC51cmwpXG4gICAgY29uc3QgbGltaXQgPSBwYXJzZUludChzZWFyY2hQYXJhbXMuZ2V0KCdsaW1pdCcpIHx8ICcxMCcpXG5cbiAgICAvLyBCdXNjYXIgcmVnaXN0cm9zIHJlY2VudGVzIGNvbSBkYWRvcyBkbyB1c3XDoXJpbyBlIG3DoXF1aW5hXG4gICAgY29uc3QgcmVjZW50UmVjb3JkcyA9IGF3YWl0IHByaXNtYS5hdHRlbmRhbmNlUmVjb3JkLmZpbmRNYW55KHtcbiAgICAgIHRha2U6IGxpbWl0LFxuICAgICAgb3JkZXJCeTogeyB0aW1lc3RhbXA6ICdkZXNjJyB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgZW1haWw6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1hY2hpbmU6IHtcbiAgICAgICAgICBzZWxlY3Q6IHtcbiAgICAgICAgICAgIG5hbWU6IHRydWUsXG4gICAgICAgICAgICBsb2NhdGlvbjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBGb3JtYXRhciBkYWRvcyBwYXJhIG8gZnJvbnRlbmRcbiAgICBjb25zdCBhY3Rpdml0eSA9IHJlY2VudFJlY29yZHMubWFwKHJlY29yZCA9PiAoe1xuICAgICAgaWQ6IHJlY29yZC5pZCxcbiAgICAgIHVzZXI6IHJlY29yZC51c2VyLm5hbWUgfHwgcmVjb3JkLnVzZXIuZW1haWwsXG4gICAgICBhY3Rpb246IHJlY29yZC50eXBlID09PSAnRU5UUlknID8gJ3JlZ2lzdHJvdSBlbnRyYWRhJyA6ICdyZWdpc3Ryb3Ugc2HDrWRhJyxcbiAgICAgIHRpbWVzdGFtcDogZm9ybWF0VGltZUFnbyhyZWNvcmQudGltZXN0YW1wKSxcbiAgICAgIHR5cGU6IHJlY29yZC50eXBlLFxuICAgICAgbG9jYXRpb246IHJlY29yZC5tYWNoaW5lLm5hbWUsXG4gICAgICBmdWxsTG9jYXRpb246IHJlY29yZC5tYWNoaW5lLmxvY2F0aW9uLFxuICAgICAgcmF3VGltZXN0YW1wOiByZWNvcmQudGltZXN0YW1wXG4gICAgfSkpXG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oYWN0aXZpdHkpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJybyBhbyBidXNjYXIgYXRpdmlkYWRlIHJlY2VudGU6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdFcnJvIGludGVybm8gZG8gc2Vydmlkb3InIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufVxuXG4vLyBGdW7Dp8OjbyBhdXhpbGlhciBwYXJhIGZvcm1hdGFyIHRlbXBvIHJlbGF0aXZvXG5mdW5jdGlvbiBmb3JtYXRUaW1lQWdvKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gIGNvbnN0IGRpZmZJblNlY29uZHMgPSBNYXRoLmZsb29yKChub3cuZ2V0VGltZSgpIC0gZGF0ZS5nZXRUaW1lKCkpIC8gMTAwMClcblxuICBpZiAoZGlmZkluU2Vjb25kcyA8IDYwKSB7XG4gICAgcmV0dXJuICdow6EgcG91Y29zIHNlZ3VuZG9zJ1xuICB9IGVsc2UgaWYgKGRpZmZJblNlY29uZHMgPCAzNjAwKSB7XG4gICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoZGlmZkluU2Vjb25kcyAvIDYwKVxuICAgIHJldHVybiBgaMOhICR7bWludXRlc30gbWludXRvJHttaW51dGVzID4gMSA/ICdzJyA6ICcnfWBcbiAgfSBlbHNlIGlmIChkaWZmSW5TZWNvbmRzIDwgODY0MDApIHtcbiAgICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IoZGlmZkluU2Vjb25kcyAvIDM2MDApXG4gICAgcmV0dXJuIGBow6EgJHtob3Vyc30gaG9yYSR7aG91cnMgPiAxID8gJ3MnIDogJyd9YFxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKGRpZmZJblNlY29uZHMgLyA4NjQwMClcbiAgICByZXR1cm4gYGjDoSAke2RheXN9IGRpYSR7ZGF5cyA+IDEgPyAncycgOiAnJ31gXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJwcmlzbWEiLCJHRVQiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsImluY2x1ZGVzIiwidXNlciIsInJvbGUiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJsaW1pdCIsInBhcnNlSW50IiwiZ2V0IiwicmVjZW50UmVjb3JkcyIsImF0dGVuZGFuY2VSZWNvcmQiLCJmaW5kTWFueSIsInRha2UiLCJvcmRlckJ5IiwidGltZXN0YW1wIiwiaW5jbHVkZSIsInNlbGVjdCIsIm5hbWUiLCJlbWFpbCIsIm1hY2hpbmUiLCJsb2NhdGlvbiIsImFjdGl2aXR5IiwibWFwIiwicmVjb3JkIiwiaWQiLCJhY3Rpb24iLCJ0eXBlIiwiZm9ybWF0VGltZUFnbyIsImZ1bGxMb2NhdGlvbiIsInJhd1RpbWVzdGFtcCIsImNvbnNvbGUiLCJkYXRlIiwibm93IiwiRGF0ZSIsImRpZmZJblNlY29uZHMiLCJNYXRoIiwiZmxvb3IiLCJnZXRUaW1lIiwibWludXRlcyIsImhvdXJzIiwiZGF5cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/dashboard/activity/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\n\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma),\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    return null;\n                }\n                const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    return null;\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name,\n                    role: user.role\n                };\n            }\n        }),\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID || \"\",\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET || \"\"\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    events: {\n        async linkAccount ({ user, account, profile }) {\n            // Log quando uma conta é vinculada\n            console.log(\"Account linked:\", {\n                user: user.email,\n                provider: account.provider\n            });\n        },\n        async createUser ({ user }) {\n            // Configurar novos usuários criados via OAuth\n            // Usuários OAuth precisam completar perfil, usuários de credenciais não\n            if (user.email) {\n                await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.update({\n                    where: {\n                        id: user.id\n                    },\n                    data: {\n                        role: \"EMPLOYEE\",\n                        profileComplete: false // OAuth users need to complete profile\n                    }\n                });\n                console.log(\"New OAuth user configured:\", user.email, \"- needs to complete profile\");\n            }\n        }\n    },\n    callbacks: {\n        async jwt ({ token, user, trigger, session }) {\n            // Sempre buscar dados atualizados do banco para garantir consistência\n            const userId = user?.id || token.sub;\n            if (userId) {\n                const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                    where: {\n                        id: userId\n                    },\n                    select: {\n                        role: true,\n                        profileComplete: true\n                    }\n                });\n                if (dbUser) {\n                    token.role = dbUser.role;\n                    token.sub = userId;\n                    token.profileComplete = dbUser.profileComplete;\n                    console.log(\"JWT callback - User:\", userId.slice(-8), \"profileComplete:\", dbUser.profileComplete);\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token && session.user) {\n                session.user.id = token.sub;\n                session.user.role = token.role;\n                session.user.profileComplete = token.profileComplete;\n            }\n            return session;\n        },\n        async signIn ({ user, account, profile }) {\n            if (account?.provider === \"google\") {\n                // Verificar se já existe um usuário com este email\n                const existingUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_4__.prisma.user.findUnique({\n                    where: {\n                        email: user.email\n                    }\n                });\n                if (existingUser) {\n                    // Se o usuário existe, permitir vinculação da conta Google\n                    console.log(\"Linking Google account to existing user:\", user.email);\n                    return true;\n                }\n            }\n            // Permitir todos os outros logins\n            return true;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUU5Q04sUUFBUUMsR0FBRyxDQUFDLHdCQUF3QlUsT0FBT0ksS0FBSyxDQUFDLENBQUMsSUFBSSxvQkFBb0JGLE9BQU9QLGVBQWU7Z0JBQ2xHO1lBQ0Y7WUFFQSxPQUFPRztRQUNUO1FBQ0EsTUFBTWYsU0FBUSxFQUFFQSxPQUFPLEVBQUVlLEtBQUssRUFBRTtZQUM5QixJQUFJQSxTQUFTZixRQUFRYixJQUFJLEVBQUU7Z0JBQ3pCYSxRQUFRYixJQUFJLENBQUNLLEVBQUUsR0FBR3VCLE1BQU1HLEdBQUc7Z0JBQzNCbEIsUUFBUWIsSUFBSSxDQUFDTSxJQUFJLEdBQUdzQixNQUFNdEIsSUFBSTtnQkFDNUJPLFFBQVFiLElBQUksQ0FBU3lCLGVBQWUsR0FBR0csTUFBTUgsZUFBZTtZQUNoRTtZQUNBLE9BQU9aO1FBQ1Q7UUFDQSxNQUFNc0IsUUFBTyxFQUFFbkMsSUFBSSxFQUFFaUIsT0FBTyxFQUFFQyxPQUFPLEVBQUU7WUFDckMsSUFBSUQsU0FBU0ksYUFBYSxVQUFVO2dCQUNsQyxtREFBbUQ7Z0JBQ25ELE1BQU1lLGVBQWUsTUFBTS9DLCtDQUFNQSxDQUFDVyxJQUFJLENBQUNDLFVBQVUsQ0FBQztvQkFDaERDLE9BQU87d0JBQUVQLE9BQU9LLEtBQUtMLEtBQUs7b0JBQUU7Z0JBQzlCO2dCQUVBLElBQUl5QyxjQUFjO29CQUNoQiwyREFBMkQ7b0JBQzNEakIsUUFBUUMsR0FBRyxDQUFDLDRDQUE0Q3BCLEtBQUtMLEtBQUs7b0JBQ2xFLE9BQU87Z0JBQ1Q7WUFDRjtZQUVBLGtDQUFrQztZQUNsQyxPQUFPO1FBQ1Q7SUFDRjtJQUNBMEMsT0FBTztRQUNMRixRQUFRO0lBQ1Y7QUFDRixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hyb25vcy1zeXN0ZW0vLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tICdAbmV4dC1hdXRoL3ByaXNtYS1hZGFwdGVyJ1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFscydcbmltcG9ydCBHb29nbGVQcm92aWRlciBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2dvb2dsZSdcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnXG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogJ2NyZWRlbnRpYWxzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiAnRW1haWwnLCB0eXBlOiAnZW1haWwnIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiAnUGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsIH1cbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoXG4gICAgICAgICAgY3JlZGVudGlhbHMucGFzc3dvcmQsXG4gICAgICAgICAgdXNlci5wYXNzd29yZFxuICAgICAgICApXG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSksXG4gICAgR29vZ2xlUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQgfHwgJycsXG4gICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVUIHx8ICcnLFxuICAgIH0pXG4gIF0sXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogJ2p3dCdcbiAgfSxcbiAgZXZlbnRzOiB7XG4gICAgYXN5bmMgbGlua0FjY291bnQoeyB1c2VyLCBhY2NvdW50LCBwcm9maWxlIH0pIHtcbiAgICAgIC8vIExvZyBxdWFuZG8gdW1hIGNvbnRhIMOpIHZpbmN1bGFkYVxuICAgICAgY29uc29sZS5sb2coJ0FjY291bnQgbGlua2VkOicsIHsgdXNlcjogdXNlci5lbWFpbCwgcHJvdmlkZXI6IGFjY291bnQucHJvdmlkZXIgfSlcbiAgICB9LFxuICAgIGFzeW5jIGNyZWF0ZVVzZXIoeyB1c2VyIH0pIHtcbiAgICAgIC8vIENvbmZpZ3VyYXIgbm92b3MgdXN1w6FyaW9zIGNyaWFkb3MgdmlhIE9BdXRoXG4gICAgICAvLyBVc3XDoXJpb3MgT0F1dGggcHJlY2lzYW0gY29tcGxldGFyIHBlcmZpbCwgdXN1w6FyaW9zIGRlIGNyZWRlbmNpYWlzIG7Do29cbiAgICAgIGlmICh1c2VyLmVtYWlsKSB7XG4gICAgICAgIGF3YWl0IChwcmlzbWEudXNlciBhcyBhbnkpLnVwZGF0ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgaWQ6IHVzZXIuaWQgfSxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByb2xlOiAnRU1QTE9ZRUUnLFxuICAgICAgICAgICAgcHJvZmlsZUNvbXBsZXRlOiBmYWxzZSAvLyBPQXV0aCB1c2VycyBuZWVkIHRvIGNvbXBsZXRlIHByb2ZpbGVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnNvbGUubG9nKCdOZXcgT0F1dGggdXNlciBjb25maWd1cmVkOicsIHVzZXIuZW1haWwsICctIG5lZWRzIHRvIGNvbXBsZXRlIHByb2ZpbGUnKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCB0cmlnZ2VyLCBzZXNzaW9uIH0pIHtcbiAgICAgIC8vIFNlbXByZSBidXNjYXIgZGFkb3MgYXR1YWxpemFkb3MgZG8gYmFuY28gcGFyYSBnYXJhbnRpciBjb25zaXN0w6puY2lhXG4gICAgICBjb25zdCB1c2VySWQgPSB1c2VyPy5pZCB8fCB0b2tlbi5zdWJcbiAgICAgIFxuICAgICAgaWYgKHVzZXJJZCkge1xuICAgICAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCAocHJpc21hLnVzZXIgYXMgYW55KS5maW5kVW5pcXVlKHtcbiAgICAgICAgICB3aGVyZTogeyBpZDogdXNlcklkIH0sXG4gICAgICAgICAgc2VsZWN0OiB7IHJvbGU6IHRydWUsIHByb2ZpbGVDb21wbGV0ZTogdHJ1ZSB9XG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBpZiAoZGJVc2VyKSB7XG4gICAgICAgICAgdG9rZW4ucm9sZSA9IGRiVXNlci5yb2xlXG4gICAgICAgICAgdG9rZW4uc3ViID0gdXNlcklkXG4gICAgICAgICAgdG9rZW4ucHJvZmlsZUNvbXBsZXRlID0gZGJVc2VyLnByb2ZpbGVDb21wbGV0ZVxuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdKV1QgY2FsbGJhY2sgLSBVc2VyOicsIHVzZXJJZC5zbGljZSgtOCksICdwcm9maWxlQ29tcGxldGU6JywgZGJVc2VyLnByb2ZpbGVDb21wbGV0ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gdG9rZW5cbiAgICB9LFxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XG4gICAgICBpZiAodG9rZW4gJiYgc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLnN1YiFcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlIGFzIHN0cmluZ1xuICAgICAgICA7KHNlc3Npb24udXNlciBhcyBhbnkpLnByb2ZpbGVDb21wbGV0ZSA9IHRva2VuLnByb2ZpbGVDb21wbGV0ZSBhcyBib29sZWFuXG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvblxuICAgIH0sXG4gICAgYXN5bmMgc2lnbkluKHsgdXNlciwgYWNjb3VudCwgcHJvZmlsZSB9KSB7XG4gICAgICBpZiAoYWNjb3VudD8ucHJvdmlkZXIgPT09ICdnb29nbGUnKSB7XG4gICAgICAgIC8vIFZlcmlmaWNhciBzZSBqw6EgZXhpc3RlIHVtIHVzdcOhcmlvIGNvbSBlc3RlIGVtYWlsXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiB1c2VyLmVtYWlsISB9XG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XG4gICAgICAgICAgLy8gU2UgbyB1c3XDoXJpbyBleGlzdGUsIHBlcm1pdGlyIHZpbmN1bGHDp8OjbyBkYSBjb250YSBHb29nbGVcbiAgICAgICAgICBjb25zb2xlLmxvZygnTGlua2luZyBHb29nbGUgYWNjb3VudCB0byBleGlzdGluZyB1c2VyOicsIHVzZXIuZW1haWwpXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBQZXJtaXRpciB0b2RvcyBvcyBvdXRyb3MgbG9naW5zXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46ICcvYXV0aC9zaWduaW4nLFxuICB9LFxufVxuIl0sIm5hbWVzIjpbIlByaXNtYUFkYXB0ZXIiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiR29vZ2xlUHJvdmlkZXIiLCJiY3J5cHQiLCJwcmlzbWEiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlzUGFzc3dvcmRWYWxpZCIsImNvbXBhcmUiLCJpZCIsInJvbGUiLCJjbGllbnRJZCIsInByb2Nlc3MiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0lEIiwiY2xpZW50U2VjcmV0IiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJldmVudHMiLCJsaW5rQWNjb3VudCIsImFjY291bnQiLCJwcm9maWxlIiwiY29uc29sZSIsImxvZyIsInByb3ZpZGVyIiwiY3JlYXRlVXNlciIsInVwZGF0ZSIsImRhdGEiLCJwcm9maWxlQ29tcGxldGUiLCJjYWxsYmFja3MiLCJqd3QiLCJ0b2tlbiIsInRyaWdnZXIiLCJ1c2VySWQiLCJzdWIiLCJkYlVzZXIiLCJzZWxlY3QiLCJzbGljZSIsInNpZ25JbiIsImV4aXN0aW5nVXNlciIsInBhZ2VzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/@next-auth","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@panva","vendor-chunks/oidc-token-hash"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Factivity%2Froute&page=%2Fapi%2Fdashboard%2Factivity%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Factivity%2Froute.ts&appDir=%2Fhome%2Fdeppi%2FChronosSystem%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fdeppi%2FChronosSystem&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();