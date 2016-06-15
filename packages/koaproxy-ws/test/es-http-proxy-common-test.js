import * as common from '../lib/es-http-proxy/common'
import url from 'url'
import { expect, should as importShould } from 'chai'
const should = importShould()



describe('lib/es-http-proxy/common.js', function() {

  describe('#setupOutgoing', () => {
    const propHarness = obj => {
      return (propName, propValue) => {
        const prop = obj[propName]
        const propType = typeof propValue
        describe(`#${propName}`, () => {
          it('should exist', () => should.exist(prop))
          it(`should be a ${propType}`, () => prop.should.be.a(propType))
          it(`should equal ${propValue}`, () => prop.should.eql(propValue))
        })
      }
    }
    const { setupOutgoing } = common
    it('should exist', () => should.exist(setupOutgoing))
    it('should be a function', () => setupOutgoing.should.be.a('function'))
    let outgoing = {}
    common.setupOutgoing(outgoing,  { agent: '?'
                                    , target: { host: 'hey'
                                              , hostname: 'how'
                                              , socketPath: 'are'
                                              , port: 'you'
                                              }
                                    , headers: { 'fizz': 'bang', 'overwritten': true }
                                    , localAddress: 'local.address'
                                    , auth: 'username:pass' }, { method: 'i'
                                    , url: 'am'
                                    , headers: { 'pro': 'xy', 'overwritten': false }
                                    })
    context('outgoing', () => {
      it('should exist', () => should.exist(outgoing))
      it('should be an object', () => outgoing.should.be.an('object'))

      const { host, hostname, socketPath, port, agent, method, path, headers, localAddress, auth } = outgoing

      const testProp = propHarness(outgoing)
      testProp('host', 'hey')
      testProp('hostname', 'how')
      testProp('socketPath', 'are')
      testProp('port', 'you')
      testProp('agent', '?')
      testProp('method', 'i')
      testProp('path', 'am')
      testProp('localAddress', 'local.address')
      testProp('auth', 'username:pass')

      const testHeader = propHarness(outgoing.headers)
      testHeader('pro', 'xy')
      testHeader('fizz', 'bang')
      testHeader('overwritten', true)
    })

    it('should not override agentless upgrade header', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: undefined,
            target: { host: 'hey',
                hostname: 'how',
                socketPath: 'are',
                port: 'you' },
            headers: { 'connection': 'upgrade' } }, { method: 'i',
            url: 'am',
            headers: { 'pro': 'xy', 'overwritten': false } })
        expect(outgoing.headers.connection).to.eql('upgrade')
    })

    it('should not override agentless connection: contains upgrade', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: undefined,
            target: { host: 'hey',
                hostname: 'how',
                socketPath: 'are',
                port: 'you' },
            headers: { 'connection': 'keep-alive, upgrade' } }, { method: 'i',
            url: 'am',
            headers: { 'pro': 'xy', 'overwritten': false } })
        expect(outgoing.headers.connection).to.eql('keep-alive, upgrade')
    })

    it('should override agentless connection: contains improper upgrade', function() {
        // sanity check on upgrade regex
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: undefined,
            target: { host: 'hey',
                hostname: 'how',
                socketPath: 'are',
                port: 'you' },
            headers: { 'connection': 'keep-alive, not upgrade' } }, { method: 'i',
            url: 'am',
            headers: { 'pro': 'xy', 'overwritten': false } })
        expect(outgoing.headers.connection).to.eql('close')
    })

    it('should override agentless non-upgrade header to close', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: undefined,
            target: { host: 'hey',
                hostname: 'how',
                socketPath: 'are',
                port: 'you' },
            headers: { 'connection': 'xyz' } }, { method: 'i',
            url: 'am',
            headers: { 'pro': 'xy', 'overwritten': false } })
        expect(outgoing.headers.connection).to.eql('close')
    })

    it('should set the agent to false if none is given', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: 'http://localhost' }, { url: '/' })
        expect(outgoing.agent).to.eql(false)
    })

    it('set the port according to the protocol', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: '?',
            target: { host: 'how',
                hostname: 'are',
                socketPath: 'you',
                protocol: 'https:' } }, { method: 'i',
            url: 'am',
            headers: { pro: 'xy' } })

        expect(outgoing.host).to.eql('how')
        expect(outgoing.hostname).to.eql('are')
        expect(outgoing.socketPath).to.eql('you')
        expect(outgoing.agent).to.eql('?')

        expect(outgoing.method).to.eql('i')
        expect(outgoing.path).to.eql('am')
        expect(outgoing.headers.pro).to.eql('xy')

        expect(outgoing.port).to.eql(443)
    })

    it('should keep the original target path in the outgoing path', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { path: 'some-path' } }, { url: 'am' })

        expect(outgoing.path).to.eql('some-path/am')
    })

    it('should keep the original forward path in the outgoing path', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: {},
            forward: { path: 'some-path' } }, { url: 'am' }, 'forward')

        expect(outgoing.path).to.eql('some-path/am')
    })

    it('should properly detect https/wss protocol without the colon', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { protocol: 'https',
                host: 'whatever.com' } }, { url: '/' })

        expect(outgoing.port).to.eql(443)
    })

    it('should not prepend the target path to the outgoing path with prependPath = false', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { path: 'hellothere' },
            prependPath: false }, { url: 'hi' })

        expect(outgoing.path).to.eql('hi')
    })

    it('should properly join paths', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { path: '/forward' } }, { url: '/static/path' })

        expect(outgoing.path).to.eql('/forward/static/path')
    })

    it('should not modify the query string', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { path: '/forward' } }, { url: '/?foo=bar//&target=http://foobar.com/?a=1%26b=2&other=2' })

        expect(outgoing.path).to.eql('/forward/?foo=bar//&target=http://foobar.com/?a=1%26b=2&other=2')
    })

    //
    // This is the proper failing test case for the common.join problem
    //
    it('should correctly format the toProxy URL', function() {
        var outgoing = {}
        var google = 'https://google.com'
        common.setupOutgoing(outgoing, { target: url.parse('http://sometarget.com:80'),
            toProxy: true }, { url: google })

        expect(outgoing.path).to.eql('/' + google)
    })

    it('should not replace :\ to :\\ when no https word before', function() {
        var outgoing = {}
        var google = 'https://google.com:/join/join.js'
        common.setupOutgoing(outgoing, { target: url.parse('http://sometarget.com:80'),
            toProxy: true }, { url: google })

        expect(outgoing.path).to.eql('/' + google)
    })

    it('should not replace :\ to :\\ when no http word before', function() {
        var outgoing = {}
        var google = 'http://google.com:/join/join.js'
        common.setupOutgoing(outgoing, { target: url.parse('http://sometarget.com:80'),
            toProxy: true }, { url: google })

        expect(outgoing.path).to.eql('/' + google)
    })

    describe('when using ignorePath', function() {
        it('should ignore the path of the `req.url` passed in but use the target path', function() {
            var outgoing = {}
            var myEndpoint = 'https://whatever.com/some/crazy/path/whoooo'
            common.setupOutgoing(outgoing, { target: url.parse(myEndpoint),
                ignorePath: true }, { url: '/more/crazy/pathness' })

            expect(outgoing.path).to.eql('/some/crazy/path/whoooo')
        })

        it('and prependPath: false, it should ignore path of target and incoming request', function() {
            var outgoing = {}
            var myEndpoint = 'https://whatever.com/some/crazy/path/whoooo'
            common.setupOutgoing(outgoing, { target: url.parse(myEndpoint),
                ignorePath: true,
                prependPath: false }, { url: '/more/crazy/pathness' })

            expect(outgoing.path).to.eql('')
        })
    })

    describe('when using changeOrigin', function() {
        it('should correctly set the port to the host when it is a non-standard port using url.parse', function() {
            var outgoing = {}
            var myEndpoint = 'https://myCouch.com:6984'
            common.setupOutgoing(outgoing, { target: url.parse(myEndpoint),
                changeOrigin: true }, { url: '/' })

            expect(outgoing.headers.host).to.eql('mycouch.com:6984')
        })

        it('should correctly set the port to the host when it is a non-standard port when setting host and port manually (which ignores port)', function() {
            var outgoing = {}
            common.setupOutgoing(outgoing, { target: { protocol: 'https:',
                    host: 'mycouch.com',
                    port: 6984 },
                changeOrigin: true }, { url: '/' })
            expect(outgoing.headers.host).to.eql('mycouch.com:6984')
        })
    })

    it('should pass through https client parameters', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { agent: '?',
            target: { host: 'how',
                hostname: 'are',
                socketPath: 'you',
                protocol: 'https:',
                pfx: 'my-pfx',
                key: 'my-key',
                passphrase: 'my-passphrase',
                cert: 'my-cert',
                ca: 'my-ca',
                ciphers: 'my-ciphers',
                secureProtocol: 'my-secure-protocol' } }, { method: 'i',
            url: 'am' })

        expect(outgoing.pfx).eql('my-pfx')
        expect(outgoing.key).eql('my-key')
        expect(outgoing.passphrase).eql('my-passphrase')
        expect(outgoing.cert).eql('my-cert')
        expect(outgoing.ca).eql('my-ca')
        expect(outgoing.ciphers).eql('my-ciphers')
        expect(outgoing.secureProtocol).eql('my-secure-protocol')
    })

    // url.parse('').path => null
    context('should not pass null as last arg to #urlJoin', function() {
        var outgoing = {}
        common.setupOutgoing(outgoing, { target: { path: '' } }, { url: '' })
        it('should exist', () => should.exist(outgoing))
        it('should have path', () => outgoing.should.be.an('object').that.has.property('path').that.is.a('string'))
        it('should be empty', () => outgoing.path.should.eql(''))
      })
    })

    describe('#setupSocket', function() {
        context('should setup a socket', function() {
            const socketConfig =  { timeout: null
                                  , nodelay: false
                                  , keepalive: false
                                  }
            const stubSocket =  { setTimeout: num => { socketConfig.timeout = num }
                                , setNoDelay: bol => { socketConfig.nodelay = bol }
                                , setKeepAlive: bol => { socketConfig.keepalive = bol }
                                }
            const returnValue = common.setupSocket(stubSocket)
            it('should still have socketConfig', () => should.exist(socketConfig))
            it('should have timeout', () => socketConfig.should.be.an('object').that.has.property('timeout').that.is.a('number'))
            it('should have nodelay', () => socketConfig.should.be.an('object').that.has.property('nodelay').that.is.a('boolean'))
            it('should have keepalive', () => socketConfig.should.be.an('object').that.has.property('keepalive').that.is.a('boolean'))
            it('should have correct timeout value', () => socketConfig.timeout.should.eql(0))
            it('should have correct nodelay value', () => socketConfig.nodelay.should.eql(true))
            it('should have correct keepalive value', () => socketConfig.keepalive.should.eql(true))
        })
    })
})
