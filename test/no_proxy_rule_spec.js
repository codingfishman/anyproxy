const http = require('http');
const querystring = require('querystring');
const Buffer = require('buffer').Buffer;
const { proxyGet, proxyPost, directGet, directPost } = require('./util/HttpUtil.js');
const { CommonRequestHeader } = require('./data/headers.js');
const { isObjectEqual } = require('./util/CommonUtil.js');

describe('Test request without proxy rules', () => {
  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('Get should work as direct without proxy rules', (done) => {
    const getUrl = 'http://localhost:3000/test';
    const getParam = {
      param: 'nothing'
    };

    proxyGet(getUrl, getParam, CommonRequestHeader ).then((proxyRes) => {
      directGet(getUrl, getParam, CommonRequestHeader).then(directRes => {
        expect(isObjectEqual(directRes.req._headers, proxyRes.req._headers)).toBe(true);

        // console.log('direct response headers', directRes.headers);
        // console.log('proxy response headers', proxyRes.headers);
        expect(directRes.headers['content-type']).toEqual(proxyRes.headers['content-type']);
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
        expect(isObjectEqual(directRes.req._headers, proxyRes.req._headers)).toBe(true);
        expect(directRes.headers['content-type']).toEqual(proxyRes.headers['content-type']);
        expect(directRes.body).toEqual(proxyRes.body);
        done();
      }, error => {
        console.error('error in direct post:', error);
      });

    }, error => {
      console.log('error happened in proxy post,', error);
    });
  });
});
