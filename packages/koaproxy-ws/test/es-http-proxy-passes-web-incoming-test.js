import * as webPasses from '../lib/es-http-proxy/passes/web-incoming'
import httpProxy from '../lib/es-http-proxy'
import { expect } from 'chai'
import http from 'http'

describe('lib/es-http-proxy/passes/web.js', function() {
  describe('#deleteLength', function() {
    it('should change `content-length` for DELETE requests', function() {
      var stubRequest = {
        method: 'DELETE',
        headers: {}
      }
      webPasses.deleteLength(stubRequest, {}, {})
      expect(stubRequest.headers['content-length']).to.eql('0')
    })

    it('should change `content-length` for OPTIONS requests', function() {
      var stubRequest = {
        method: 'OPTIONS',
        headers: {}
      }
      webPasses.deleteLength(stubRequest, {}, {})
      expect(stubRequest.headers['content-length']).to.eql('0')
    })

    it('should remove `transfer-encoding` from empty DELETE requests', function() {
      var stubRequest = {
        method: 'DELETE',
        headers: {
          'transfer-encoding': 'chunked'
        }
      }
      webPasses.deleteLength(stubRequest, {}, {})
      expect(stubRequest.headers['content-length']).to.eql('0')
      expect(stubRequest.headers).to.not.have.key('transfer-encoding')
    })
  })

  describe('#timeout', function() {
    it('should set timeout on the socket', function() {
      var done = false, stubRequest = {
        socket: {
          setTimeout: function(value) { done = value }
        }
      }

      webPasses.timeout(stubRequest, {}, { timeout: 5000 })
      expect(done).to.eql(5000)
    })
  })

  describe('#XHeaders', function () {
    const stubRequest = { connection: { remoteAddress: '192.168.1.2'
                                      , remotePort: '8080'
                                      }
                        , headers: {  host: '192.168.1.2:8080'
                                   }
                        }

    it('set the correct x-forwarded-* headers', function () {
      webPasses.XHeaders(stubRequest, {}, { xfwd: true })
      expect(stubRequest.headers['x-forwarded-for']).to.eql('192.168.1.2')
      expect(stubRequest.headers['x-forwarded-port']).to.eql('8080')
      expect(stubRequest.headers['x-forwarded-proto']).to.eql('http')
    })
  })
})

