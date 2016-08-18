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

router.get('/test/download/json', function*(next) {
    console.log('now download the json');
    yield send(this, 'test/data/test.json');
});

app
    .use(router.routes())
    .listen(DEFAULT_PORT);

console.log('Now listening on port :' + DEFAULT_PORT);