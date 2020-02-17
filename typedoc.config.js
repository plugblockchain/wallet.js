module.exports = {
  "name": "@plugnet/wallet",
  "out": "./api_docs",
  "mode": "modules",
  "exclude": [
    "**/node_modules/!(@plugnet)/**",
    "**/node_modules/@plugnet/!(api|types)/**",
    "scripts/*",
    "*.spec.*",
    "**/test/**",
    "**/build/**"
  ],
  "excludeExternals": false,
  "externalPattern": "**/node_modules/**",
  "external-modulemap": [
    ["@plugnet/wallet", "src/.*", "packages/wallet/README.md"],
    ["@plugnet", ".*\/@plugnet\/.*"]
  ],
  "excludePrivate": true,
  "excludeProtected": true,
  "includeDeclarations": true,
  "ignoreCompilerErrors": true,
  "theme": "markdown",
  "tsconfig": "tsconfig.json",
  "readme": "none"
};
