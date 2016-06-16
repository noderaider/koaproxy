import ProxyServer, { createProxyServer } from '../lib/es-proxy'
import http from 'http'
import ws from 'ws'
import io from 'socket.io'
import SSE from 'sse'
import ioClient from 'socket.io-client'
import { expect, should as importShould } from 'chai'
const should = importShould()

//
// Expose a port number generator.
// thanks to @3rd-Eden
//
let initialPort = 10024
let gen = { get port() {
              return initialPort++
            }
          }


describe('lib/es-http-proxy.js', function() {
  describe('#createProxyServer', function() {
    it.skip('should throw without options', function() {
      var error
      try {
        createProxyServer()
      } catch(e) {
        error = e
      }
      expect(error).to.be.instanceof(Error)
    })

    context('should return an object otherwise', () => {
      const target = 'http://www.google.com:80'
      const obj = createProxyServer({ target })
      it('should exist', () => should.exist(obj))
      it('should be an object', () => obj.should.be.an('object'))
      it('should have web function', () => obj.should.have.property('web').that.is.a('function'))
      it('should have ws function', () => obj.should.have.property('ws').that.is.a('function'))
      it('should have listen function', () => obj.should.have.property('listen').that.is.a('function'))
    })
  })

  describe('#createProxyServer with forward options and using web-incoming passes', function () {
    it('should pipe the request using web-incoming#stream method', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        forward: 'http://127.0.0.1:' + ports.source
      }).listen(ports.proxy)

      var source = http.createServer((req, res) => {
        /*
        should.exist(req)
        should.exist(req.method)
        */
        req.method.should.eql('GET')
        /*
        should.exist(req.headers)
        should.exist(req.headers.host)
        */
        req.headers.host.split(':')[1].should.eql(ports.proxy.toString())
        source.close()
        proxy.close()
        done()
      })

      source.listen(ports.source)
      http.request('http://127.0.0.1:' + ports.proxy, function() {}).end()
    })
  })

  describe('#createProxyServer using the web-incoming passes', function () {
    it('should proxy sse', function(done){
      var ports = { source: gen.port, proxy: gen.port }
        , proxy = createProxyServer({
        target: 'http://localhost:' + ports.source
      }), proxyServer = proxy.listen(ports.proxy)
        , source = http.createServer()
        , sse = new SSE(source, { path: '/' })

      sse.on('connection', function(client) {
        client.send('Hello over SSE')
        client.close()
      })

      source.listen(ports.source)

      var options = { hostname: 'localhost', port: ports.proxy }

      var req = http.request(options, function(res) {
        var streamData = ''
        res.on('data', function (chunk) {
          streamData += chunk.toString('utf8')
        })
        res.on('end', function (chunk) {
          //should.exist(streamData)
          streamData.should.eql(':ok\n\ndata: Hello over SSE\n\n')
          source.close()
          proxy.close()
          done()
        })
      }).end()
    })

    it('should make the request on pipe and finish it', function(done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'http://127.0.0.1:' + ports.source
      }).listen(ports.proxy)

      var source = http.createServer((req, res) => {
        should.exist(req)
        req.should.be.an('object').that.has.property('method')
        req.method.should.eql('POST')
        should.exist(req.headers)
        should.exist(req.headers['x-forwarded-for'])
        req.headers['x-forwarded-for'].should.eql('127.0.0.1')
        should.exist(req.headers.host)
        req.headers.host.split(':')[1].should.eql(ports.proxy.toString())
        source.close()
        proxy.close()
        done()
      })

      source.listen(ports.source)

      http.request( { hostname: '127.0.0.1'
                    , port: ports.proxy
                    , method: 'POST'
                    , headers: { 'x-forwarded-for': '127.0.0.1' }
                    }, function() {}).end()
    })
  })

  describe('#createProxyServer using the web-incoming passes', function () {
    it('should make the request, handle response and finish it', function(done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'http://127.0.0.1:' + ports.source
      }).listen(ports.proxy)

      var source = http.createServer(function(req, res) {
        req.method.should.eql('GET')
        req.headers.host.split(':')[1].should.eql(ports.proxy.toString())
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('Hello from ' + source.address().port)
      })

      source.listen(ports.source)

      http.request( { hostname: '127.0.0.1'
                    , port: ports.proxy
                    , method: 'GET'
                    }, function(res) {
        res.statusCode.should.eql(200)

        res.on('data', function (data) {
          data.toString().should.eql(`Hello from ${ports.source}`)
        })

        res.on('end', function () {
          source.close()
          proxy.close()
          done()
        })
      }).end()
    })
  })

  describe('#createProxyServer() method with error response', function () {
    it('should make the request and emit the error event', function(done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'http://127.0.0.1:' + ports.source
      })

      proxy.on('error', function (err) {
        expect(err).to.be.an.instanceof(Error)
        expect(err.code).to.eql('ECONNREFUSED')
        proxy.close()
        done()
      })

      proxy.listen(ports.proxy)

      http.request( { hostname: '127.0.0.1'
                    , port: ports.proxy
                    , method: 'GET'
                    }, function() {}).end()
    })
  })

  describe('#createProxyServer setting the correct timeout value', function () {
    it('should hang up the socket at the timeout', function (done) {
      this.timeout(30)
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({ target: 'http://127.0.0.1:' + ports.source
                                    , timeout: 3
                                    }).listen(ports.proxy)

      proxy.on('error', function (e) {
        should.exist(e)
        e.should.be.instanceof(Error)
        should.exist(e.code)
        e.code.should.eql('ECONNRESET')
      })

      var source = http.createServer(function(req, res) {
        setTimeout(function () {
          res.end('At this point the socket should be closed')
        }, 5)
      })

      source.listen(ports.source)

      var testReq = http.request( { hostname: '127.0.0.1'
                                  , port: ports.proxy
                                  , method: 'GET'
                                  }, function() {})

      testReq.on('error', function (e) {
        expect(e).to.be.instanceof(Error)
        expect(e.code).to.eql('ECONNRESET')
        proxy.close()
        source.close()
        done()
      })

      testReq.end()
    })
  })

  // describe('#createProxyServer using the web-incoming passes', function () {
  //   it('should emit events correclty', function(done) {
  //     var proxy = httpProxy.createProxyServer({
  //       target: 'http://127.0.0.1:8080'
  //     }),

  //     proxyServer = proxy.listen('8081'),

  //     source = http.createServer(function(req, res) {
  //       expect(req.method).to.eql('GET');
  //       expect(req.headers.host.split(':')[1]).to.eql('8081');
  //       res.writeHead(200, {'Content-Type': 'text/plain'})
  //       res.end('Hello from ' + source.address().port);
  //     }),

  //     events = [];

  //     source.listen('8080');

  //     proxy.ee.on('es-http-proxy:**', function (uno, dos, tres) {
  //       events.push(this.event);
  //     })

  //     http.request({
  //       hostname: '127.0.0.1',
  //       port: '8081',
  //       method: 'GET',
  //     }, function(res) {
  //       expect(res.statusCode).to.eql(200);

  //       res.on('data', function (data) {
  //         expect(data.toString()).to.eql('Hello from 8080');
  //       });

  //       res.on('end', function () {
  //         expect(events).to.contain('es-http-proxy:outgoing:web:begin');
  //         expect(events).to.contain('es-http-proxy:outgoing:web:end');
  //         source.close();
  //         proxyServer.close();
  //         done();
  //       });
  //     }).end();
  //   });
  // });

  describe('#createProxyServer using the ws-incoming passes', function () {
    it('should proxy the websockets stream', function (done) {
      let ports = { source: gen.port, proxy: gen.port }
      let proxy = createProxyServer({ target: `ws://127.0.0.1:${ports.source}`
                                    , ws: true
                                    })
      const proxyServer = proxy.listen(ports.proxy)
      const destiny = new ws.Server({ port: ports.source }, function () {
        var client = new ws('ws://127.0.0.1:' + ports.proxy)

        client.on('open', function () {
          client.send('hello there')
        })

        client.on('message', function (msg) {
          expect(msg).to.eql('Hello over websockets')
          client.close()
          proxyServer.close()
          destiny.close()
          done()
        })
      })

      destiny.on('connection', function (socket) {
        socket.on('message', function (msg) {
          expect(msg).to.eql('hello there')
          socket.send('Hello over websockets')
        })
      })
    })

    it('should emit error on proxy error', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({ target: `ws://127.0.0.1:${ports.source}`
                                    , ws: true
                                    })
      const proxyServer = proxy.listen(ports.proxy)
      const client = new ws('ws://127.0.0.1:' + ports.proxy)

      client.on('open', function () {
        client.send('hello there')
      })

      var count = 0
      function maybe_done () {
        count += 1
        if (count === 2) done()
      }

      client.on('error', function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.code).to.eql('ECONNRESET')
        maybe_done()
      })

      proxy.on('error', function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.code).to.eql('ECONNREFUSED')
        proxyServer.close()
        maybe_done()
      })
    })

    it('should close client socket if upstream is closed before upgrade', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      var server = http.createServer()
      server.on('upgrade', function (req, socket, head) {
        var response =  [ 'HTTP/1.1 404 Not Found'
                        , 'Content-type: text/html'
                        , ''
                        , ''
                        ]
        socket.write(response.join('\r\n'))
        socket.end()
      })
      server.listen(ports.source)

      const proxy = createProxyServer({ target: `ws://127.0.0.1:${ports.source}`
                                      , ws: true
                                      })
      const proxyServer = proxy.listen(ports.proxy)
      const client = new ws('ws://127.0.0.1:' + ports.proxy)

      client.on('open', function () {
        client.send('hello there')
      })

      client.on('error', function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.code).to.eql('ECONNRESET')
        proxyServer.close()
        done()
      })
    })

    it('should proxy a socket.io stream', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      const proxy = createProxyServer({ target: `ws://127.0.0.1:${ports.source}`
                                      , ws: true
                                      })
      const proxyServer = proxy.listen(ports.proxy)
      const server = http.createServer()
      const destiny = io.listen(server)

      function startSocketIo() {
        var client = ioClient.connect('ws://127.0.0.1:' + ports.proxy)

        client.on('connect', function () {
          client.emit('incoming', 'hello there')
        })

        client.on('outgoing', function (data) {
          expect(data).to.eql('Hello over websockets')
          proxyServer.close()
          server.close()
          done()
        })
      }
      server.listen(ports.source)
      server.on('listening', startSocketIo)

      destiny.sockets.on('connection', function (socket) {
        socket.on('incoming', function (msg) {
          expect(msg).to.eql('hello there')
          socket.emit('outgoing', 'Hello over websockets')
        })
      })
    })


    it('should emit open and close events when socket.io client connects and disconnects', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      const proxy = createProxyServer({ target: `ws://127.0.0.1:${ports.source}`
                                      , ws: true
                                      })
      const proxyServer = proxy.listen(ports.proxy)
      const server = http.createServer()
      const destiny = io.listen(server)

      function startSocketIo() {
        var client = ioClient.connect('ws://127.0.0.1:' + ports.proxy, { rejectUnauthorized: null })
        client.on('connect', function () {
          client.disconnect()
        })
      }
      var count = 0

      proxyServer.on('open', function() {
        count += 1
      })

      proxyServer.on('close', function() {
        proxyServer.close()
        server.close()
        if (count == 1) { done() }
      })

      server.listen(ports.source)
      server.on('listening', startSocketIo)
    })

    it('should pass all set-cookie headers to client', function (done) {
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'ws://127.0.0.1:' + ports.source,
        ws: true
      }),
      proxyServer = proxy.listen(ports.proxy),
      destiny = new ws.Server({ port: ports.source }, function () {
        var key = new Buffer(Math.random().toString()).toString('base64')

        var requestOptions = {
          port: ports.proxy,
          host: '127.0.0.1',
          headers: {
            'Connection': 'Upgrade',
            'Upgrade': 'websocket',
            'Host': 'ws://127.0.0.1',
            'Sec-WebSocket-Version': 13,
            'Sec-WebSocket-Key': key
          }
        }

        var req = http.request(requestOptions)

        req.on('upgrade', function (res, socket, upgradeHead) {
          expect(res.headers['set-cookie'].length).to.eql(2)
          done()
        })

        req.end()
      })

      destiny.on('headers', function (headers) {
        headers.push('Set-Cookie: test1=test1')
        headers.push('Set-Cookie: test2=test2')
      })
    })

    it('should detect a proxyReq event and modify headers', function (done) {
      var ports = { source: gen.port, proxy: gen.port },
          proxy,
          proxyServer,
          destiny

      proxy = createProxyServer({
        target: 'ws://127.0.0.1:' + ports.source,
        ws: true
      })

      proxy.on('proxyReqWs', function(proxyReq, req, socket, options, head) {
        proxyReq.setHeader('X-Special-Proxy-Header', 'foobar')
      })

      proxyServer = proxy.listen(ports.proxy)

      destiny = new ws.Server({ port: ports.source }, function () {
        var client = new ws('ws://127.0.0.1:' + ports.proxy)

        client.on('open', function () {
          client.send('hello there')
        })

        client.on('message', function (msg) {
          expect(msg).to.eql('Hello over websockets')
          client.close()
          proxyServer.close()
          destiny.close()
          done()
        })
      })

      destiny.on('connection', function (socket) {
        expect(socket.upgradeReq.headers['x-special-proxy-header']).to.eql('foobar')

        socket.on('message', function (msg) {
          expect(msg).to.eql('hello there')
          socket.send('Hello over websockets')
        })
      })
    })

    it('should forward frames with single frame payload (including on node 4.x)', function (done) {
      var payload = Array(65529).join('0')
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'ws://127.0.0.1:' + ports.source,
        ws: true
      }),
      proxyServer = proxy.listen(ports.proxy),
      destiny = new ws.Server({ port: ports.source }, function () {
        var client = new ws('ws://127.0.0.1:' + ports.proxy)

        client.on('open', function () {
          client.send(payload)
        })

        client.on('message', function (msg) {
          expect(msg).to.eql('Hello over websockets')
          client.close()
          proxyServer.close()
          destiny.close()
          done()
        })
      })

      destiny.on('connection', function (socket) {
        socket.on('message', function (msg) {
          expect(msg).to.eql(payload)
          socket.send('Hello over websockets')
        })
      })
    })

    it('should forward continuation frames with big payload (including on node 4.x)', function (done) {
      var payload = Array(65530).join('0')
      var ports = { source: gen.port, proxy: gen.port }
      var proxy = createProxyServer({
        target: 'ws://127.0.0.1:' + ports.source,
        ws: true
      }),
      proxyServer = proxy.listen(ports.proxy),
      destiny = new ws.Server({ port: ports.source }, function () {
        var client = new ws('ws://127.0.0.1:' + ports.proxy)

        client.on('open', function () {
          client.send(payload)
        })

        client.on('message', function (msg) {
          expect(msg).to.eql('Hello over websockets')
          client.close()
          proxyServer.close()
          destiny.close()
          done()
        })
      })

      destiny.on('connection', function (socket) {
        socket.on('message', function (msg) {
          expect(msg).to.eql(payload)
          socket.send('Hello over websockets')
        })
      })
    })
  })
})
