/*
* test for rule shouldUseLocal
*
*/

const ProxyServerUtil = require('./util/ProxyServerUtil.js');
const { proxyGet, generateUrl } = require('./util/HttpUtil.js');

testWrapper('http');

function testWrapper(protocol, ) {
    describe('Rule shouldUseLocalResponse should be working', () => {
        const dealLocalBody = 'handled in local response';
        let proxyServer ;
        beforeAll((done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;
            const rule = {
                shouldUseLocalResponse: function (req, reqBody) {
                    return req.url.indexOf('uselocal') > -1;
                },
                dealLocalResponse: function (req, reqBody, callback) {
                    const header = {
                        'Via-Proxy-Local': 'true'
                    }
                    callback(200, header, dealLocalBody);
                }
            };

            proxyServer = ProxyServerUtil.proxyServerWithRule(rule);

            setTimeout(function() {
                done();
            }, 2000);
        });

        afterAll(() => {
            proxyServer && proxyServer.close();
        });

        it('Should use local response if the assertion is true', done => {
            const url = generateUrl(protocol, '/test/uselocal')
            proxyGet(url, {})
                .then(res => {
                    expect(res.body).toEqual(dealLocalBody);
                    expect(res.headers['via-proxy-local']).toEqual('true');
                    done();
                }, error => {
                    console.log('error happened in proxy get for shouldUseLocal: ',error);
                    done.fail('error happened when test shouldUseLocal rule');
                })

        });
    });
}
