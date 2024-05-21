module.exports = {
  apps: [
    {
      name: 'media-crawler',
      script: 'dist/src/main.js',
      watch: false,
      namespace: 'crawler',
      node_args: ['-r ./.pnp.cjs'],
      autorestart: true,
      max_restarts: 5, // 最大异常重启次数
      restart_delay: 10, // 异常重启情况下，延时重启时间
    },
  ],
};
