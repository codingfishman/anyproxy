/**
* 用于测试的工具类
*
*/
const querystring = require('querystring');
const http = require('http');
const Buffer = require('buffer').Buffer;

const DEFAULT_HOST =  'localhost';

const DEFAULT_GET_OPTIONS = {
  port: 8001,
  method: 'GET',
  host: 'localhost',
  headers: {
    Host: DEFAULT_HOST
  }
};

const DEFAULT_POST_OPTIONS = {
  port: 8001,
  method: 'POST',
  host: 'localhost',
  headers: {
    Host: DEFAULT_HOST
  }
};

function getHostFromUrl (url = '') {
  const hostReg = /^(http[s]{0,1}:\/\/)(\w+)/;
  const match = url.match(hostReg);

  return match ? match[2] : '';
}

function proxyRequest (url, params, method = 'GET') {
  const requestData = querystring.stringify(params);
  const actualPath = url + requestData;

  const host = getHostFromUrl(url);
  const requestOptions = Object.assign({}, DEFAULT_GET_OPTIONS, {
    path: url,
    method: method
  });

  requestOptions.headers.Host = host || DEFAULT_HOST;
  if (method === 'POST') {
    requestOptions.headers['Content-Length'] = Buffer.byteLength(requestData);
  }

  // 发起请求
  const promise = new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      const resData = [];
      res.on('data', (chunk) => {
        resData.push(chunk);
      });

      res.on('end', () => {
        const parsedData = Buffer.concat(resData).toString();
        res.body = parsedData;

        resolve(res);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST') {
      req.write(requestData);
    }
    req.end();
  });

  return promise;
}

function proxyGet(url, params) {
  return proxyRequest(url, params, 'GET');
}

function proxyPost(url, params) {
  return proxyRequest(url, params, 'POST');
}

module.exports = {
  proxyGet,
  proxyPost
};
