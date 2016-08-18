const http = require('http');
const querystring = require('querystring');
const Buffer = require('buffer').Buffer;
const { proxyGet, proxyPost, directGet, directPost } = require('./util/HttpUtil.js');
const { CommonRequestHeader } = require('./data/headers.js');
const { isObjectEqual } = require('./util/CommonUtil.js');
const color = require('colorful');

describe('Test request without proxy rules', () => {
    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });

    it('Get should work as direct without proxy rules', (done) => {
        const getUrl = 'http://localhost:3000/test';
        const getParam = {
            param: 'nothing'
        };

        proxyGet(getUrl, getParam, CommonRequestHeader).then((proxyRes) => {
            directGet(getUrl, getParam, CommonRequestHeader).then(directRes => {

                expect(proxyRes.statusCode).toEqual(200);
                expect(isObjectEqual(directRes.req._headers, proxyRes.req._headers)).toBe(true);
                expect(directRes.req.url).toEqual(proxyRes.req.url);

                expect(directRes.headers['content-type']).toEqual(proxyRes.headers['content-type']);
                expect(proxyRes.statusCode).toEqual(directRes.statusCode);

                expect(directRes.body).toEqual(proxyRes.body);
                done();
            }, error => {
                console.error('error happend in direct get:', error);
            });

        }, error => {
            console.log('error happened in proxy get:', error);
        });
    });

    it('Post should work as direct without proxy rules', (done) => {
        const url = 'http://localhost:3000/test/getuser';
        const param = {
            param: 'postnothing'
        };

        proxyPost(url, param, CommonRequestHeader).then(proxyRes => {
            directPost(url, param, CommonRequestHeader).then(directRes => {

                expect(proxyRes.statusCode).toEqual(200);

                expect(isObjectEqual(directRes.req._headers, proxyRes.req._headers)).toBe(true);

                expect(directRes.headers['content-type']).toEqual(proxyRes.headers['content-type']);
                expect(proxyRes.statusCode).toEqual(directRes.statusCode);

                expect(directRes.body).toEqual(proxyRes.body);
                expect(directRes.headers.reqbody).toEqual(JSON.stringify(param));
                expect(directRes.req.body).toEqual(proxyRes.req.body);
                done();
            }, error => {
                console.error('error in direct post:', error);
            });

        }, error => {
            console.log('error happened in proxy post,', error);
        });
    });

    it('JPG file download without rules should be work as direct download', (done) => {
        const url = 'http://localhost:3000/test/download/jpg';
        const param = {};

        proxyGet(url, param).then(proxyRes => {
            directGet(url, param).then(directRes => {

                expect(proxyRes.statusCode).toEqual(200);
                expect(proxyRes.headers['content-type']).toEqual('image/jpeg');

                expect(proxyRes.statusCode).toEqual(directRes.statusCode);
                expect(proxyRes.headers['content-type']).toEqual(directRes.headers['content-type']);
                expect(proxyRes.body).toEqual(directRes.body);
                done();
            }, error => {
                console.error('error in direct get jpg:', error);
            });
        }, error => {
            console.error('error in proxy get jpg :', error);
        });
    });

    it('JSON file download without rules should be work as direct download', (done) => {
        const url = 'http://localhost:3000/test/download/json';
        const param = {};

        proxyGet(url, param).then(proxyRes => {
            directGet(url, param).then(directRes => {
                expect(proxyRes.statusCode).toEqual(200);
                expect(proxyRes.headers['content-type']).toEqual('application/json; charset=utf-8');

                expect(proxyRes.statusCode).toEqual(directRes.statusCode);
                expect(proxyRes.headers['content-type']).toEqual(directRes.headers['content-type']);
                expect(proxyRes.body).toEqual(directRes.body);
                done();
            }, error => {
                console.error('error in direct get json:', error);
            });
        }, error => {
            console.error('error in proxy get json :', error);
        });
    });
});