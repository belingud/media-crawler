// import * as express from 'express';

// import { AppMiddleware } from './src/app';
const express = require('express');
const { createNest, AppMiddleware } = require('./src/app');

const app = express();
app.get('/', (req, res) =>
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
  body {
    width: 35em;
    margin: 0 auto;
    font-family: Tahoma, Verdana, Arial, sans-serif;
  }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
`),
);
app.use((req, res, next) => {
  const nest = new AppMiddleware(app).use(req, res, next);
  nest
    .then(() => {
      next();
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      next();
    });
});
// async function mountSubApp(app, mountPath, subAppBoot) {
//   const subApp = await subAppBoot();

//   app.use(mountPath, subApp.getHttpAdapter().getInstance());
//   return app;
// }

// (async () => {
//   global.napp = await mountSubApp(app, '/nest', createNest);
// })();
// module.exports = global.napp;
// app.listen(3000);
// global.napp.listen(3000);
