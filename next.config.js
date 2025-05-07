/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Add or merge the following webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
            test: /\.txt$/,
            use: 'raw-loader',
        });
        return config;
    },
};

module.exports = nextConfig;
