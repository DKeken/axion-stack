import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Настройки Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },

  // Настройка для работы с Paraglide i18n
  async rewrites() {
    return [
      {
        source: '/paraglide/:path*',
        destination: '/_paraglide/:path*',
      },
    ];
  },

  // Transpile packages из monorepo
  transpilePackages: ['@repo/contracts', '@repo/common'],

  // Оптимизация изображений
  images: {
    domains: ['res.cloudinary.com', 'axion.pro', 'storage.googleapis.com', 'axion.epic.ms'],
    formats: ['image/webp', 'image/avif'],
  },

  // Настройки для production
  poweredByHeader: false,

  // Обработка TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint настройки
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true, // Отключаем ESLint во время сборки для более быстрой сборки
  },
};

export default nextConfig;
