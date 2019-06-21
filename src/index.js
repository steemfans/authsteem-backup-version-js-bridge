'use strict';
const env = process.env;

const Hapi = require('hapi');

const server = Hapi.server({
  port: 8899,
});
const api_url = env.api_url ? env.api_url : '';

server.route({
  method: 'GET',
  path: '/',
  options: {
    cors: true
  },
  handler: (request, h) => {
    return {
      status: true,
      api_url: api_url,
      msg: "Hello, Authsteem!",
    };
  }
});

server.route({
  method: 'GET',
  path: '/global_config',
  options: {
    cors: true
  },
  handler: (request, h) => {
    return {status: true, result: {
      api_url,
    }};
  }
});

const init = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();