import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Await experiments.
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };

    // Set the output for wasm files.
    config.output.webassemblyModuleFilename = isServer
      ? './../static/wasm/[modulehash].wasm'
      : 'static/wasm/[modulehash].wasm';

    // See https://webpack.js.org/configuration/resolve/#resolvefallback
    config.resolve.fallback = { fs: false };

    // Rule to handle wasm files.
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'javascript/auto',
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/wasm',
            outputPath: 'static/wasm',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
