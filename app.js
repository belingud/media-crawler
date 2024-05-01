// import * as express from 'express';

// import { AppMiddleware } from './src/app';
const express = require('express');
const AppMiddleware = require('./src/app');

const app = express();

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

module.exports = app;
