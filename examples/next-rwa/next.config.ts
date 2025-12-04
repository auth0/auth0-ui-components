import type { NextConfig } from 'next';

const config: NextConfig = {
  // Transpile workspace packages so Next.js can properly resolve their dependencies
  transpilePackages: ['@auth0/web-ui-components-react', '@auth0/web-ui-components-core'],

  // Empty turbopack config to silence the warning (Next.js 16+ uses Turbopack by default)
  turbopack: {},

  // Webpack configuration for module resolution (fallback for webpack mode)
  webpack: (config) => {
    // Ensure proper module resolution for .mjs files
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default config;
