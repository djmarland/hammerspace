import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),
    csrf: {
      checkOrigin: false
    }
  },
  vite: {
    server: {
      port: 3000,
      host: '0.0.0.0'
    }
  }
};
