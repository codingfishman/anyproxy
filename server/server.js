const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const koaBody = require('koa-body')();
const serverStatic = require('koa-static');
const mount = require('koa-mount');
const send = require('koa-send');
const path = require('path');
const DEFAULT_PORT = 3000;

router.post('/test/getuser', koaBody, function*(next) {
    this.response.set('reqbody', JSON.stringify(this.request.body));
    this.response.body = 'something in post';
});

router.get('/test', function*(next) {
    console.log('request in get:', this.request);
    this.response.body = 'something';
    this.response.__req = this.request;
    console.log('response in get:', this.response);
});

router.get('/test/download/jpg', function*(next) {
    console.log('now download the jpg');
    yield send(this, 'test/data/test.jpg');
});

router.get('/test/download/webp', function*(next) {
    console.log('now download the webp');
    yield send(this, 'test/data/test.webp');
});

router.get('/test/download/json', function*(next) {
    console.log('now download the json');
    yield send(this, 'test/data/test.json');
});

router.get('/test/download/js', function*(next) {
    console.log('now download the js');
    yield send(this, 'test/data/test.js');
});

router.get('/test/download/css', function*(next) {
    console.log('now download the css');
    yield send(this, 'test/data/test.css');
});

router.get('/test/download/ttf', function*(next) {
    console.log('now download the ttf');
    yield send(this, 'test/data/test.ttf');
});

router.get('/test/download/eot', function*(next) {
    console.log('now download the eot');
    yield send(this, 'test/data/test.eot');
});

router.get('/test/download/svg', function*(next) {
    console.log('now download the svg');
    yield send(this, 'test/data/test.svg');
});

router.get('/test/download/woff', function*(next) {
    console.log('now download the wof');
    yield send(this, 'test/data/test.woff');
});

router.get('/test/download/woff2', function*(next) {
    console.log('now download the woff2');
    yield send(this, 'test/data/test.woff2');
});

app
    .use(router.routes())
    .listen(DEFAULT_PORT);

console.log('Now listening on port :' + DEFAULT_PORT);