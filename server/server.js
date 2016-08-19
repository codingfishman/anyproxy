const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const koaBody = require('koa-body');
const serverStatic = require('koa-static');
const mount = require('koa-mount');
const send = require('koa-send');
const path = require('path');
const https = require('https');
const certMgr = require("../lib/certMgr");
const DEFAULT_PORT = 3000;
const HTTPS_PORT = 3001;

router.post('/test/getuser', koaBody(), function *(next) {
    this.response.set('reqbody', JSON.stringify(this.request.body));
    this.response.body = 'something in post';
});

router.get('/test', function*(next) {
    console.log('request in get:', this.request);
    this.response.body = 'something';
    this.response.__req = this.request;
    console.log('response in get:', this.response);
});

router.get('/test/download/jpg', function *(next) {
    console.log('now download the jpg');
    yield send(this, 'test/data/test.jpg');
});

router.get('/test/download/webp', function *(next) {
    console.log('now download the webp');
    yield send(this, 'test/data/test.webp');
});

router.get('/test/download/json', function *(next) {
    console.log('now download the json');
    yield send(this, 'test/data/test.json');
});

router.get('/test/download/js', function *(next) {
    console.log('now download the js');
    yield send(this, 'test/data/test.js');
});

router.get('/test/download/css', function*(next) {
    console.log('now download the css');
    yield send(this, 'test/data/test.css');
});

router.get('/test/download/ttf', function *(next) {
    console.log('now download the ttf');
    yield send(this, 'test/data/test.ttf');
});

router.get('/test/download/eot', function *(next) {
    console.log('now download the eot');
    yield send(this, 'test/data/test.eot');
});

router.get('/test/download/svg', function *(next) {
    console.log('now download the svg');
    yield send(this, 'test/data/test.svg');
});

router.get('/test/download/woff', function *(next) {
    console.log('now download the wof');
    yield send(this, 'test/data/test.woff');
});

router.get('/test/download/woff2', function *(next) {
    console.log('now download the woff2');
    yield send(this, 'test/data/test.woff2');
});

router.post('/test/upload/jpg',
    koaBody({
        multipart: true,
        formidable: {
            uploadDir: './temp',
            onFileBegin: function(name, file) {
                file.name = 'test_upload_' + Date.now() + '.jpg';
                var folder = path.dirname(file.path);
                file.path = path.join(folder, file.name);
            }
        }
    }),
    function *(next) {
        const file = this.request.body.files.file;
        this.response.body = file.path;
    }
);

app.use(router.routes());
app.listen(DEFAULT_PORT);
console.log('HTTP is now listening on port :' + DEFAULT_PORT);

certMgr.getCertificate('localhost',function(error, keyContent, crtContent){
    if(error){
        console.error('failed to create https server:', error);
    }else{
        const httpsServer = https.createServer({
            key: keyContent,
            cert: crtContent
        }, app.callback());

        httpsServer.listen(HTTPS_PORT);
        console.log('HTTPS is now listening on port :' + HTTPS_PORT);
    }
});

