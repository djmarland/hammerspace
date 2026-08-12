import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    alias: {
      '@': 'src'
    },
    adapter: adapter(),
    csrf: {
      trustedOrigins: ['*']
    }
  },
  vite: {
    server: {
      port: 3000,
      host: '0.0.0.0'
    }
  }
};
