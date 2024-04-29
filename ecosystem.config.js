module.exports = {
  apps: [
    {
      name: 'media-crawler',
      script: 'dist/src/main.js',
      watch: false,
      namespace: 'crawler',
      autorestart: true,
    },
  ],
};
