const koa = require('koa');
const app = koa();
const router = require('koa-router')();
const DEFAULT_PORT = 3000;

router.post('/test/getuser', function *(next) {
  console.log('request :', this.request);
  this.response.req = this.request;
  this.response.body = 'something in post';
  console.log('response :', this.response);
});

router.get('/test', function *(next) {
  console.log('request in get:', this.request);
  this.response.body = 'something';
  this.response.req = this.request;
});

app
  .use(router.routes())
  .listen(DEFAULT_PORT);

console.log('Now listening on port :' + DEFAULT_PORT);

