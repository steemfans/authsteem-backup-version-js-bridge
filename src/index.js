'use strict';
const env = process.env;

const Hapi = require('@hapi/hapi');
const steem = require('steem');

const getAccounts = function(accounts) {
  return new Promise((resolve, reject) => {
    steem.api.getAccounts(accounts, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

// params = {signingKey, username, authorizedUsername, role, weight}
const addAccountAuth = function(params) {
  return new Promise((resolve, reject) => {
    steem.broadcast.addAccountAuth(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

// params = {signingKey, username, authorizedUsername, role, weight}
const removeAccountAuth = function(params) {
  return new Promise((resolve, reject) => {
    steem.broadcast.removeAccountAuth(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

const server = Hapi.server({
  port: 8899,
});
const api_url = env.api_url ? env.api_url : '';
steem.api.setOptions({url: api_url});

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
  method: 'POST',
  path: '/auth_login',
  options: {
    cors: true
  },
  handler: (request, h) => {
    const payload = request.payload;
    const username = payload.username;
    const posting = payload.posting;
    if (!username || !posting) {
      return {
        status: false,
        msg: 'params_error',
      };
    }
    return getAccounts([username])
      .then((res) => {
        if (res === []) {
          return {
            status: false,
            msg: 'login_failed',
          };
        }
        const postingKeyAuths = res[0]['posting']['key_auths'];
        const inputPostKeyAuth = steem.auth.wifToPublic(posting);
        const result = postingKeyAuths.filter(p => p[0] === inputPostKeyAuth);
        if (result.length > 0) {
          return {
            status: true,
            msg: res,
          };
        }
        return {
          status: false,
          msg: 'login_failed',
        };
      })
      .catch((err) => {
        console.log(err);
        return {
          status: false,
          msg: err.message,
        };
      });
  },
});

server.route({
  method: 'POST',
  path: '/add_account_auth',
  options: {
    cors: true
  },
  handler: (request, h) => {
    const payload = request.payload;
    const username = payload.username;
    const authorizedUsername = payload.authorized_username;
    const signingKey = payload.active_key;
    const role = 'posting';
    const weight = 1;
    if (!username || !authorizedUsername || !signingKey) {
      return {
        status: false,
        msg: 'params_error',
      };
    }
    return addAccountAuth({signingKey, username, authorizedUsername, role, weight})
      .then((res) => {
        if (res === []) {
          return {
            status: false,
            msg: 'add_account_auth_failed',
          };
        }
        return {
          status: true,
          msg: res,
        };
      })
      .catch((err) => {
        console.log(err);
        return {
          status: false,
          msg: err.message,
        }
      });
  },
});

server.route({
  method: 'POST',
  path: '/remove_account_auth',
  options: {
    cors: true
  },
  handler: (request, h) => {
    const payload = request.payload;
    const username = payload.username;
    const authorizedUsername = payload.authorized_username;
    const signingKey = payload.active_key;
    const role = 'posting';
    const weight = 1;
    if (!username || !authorizedUsername || !signingKey) {
      return {
        status: false,
        msg: 'params_error',
      };
    }
    return removeAccountAuth({signingKey, username, authorizedUsername, role, weight})
      .then((res) => {
        if (res === []) {
          return {
            status: false,
            msg: 'remove_account_auth_failed',
          };
        }
        return {
          status: true,
          msg: res,
        };
      })
      .catch((err) => {
        console.log(err);
        return {
          status: false,
          msg: err.message,
        }
      });
  },
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