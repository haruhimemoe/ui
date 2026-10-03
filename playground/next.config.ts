import type { NextConfig } from "next";

// The app lives inside the ui repo and imports ../src directly. src/ uses TypeScript's ".js"
// import specifiers for .ts/.tsx files; webpack's extensionAlias maps them (Turbopack doesn't
// yet), so the playground runs with `--webpack` (the play scripts pass it).
const config: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ...webpackConfig.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return webpackConfig;
  },
};

export default config;
