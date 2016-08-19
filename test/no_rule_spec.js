const http = require('http');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const Buffer = require('buffer').Buffer;
const { proxyGet, proxyPost, directGet, directPost, directUpload, proxyUpload } = require('./util/HttpUtil.js');
const { CommonRequestHeader } = require('./data/headers.js');
const { isObjectEqual } = require('./util/CommonUtil.js');
const color = require('colorful');
const streamEqual = require('stream-equal');

const httpServerBase = 'http://localhost:3000';
const httpsServerBase = 'https://localhost:3001';

testRequest('http');
testRequest('https');

// 封装请求的测试方法，支持https和http的测试
function testRequest(protocol = 'http') {

    function constructUrl(urlPath) {
        return protocol === 'http' ? httpServerBase + urlPath : httpsServerBase + urlPath;
    }

    describe('Test request without proxy rules', () => {
        beforeEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        });

        it('Get should work as direct without proxy rules', (done) => {
            const getUrl = constructUrl('/test');
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
                    done();
                });

            }, error => {
                console.log('error happened in proxy get:', error);
                done();
            });
        });

        it('Post should work as direct without proxy rules', (done) => {
            const url = constructUrl('/test/getuser');
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
                    done();
                });

            }, error => {
                console.log('error happened in proxy post,', error);
                done();
            });
        });


        describe('Test file download ', () => {
            const testArray = [
                {
                    url: constructUrl('/test/download/jpg'),
                    type: 'JPG',
                    contentType: 'image/jpeg'
                },
                {
                    url: constructUrl('/test/download/webp'),
                    type: 'WEBP',
                    contentType: 'image/webp'
                },
                {
                    url: constructUrl('/test/download/json'),
                    type: 'JSON',
                    contentType: 'application/json; charset=utf-8'
                },
                {
                    url: constructUrl('/test/download/css'),
                    type: 'CSS',
                    contentType: 'text/css; charset=utf-8'
                },
                {
                    url: constructUrl('/test/download/ttf'),
                    type: 'TTF',
                    contentType: 'application/x-font-ttf'
                },
                {
                    url: constructUrl('/test/download/eot'),
                    type: 'EOT',
                    contentType: 'application/vnd.ms-fontobject'
                },
                {
                    url: constructUrl('/test/download/svg'),
                    type: 'SVG',
                    contentType: 'image/svg+xml'
                },
                {
                    url: constructUrl('/test/download/woff'),
                    type: 'WOFF',
                    contentType: 'application/font-woff'
                },
                {
                    url: constructUrl('/test/download/woff2'),
                    type: 'WOFF2',
                    contentType: 'application/font-woff2'
                }
            ];

            testArray.forEach(item => {
                testFileDownload(item.url, item.type, item.contentType);
            });

            // 封装测试文件下载的测试工具类
            function testFileDownload (url, filetype, contentType) {
                const describe = `${filetype} file download without rules should be work as direct download`;
                const param = {};

                it(describe, (done) => {

                    proxyGet(url, param).then(proxyRes => {
                        directGet(url, param).then(directRes => {
                            expect(proxyRes.statusCode).toEqual(200);
                            expect(proxyRes.headers['content-type']).toEqual(contentType);

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
            }

        });

        describe('Test file upload', () => {
            it('normal upload should be working', (done) => {
                const url = constructUrl('/test/upload/jpg');
                const filePath = path.resolve('./test/data/test.jpg');

                proxyUpload(url, filePath)
                    .then(proxyRes => {
                        directUpload(url, filePath)
                            .then((directRes) => {
                                expect(proxyRes.statusCode).toEqual(200);

                                expect(proxyRes.statusCode).toEqual(directRes.statusCode);

                                const directUploadedStream = fs.createReadStream(directRes.body);
                                const proxyUploadedStream = fs.createReadStream(proxyRes.body);
                                const localFileStream = fs.createReadStream(filePath);
                                streamEqual(directUploadedStream, localFileStream)
                                    .then(isLocalEqual => {
                                        expect(isLocalEqual).toBe(true);
                                        streamEqual(directUploadedStream, proxyUploadedStream)
                                            .then(isUploadedEqual => {
                                                expect(isUploadedEqual).toBe(true);
                                                done();
                                            }, error => {
                                                console.error('error in comparing directUpload with proxy:\n',error);
                                                done();
                                            });
                                        done();
                                    }, error => {
                                        console.error('error in comparing directUpload with local:\n',error);
                                        done();
                                    });
                            }, error => {
                                console.error('error in direct upload:', error);
                                done();
                            });
                    }, error => {
                        console.error('error in proxy upload:', error);
                        done();
                    });
            });
        });
    });
}
