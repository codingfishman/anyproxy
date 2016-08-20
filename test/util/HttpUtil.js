/**
 * 用于发出http请求的工具类
 *
 */
const querystring = require('querystring');
const http = require('http');
const zlib = require('zlib');
const Buffer = require('buffer').Buffer;
const request = require('request');
const fs = require('fs');
// const path = require('path');
// const util = require('../../lib/util.js');

// const certFile = fs.readFileSync(path.join(util.getUserHome(),"/.anyproxy_certs/localhost.crt"));
// const certKey  = fs.readFileSync(path.join(util.getUserHome(),"/.anyproxy_certs/localhost.key"));

const DEFAULT_HOST = 'localhost';
const PROXY_HOST = 'http://localhost:8001';


const HTTP_SERVER_BASE = 'http://localhost:3000';
const HTTPS_SERVER_BASE = 'https://localhost:3001';

const DEFAULT_PROXY_OPTIONS = {
    port: 8001, // proxy的端口
    method: 'GET',
    host: 'localhost'
};

const DEFAULT_OPTIONS = {

};

function getHostFromUrl (url = '') {
    const hostReg = /^(https{0,1}:\/\/)(\w+)/;
    const match = url.match(hostReg);

    return match && match[2] ? match[2] : '';
}

function getPortFromUrl (url = '') {
    const portReg = /^https{0,1}:\/\/\w+(:(\d+)){0,1}/;
    const match = url.match(portReg);
    let port = match && match[2] ? match[2] : '';

    if (!port) {
        port = url.indexOf('https://') === 0 ? 443 : 80;
    }
    return port;
}

/**
 * 获取url中的path
 */
function getPathFromUrl (url = '') {
    const pathReg = /^https{0,1}:\/\/\w+(:\d+){0,1}(.+)/;
    const match = url.match(pathReg);
    const path = match && match[3] ? match[2] : url;
    return path;
}

function proxyRequest (method = 'GET', url, params, headers = {}) {
    return doRequest(method, url, params, headers, true);
}

/*
 * 直接请求到真实服务器，不经过代理服务器
 *
 */
function directRequest (method = 'GET', url, params, headers = {}) {
    return doRequest(method, url, params, headers);
}

function directUpload (url, filepath, headers = {}) {
    return doUpload(url, filepath, headers);
}

function proxyUpload (url, filepath, headers = {}) {
    return doUpload(url, filepath, headers, true);
}

function doRequest (method = 'GET', url, params, headers = {}, isProxy) {
    const requestData = {
        method: method,
        form: params,
        url: url,
        headers: headers,
        rejectUnauthorized: false
    };

    if (isProxy) {
        requestData.proxy = PROXY_HOST;
    }

    const promise = new Promise((resolve, reject) => {
        request(
            requestData,
            function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            }
        );
    });
    return promise;
}

function doUpload (url, filepath, headers = {}, isProxy) {
    const requestData = {
        formData: {
            param: 'something in param',
            file: fs.createReadStream(filepath)
        },
        url: url,
        headers: headers,
        json: true,
        rejectUnauthorized: false
    };

    if (isProxy) {
        requestData.proxy = PROXY_HOST;
    }
    const promise = new Promise((resolve, reject) => {
        request.post(
            requestData,
            function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            }
        );
    });
    return promise;
}

function proxyGet (url, params, headers = {}) {
    return proxyRequest('GET', url, params, headers);
}

function proxyPost (url, params, headers = {}) {
    return proxyRequest('POST', url, params, headers);
}

function directGet (url, params, headers = {}) {
    return directRequest('GET', url, params, headers);
}

function directPost (url, params, headers = {}) {
    return directRequest('POST', url, params, headers);
}

/**
* generate the final url based on protocol and path
*
*/
function generateUrl (protocol, urlPath) {
    return protocol === 'http' ? HTTP_SERVER_BASE + urlPath : HTTPS_SERVER_BASE + urlPath;
}

module.exports = {
    proxyGet,
    proxyPost,
    directGet,
    directPost,
    directUpload,
    proxyUpload,
    generateUrl
};