/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */

const baseConfig =
  process.env.NODE_ENV === "production"
    ? // when running the Netify CLI or building on Netlify, we want to use
    {
      server: "./server.js",
      serverBuildPath: ".netlify/functions-internal/server.js",
    }
    : // otherwise support running remix dev, i.e. no custom server
    undefined;

module.exports = {
  ...baseConfig,
  appDirectory: 'app',
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  devServerPort: 8002,
  watchPaths: ['../../libs'],
  ignoredRouteFiles: ["**/project.json"],
};