xdescribe('#createProxyServer.web() using own http server', function () {
  it('should proxy the request using the web proxy handler', function (done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080'
    })

    function requestHandler(req, res) {
      proxy.web(req, res)
    }

    var proxyServer = http.createServer(requestHandler)

    var source = http.createServer(function(req, res) {
      source.close()
      proxyServer.close()
      expect(req.method).to.eql('GET')
      expect(req.headers.host.split(':')[1]).to.eql('8081')
      done()
    })

    proxyServer.listen('8081')
    source.listen('8080')

    http.request('http://127.0.0.1:8081', function() {}).end()
  })

  it('should detect a proxyReq event and modify headers', function (done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080',
    })

    proxy.on('proxyReq', function(proxyReq, req, res, options) {
      proxyReq.setHeader('X-Special-Proxy-Header', 'foobar')
    })

    function requestHandler(req, res) {
      proxy.web(req, res)
    }

    var proxyServer = http.createServer(requestHandler)

    var source = http.createServer(function(req, res) {
      source.close()
      proxyServer.close()
      expect(req.headers['x-special-proxy-header']).to.eql('foobar')
      done()
    })

    proxyServer.listen('8081')
    source.listen('8080')

    http.request('http://127.0.0.1:8081', function() {}).end()
  })

  it('should proxy the request and handle error via callback', function(done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080'
    })

    var proxyServer = http.createServer(requestHandler)

    function requestHandler(req, res) {
      proxy.web(req, res, function (err) {
        proxyServer.close()
        expect(err).to.be.instanceof(Error)
        expect(err.code).to.eql('ECONNREFUSED')
        done()
      })
    }

    proxyServer.listen('8082')

    http.request({
      hostname: '127.0.0.1',
      port: '8082',
      method: 'GET',
    }, function() {}).end()
  })

  it('should proxy the request and handle error via event listener', function(done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080'
    })

    var proxyServer = http.createServer(requestHandler)

    function requestHandler(req, res) {
      proxy.once('error', function (err, errReq, errRes) {
        proxyServer.close()
        expect(err).to.be.instanceof(Error)
        expect(errReq).to.be.equal(req)
        expect(errRes).to.be.equal(res)
        expect(err.code).to.eql('ECONNREFUSED')
        done()
      })

      proxy.web(req, res)
    }

    proxyServer.listen('8083')

    http.request({
      hostname: '127.0.0.1',
      port: '8083',
      method: 'GET',
    }, function() {}).end()
  })

  it('should proxy the request and handle timeout error (proxyTimeout)', function(done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:45000',
      proxyTimeout: 100
    })

    require('net').createServer().listen(45000)

    var proxyServer = http.createServer(requestHandler)

    var started = new Date().getTime()
    function requestHandler(req, res) {
      proxy.once('error', function (err, errReq, errRes) {
        proxyServer.close()
        expect(err).to.be.instanceof(Error)
        expect(errReq).to.be.equal(req)
        expect(errRes).to.be.equal(res)
        expect(new Date().getTime() - started).to.be.greaterThan(99)
        expect(err.code).to.eql('ECONNRESET')
        done()
      })

      proxy.web(req, res)
    }

    proxyServer.listen('8084')

    http.request({
      hostname: '127.0.0.1',
      port: '8084',
      method: 'GET',
    }, function() {}).end()
  })

  it('should proxy the request and handle timeout error', function(done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:45001',
      timeout: 100
    })

    require('net').createServer().listen(45001)

    var proxyServer = http.createServer(requestHandler)

    var cnt = 0
    var doneOne = function() {
      cnt += 1
      if(cnt === 2) done()
    }

    var started = new Date().getTime()
    function requestHandler(req, res) {
      proxy.once('econnreset', function (err, errReq, errRes) {
        proxyServer.close()
        expect(err).to.be.instanceof(Error)
        expect(errReq).to.be.equal(req)
        expect(errRes).to.be.equal(res)
        expect(err.code).to.eql('ECONNRESET')
        doneOne()
      })

      proxy.web(req, res)
    }

    proxyServer.listen('8085')

    var req = http.request({
      hostname: '127.0.0.1',
      port: '8085',
      method: 'GET',
    }, function() {})

    req.on('error', function(err) {
      expect(err).to.be.instanceof(Error)
      expect(err.code).to.eql('ECONNRESET')
      expect(new Date().getTime() - started).to.be.greaterThan(99)
      doneOne()
    })
    req.end()
  })

  it('should proxy the request and provide a proxyRes event with the request and response parameters', function(done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080'
    })

    function requestHandler(req, res) {
      proxy.once('proxyRes', function (proxyRes, pReq, pRes) {
        source.close()
        proxyServer.close()
        expect(pReq).to.be.equal(req)
        expect(pRes).to.be.equal(res)
        done()
      })

      proxy.web(req, res)
    }

    var proxyServer = http.createServer(requestHandler)

    var source = http.createServer(function(req, res) {
      res.end('Response')
    })

    proxyServer.listen('8086')
    source.listen('8080')
    http.request('http://127.0.0.1:8086', function() {}).end()
  })

  it('should proxy the request and handle changeOrigin option', function (done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080',
      changeOrigin: true
    })

    function requestHandler(req, res) {
      proxy.web(req, res)
    }

    var proxyServer = http.createServer(requestHandler)

    var source = http.createServer(function(req, res) {
      source.close()
      proxyServer.close()
      expect(req.method).to.eql('GET')
      expect(req.headers.host.split(':')[1]).to.eql('8080')
      done()
    })

    proxyServer.listen('8081')
    source.listen('8080')

    http.request('http://127.0.0.1:8081', function() {}).end()
  })

  it('should proxy the request with the Authorization header set', function (done) {
    var proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:8080',
      auth: 'user:pass'
    })

    function requestHandler(req, res) {
      proxy.web(req, res)
    }

    var proxyServer = http.createServer(requestHandler)

    var source = http.createServer(function(req, res) {
      source.close()
      proxyServer.close()
      var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64')
      expect(req.method).to.eql('GET')
      expect(auth.toString()).to.eql('user:pass')
      done()
    })

    proxyServer.listen('8081')
    source.listen('8080')

    http.request('http://127.0.0.1:8081', function() {}).end()
  })
})