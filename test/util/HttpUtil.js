/**
 * 用于发出http请求的工具类
 *
 */
const querystring = require('querystring');
const http = require('http');
const zlib = require('zlib');
const Buffer = require('buffer').Buffer;
const request = require('request');

const DEFAULT_HOST = 'localhost';

const DEFAULT_PROXY_OPTIONS = {
    port: 8001, // proxy的端口
    method: 'GET',
    host: 'localhost'
};

const DEFAULT_OPTIONS = {

};

function getHostFromUrl(url = '') {
    const hostReg = /^(https{0,1}:\/\/)(\w+)/;
    const match = url.match(hostReg);

    return match && match[2] ? match[2] : '';
}

function getPortFromUrl(url = '') {
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
function getPathFromUrl(url = '') {
    const pathReg = /^https{0,1}:\/\/\w+(:\d+){0,1}(.+)/;
    const match = url.match(pathReg);
    const path = match && match[3] ? match[2] : url;
    return path;
}

function proxyRequest(method = 'GET', url, params, headers = {}) {
    const promise = new Promise((resolve, reject) => {
        request(
            {
                proxy: 'http://localhost:8001',
                method: method,
                form: params,
                url: url,
                headers: headers
            },
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

/*
 * 直接请求到真实服务器，不经过代理服务器
 *
 */
function directRequest(method = 'GET', url, params, headers = {}) {
    const promise = new Promise((resolve, reject) => {
        request(
            {
                method: method,
                form: params,
                url: url,
                headers: headers
            },
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



function proxyGet(url, params, headers = {}) {
    return proxyRequest('GET', url, params, headers);
}

function proxyPost(url, params, headers = {}) {
    return proxyRequest('POST', url, params, headers);
}

function directGet(url, params, headers = {}) {
    return directRequest('GET', url, params, headers);
}

function directPost(url, params, headers = {}) {
    return directRequest('POST', url, params, headers);
}

module.exports = {
    proxyGet,
    proxyPost,
    directGet,
    directPost
};