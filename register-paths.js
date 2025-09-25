const path = require("path");
const tsconfigPaths = require("tsconfig-paths");

const baseUrl = __dirname;

tsconfigPaths.register({
  baseUrl,
  paths: {
    "src/*": [
      path.join(baseUrl, "dist-worker", "*"),
      path.join(baseUrl, "dist", "*"),
    ],
  },
});

module.exports = {};
