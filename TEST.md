# TOC
   - [lib/es-http-proxy/common.js](#libes-http-proxycommonjs)
     - [#setupOutgoing](#libes-http-proxycommonjs-setupoutgoing)
       - [outgoing](#libes-http-proxycommonjs-setupoutgoing-outgoing)
         - [#host](#libes-http-proxycommonjs-setupoutgoing-outgoing-host)
         - [#hostname](#libes-http-proxycommonjs-setupoutgoing-outgoing-hostname)
         - [#socketPath](#libes-http-proxycommonjs-setupoutgoing-outgoing-socketpath)
         - [#port](#libes-http-proxycommonjs-setupoutgoing-outgoing-port)
         - [#agent](#libes-http-proxycommonjs-setupoutgoing-outgoing-agent)
         - [#method](#libes-http-proxycommonjs-setupoutgoing-outgoing-method)
         - [#path](#libes-http-proxycommonjs-setupoutgoing-outgoing-path)
         - [#localAddress](#libes-http-proxycommonjs-setupoutgoing-outgoing-localaddress)
         - [#auth](#libes-http-proxycommonjs-setupoutgoing-outgoing-auth)
         - [#pro](#libes-http-proxycommonjs-setupoutgoing-outgoing-pro)
         - [#fizz](#libes-http-proxycommonjs-setupoutgoing-outgoing-fizz)
         - [#overwritten](#libes-http-proxycommonjs-setupoutgoing-outgoing-overwritten)
       - [when using ignorePath](#libes-http-proxycommonjs-setupoutgoing-when-using-ignorepath)
       - [when using changeOrigin](#libes-http-proxycommonjs-setupoutgoing-when-using-changeorigin)
       - [should not pass null as last arg to #urlJoin](#libes-http-proxycommonjs-setupoutgoing-should-not-pass-null-as-last-arg-to-urljoin)
     - [#setupSocket](#libes-http-proxycommonjs-setupsocket)
       - [should setup a socket](#libes-http-proxycommonjs-setupsocket-should-setup-a-socket)
   - [lib/es-http-proxy/passes/web.js](#libes-http-proxypasseswebjs)
     - [#deleteLength](#libes-http-proxypasseswebjs-deletelength)
     - [#timeout](#libes-http-proxypasseswebjs-timeout)
     - [#XHeaders](#libes-http-proxypasseswebjs-xheaders)
   - [#createProxyServer.web() using own http server](#createproxyserverweb-using-own-http-server)
   - [lib/es-http-proxy/passes/web-outgoing.js](#libes-http-proxypassesweb-outgoingjs)
     - [#setRedirectHostRewrite](#libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite)
       - [rewrites location host with hostRewrite](#libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-host-with-hostrewrite)
       - [rewrites location host with autoRewrite](#libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-host-with-autorewrite)
       - [rewrites location protocol with protocolRewrite](#libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-protocol-with-protocolrewrite)
     - [#setConnection](#libes-http-proxypassesweb-outgoingjs-setconnection)
     - [#writeStatusCode](#libes-http-proxypassesweb-outgoingjs-writestatuscode)
     - [#writeHeaders](#libes-http-proxypassesweb-outgoingjs-writeheaders)
     - [#removeChunked](#libes-http-proxypassesweb-outgoingjs-removechunked)
   - [lib/es-http-proxy/passes/ws-incoming.js](#libes-http-proxypassesws-incomingjs)
     - [#checkMethodAndHeader](#libes-http-proxypassesws-incomingjs-checkmethodandheader)
     - [#XHeaders](#libes-http-proxypassesws-incomingjs-xheaders)
   - [ProxyServer](#proxyserver)
   - [lib/es-http-proxy.js](#libes-http-proxyjs)
     - [#createProxyServer](#libes-http-proxyjs-createproxyserver)
       - [should return an object otherwise](#libes-http-proxyjs-createproxyserver-should-return-an-object-otherwise)
     - [#createProxyServer with forward options and using web-incoming passes](#libes-http-proxyjs-createproxyserver-with-forward-options-and-using-web-incoming-passes)
     - [#createProxyServer using the web-incoming passes](#libes-http-proxyjs-createproxyserver-using-the-web-incoming-passes)
     - [#createProxyServer() method with error response](#libes-http-proxyjs-createproxyserver-method-with-error-response)
     - [#createProxyServer setting the correct timeout value](#libes-http-proxyjs-createproxyserver-setting-the-correct-timeout-value)
     - [#createProxyServer using the ws-incoming passes](#libes-http-proxyjs-createproxyserver-using-the-ws-incoming-passes)
     - [HTTPS #createProxyServer](#libes-http-proxyjs-https-createproxyserver)
       - [HTTPS to HTTP](#libes-http-proxyjs-https-createproxyserver-https-to-http)
       - [HTTP to HTTPS](#libes-http-proxyjs-https-createproxyserver-http-to-https)
       - [HTTPS to HTTPS](#libes-http-proxyjs-https-createproxyserver-https-to-https)
       - [HTTPS not allow SSL self signed](#libes-http-proxyjs-https-createproxyserver-https-not-allow-ssl-self-signed)
       - [HTTPS to HTTP using own server](#libes-http-proxyjs-https-createproxyserver-https-to-http-using-own-server)
   - [es-http-proxy examples](#es-http-proxy-examples)
     - [Before testing examples](#es-http-proxy-examples-before-testing-examples)
     - [Requiring all the examples](#es-http-proxy-examples-requiring-all-the-examples)
<a name=""></a>
 
<a name="libes-http-proxycommonjs"></a>
# lib/es-http-proxy/common.js
<a name="libes-http-proxycommonjs-setupoutgoing"></a>
## #setupOutgoing
should exist.

```js
return should.exist(setupOutgoing);
```

should be a function.

```js
return setupOutgoing.should.be.a('function');
```

should not override agentless upgrade header.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { agent: undefined,
    target: { host: 'hey',
        hostname: 'how',
        socketPath: 'are',
        port: 'you' },
    headers: { 'connection': 'upgrade' } }, { method: 'i',
    url: 'am',
    headers: { 'pro': 'xy', 'overwritten': false } });
(0, _chai.expect)(outgoing.headers.connection).to.eql('upgrade');
```

should not override agentless connection: contains upgrade.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { agent: undefined,
    target: { host: 'hey',
        hostname: 'how',
        socketPath: 'are',
        port: 'you' },
    headers: { 'connection': 'keep-alive, upgrade' } }, { method: 'i',
    url: 'am',
    headers: { 'pro': 'xy', 'overwritten': false } });
(0, _chai.expect)(outgoing.headers.connection).to.eql('keep-alive, upgrade');
```

should override agentless connection: contains improper upgrade.

```js
// sanity check on upgrade regex
var outgoing = {};
common.setupOutgoing(outgoing, { agent: undefined,
    target: { host: 'hey',
        hostname: 'how',
        socketPath: 'are',
        port: 'you' },
    headers: { 'connection': 'keep-alive, not upgrade' } }, { method: 'i',
    url: 'am',
    headers: { 'pro': 'xy', 'overwritten': false } });
(0, _chai.expect)(outgoing.headers.connection).to.eql('close');
```

should override agentless non-upgrade header to close.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { agent: undefined,
    target: { host: 'hey',
        hostname: 'how',
        socketPath: 'are',
        port: 'you' },
    headers: { 'connection': 'xyz' } }, { method: 'i',
    url: 'am',
    headers: { 'pro': 'xy', 'overwritten': false } });
(0, _chai.expect)(outgoing.headers.connection).to.eql('close');
```

should set the agent to false if none is given.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: 'http://localhost' }, { url: '/' });
(0, _chai.expect)(outgoing.agent).to.eql(false);
```

set the port according to the protocol.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { agent: '?',
    target: { host: 'how',
        hostname: 'are',
        socketPath: 'you',
        protocol: 'https:' } }, { method: 'i',
    url: 'am',
    headers: { pro: 'xy' } });
(0, _chai.expect)(outgoing.host).to.eql('how');
(0, _chai.expect)(outgoing.hostname).to.eql('are');
(0, _chai.expect)(outgoing.socketPath).to.eql('you');
(0, _chai.expect)(outgoing.agent).to.eql('?');
(0, _chai.expect)(outgoing.method).to.eql('i');
(0, _chai.expect)(outgoing.path).to.eql('am');
(0, _chai.expect)(outgoing.headers.pro).to.eql('xy');
(0, _chai.expect)(outgoing.port).to.eql(443);
```

should keep the original target path in the outgoing path.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { path: 'some-path' } }, { url: 'am' });
(0, _chai.expect)(outgoing.path).to.eql('some-path/am');
```

should keep the original forward path in the outgoing path.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: {},
    forward: { path: 'some-path' } }, { url: 'am' }, 'forward');
(0, _chai.expect)(outgoing.path).to.eql('some-path/am');
```

should properly detect https/wss protocol without the colon.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { protocol: 'https',
        host: 'whatever.com' } }, { url: '/' });
(0, _chai.expect)(outgoing.port).to.eql(443);
```

should not prepend the target path to the outgoing path with prependPath = false.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { path: 'hellothere' },
    prependPath: false }, { url: 'hi' });
(0, _chai.expect)(outgoing.path).to.eql('hi');
```

should properly join paths.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { path: '/forward' } }, { url: '/static/path' });
(0, _chai.expect)(outgoing.path).to.eql('/forward/static/path');
```

should not modify the query string.

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { path: '/forward' } }, { url: '/?foo=bar//&target=http://foobar.com/?a=1%26b=2&other=2' });
(0, _chai.expect)(outgoing.path).to.eql('/forward/?foo=bar//&target=http://foobar.com/?a=1%26b=2&other=2');
```

should correctly format the toProxy URL.

```js
var outgoing = {};
var google = 'https://google.com';
common.setupOutgoing(outgoing, { target: _url2.default.parse('http://sometarget.com:80'),
    toProxy: true }, { url: google });
(0, _chai.expect)(outgoing.path).to.eql('/' + google);
```

should not replace : to :\ when no https word before.

```js
var outgoing = {};
var google = 'https://google.com:/join/join.js';
common.setupOutgoing(outgoing, { target: _url2.default.parse('http://sometarget.com:80'),
    toProxy: true }, { url: google });
(0, _chai.expect)(outgoing.path).to.eql('/' + google);
```

should not replace : to :\ when no http word before.

```js
var outgoing = {};
var google = 'http://google.com:/join/join.js';
common.setupOutgoing(outgoing, { target: _url2.default.parse('http://sometarget.com:80'),
    toProxy: true }, { url: google });
(0, _chai.expect)(outgoing.path).to.eql('/' + google);
```

should pass through https client parameters.

```js
var outgoing = {};
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
    url: 'am' });
(0, _chai.expect)(outgoing.pfx).eql('my-pfx');
(0, _chai.expect)(outgoing.key).eql('my-key');
(0, _chai.expect)(outgoing.passphrase).eql('my-passphrase');
(0, _chai.expect)(outgoing.cert).eql('my-cert');
(0, _chai.expect)(outgoing.ca).eql('my-ca');
(0, _chai.expect)(outgoing.ciphers).eql('my-ciphers');
(0, _chai.expect)(outgoing.secureProtocol).eql('my-secure-protocol');
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing"></a>
### outgoing
should exist.

```js
return should.exist(outgoing);
```

should be an object.

```js
return outgoing.should.be.an('object');
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-host"></a>
#### #host
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal hey.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-hostname"></a>
#### #hostname
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal how.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-socketpath"></a>
#### #socketPath
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal are.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-port"></a>
#### #port
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal you.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-agent"></a>
#### #agent
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal ?.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-method"></a>
#### #method
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal i.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-path"></a>
#### #path
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal am.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-localaddress"></a>
#### #localAddress
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal local.address.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-auth"></a>
#### #auth
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal username:pass.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-pro"></a>
#### #pro
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal xy.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-fizz"></a>
#### #fizz
should exist.

```js
return should.exist(prop);
```

should be a string.

```js
return prop.should.be.a(propType);
```

should equal bang.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-outgoing-overwritten"></a>
#### #overwritten
should exist.

```js
return should.exist(prop);
```

should be a boolean.

```js
return prop.should.be.a(propType);
```

should equal true.

```js
return prop.should.eql(propValue);
```

<a name="libes-http-proxycommonjs-setupoutgoing-when-using-ignorepath"></a>
### when using ignorePath
should ignore the path of the `req.url` passed in but use the target path.

```js
var outgoing = {};
var myEndpoint = 'https://whatever.com/some/crazy/path/whoooo';
common.setupOutgoing(outgoing, { target: _url2.default.parse(myEndpoint),
    ignorePath: true }, { url: '/more/crazy/pathness' });
(0, _chai.expect)(outgoing.path).to.eql('/some/crazy/path/whoooo');
```

and prependPath: false, it should ignore path of target and incoming request.

```js
var outgoing = {};
var myEndpoint = 'https://whatever.com/some/crazy/path/whoooo';
common.setupOutgoing(outgoing, { target: _url2.default.parse(myEndpoint),
    ignorePath: true,
    prependPath: false }, { url: '/more/crazy/pathness' });
(0, _chai.expect)(outgoing.path).to.eql('');
```

<a name="libes-http-proxycommonjs-setupoutgoing-when-using-changeorigin"></a>
### when using changeOrigin
should correctly set the port to the host when it is a non-standard port using url.parse.

```js
var outgoing = {};
var myEndpoint = 'https://myCouch.com:6984';
common.setupOutgoing(outgoing, { target: _url2.default.parse(myEndpoint),
    changeOrigin: true }, { url: '/' });
(0, _chai.expect)(outgoing.headers.host).to.eql('mycouch.com:6984');
```

should correctly set the port to the host when it is a non-standard port when setting host and port manually (which ignores port).

```js
var outgoing = {};
common.setupOutgoing(outgoing, { target: { protocol: 'https:',
        host: 'mycouch.com',
        port: 6984 },
    changeOrigin: true }, { url: '/' });
(0, _chai.expect)(outgoing.headers.host).to.eql('mycouch.com:6984');
```

<a name="libes-http-proxycommonjs-setupoutgoing-should-not-pass-null-as-last-arg-to-urljoin"></a>
### should not pass null as last arg to #urlJoin
should exist.

```js
return should.exist(outgoing);
```

should have path.

```js
return outgoing.should.be.an('object').that.has.property('path').that.is.a('string');
```

should be empty.

```js
return outgoing.path.should.eql('');
```

<a name="libes-http-proxycommonjs-setupsocket"></a>
## #setupSocket
<a name="libes-http-proxycommonjs-setupsocket-should-setup-a-socket"></a>
### should setup a socket
should still have socketConfig.

```js
return should.exist(socketConfig);
```

should have timeout.

```js
return socketConfig.should.be.an('object').that.has.property('timeout').that.is.a('number');
```

should have nodelay.

```js
return socketConfig.should.be.an('object').that.has.property('nodelay').that.is.a('boolean');
```

should have keepalive.

```js
return socketConfig.should.be.an('object').that.has.property('keepalive').that.is.a('boolean');
```

should have correct timeout value.

```js
return socketConfig.timeout.should.eql(0);
```

should have correct nodelay value.

```js
return socketConfig.nodelay.should.eql(true);
```

should have correct keepalive value.

```js
return socketConfig.keepalive.should.eql(true);
```

<a name="libes-http-proxypasseswebjs"></a>
# lib/es-http-proxy/passes/web.js
<a name="libes-http-proxypasseswebjs-deletelength"></a>
## #deleteLength
should change `content-length` for DELETE requests.

```js
var stubRequest = {
  method: 'DELETE',
  headers: {}
};
webPasses.deleteLength(stubRequest, {}, {});
(0, _chai.expect)(stubRequest.headers['content-length']).to.eql('0');
```

should change `content-length` for OPTIONS requests.

```js
var stubRequest = {
  method: 'OPTIONS',
  headers: {}
};
webPasses.deleteLength(stubRequest, {}, {});
(0, _chai.expect)(stubRequest.headers['content-length']).to.eql('0');
```

should remove `transfer-encoding` from empty DELETE requests.

```js
var stubRequest = {
  method: 'DELETE',
  headers: {
    'transfer-encoding': 'chunked'
  }
};
webPasses.deleteLength(stubRequest, {}, {});
(0, _chai.expect)(stubRequest.headers['content-length']).to.eql('0');
(0, _chai.expect)(stubRequest.headers).to.not.have.key('transfer-encoding');
```

<a name="libes-http-proxypasseswebjs-timeout"></a>
## #timeout
should set timeout on the socket.

```js
var done = false,
    stubRequest = {
  socket: {
    setTimeout: function setTimeout(value) {
      done = value;
    }
  }
};
webPasses.timeout(stubRequest, {}, { timeout: 5000 });
(0, _chai.expect)(done).to.eql(5000);
```

<a name="libes-http-proxypasseswebjs-xheaders"></a>
## #XHeaders
set the correct x-forwarded-* headers.

```js
webPasses.XHeaders(stubRequest, {}, { xfwd: true });
(0, _chai.expect)(stubRequest.headers['x-forwarded-for']).to.eql('192.168.1.2');
(0, _chai.expect)(stubRequest.headers['x-forwarded-port']).to.eql('8080');
(0, _chai.expect)(stubRequest.headers['x-forwarded-proto']).to.eql('http');
```

<a name="createproxyserverweb-using-own-http-server"></a>
# #createProxyServer.web() using own http server
<a name="libes-http-proxypassesweb-outgoingjs"></a>
# lib/es-http-proxy/passes/web-outgoing.js
<a name="libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite"></a>
## #setRedirectHostRewrite
<a name="libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-host-with-hostrewrite"></a>
### rewrites location host with hostRewrite
on 301.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-manual.com/');
```

on 302.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-manual.com/');
```

on 307.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-manual.com/');
```

on 308.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-manual.com/');
```

not on 200.

```js
this.proxyRes.statusCode = 200;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

not when hostRewrite is unset.

```js
delete this.options.hostRewrite;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

takes precedence over autoRewrite.

```js
this.options.autoRewrite = true;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-manual.com/');
```

not when the redirected location does not match target host.

```js
this.proxyRes.statusCode = 302;
this.proxyRes.headers.location = 'http://some-other/';
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://some-other/');
```

not when the redirected location does not match target port.

```js
this.proxyRes.statusCode = 302;
this.proxyRes.headers.location = 'http://backend.com:8080/';
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com:8080/');
```

<a name="libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-host-with-autorewrite"></a>
### rewrites location host with autoRewrite
on 301.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-auto.com/');
```

on 302.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-auto.com/');
```

on 307.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-auto.com/');
```

on 308.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://ext-auto.com/');
```

not on 200.

```js
this.proxyRes.statusCode = 200;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

not when autoRewrite is unset.

```js
delete this.options.autoRewrite;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

not when the redirected location does not match target host.

```js
this.proxyRes.statusCode = 302;
this.proxyRes.headers.location = 'http://some-other/';
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://some-other/');
```

not when the redirected location does not match target port.

```js
this.proxyRes.statusCode = 302;
this.proxyRes.headers.location = 'http://backend.com:8080/';
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com:8080/');
```

<a name="libes-http-proxypassesweb-outgoingjs-setredirecthostrewrite-rewrites-location-protocol-with-protocolrewrite"></a>
### rewrites location protocol with protocolRewrite
on 301.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://backend.com/');
```

on 302.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://backend.com/');
```

on 307.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://backend.com/');
```

on 308.

```js
this.proxyRes.statusCode = code;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://backend.com/');
```

not on 200.

```js
this.proxyRes.statusCode = 200;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

not when protocolRewrite is unset.

```js
delete this.options.protocolRewrite;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('http://backend.com/');
```

works together with hostRewrite.

```js
this.options.hostRewrite = 'ext-manual.com';
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://ext-manual.com/');
```

works together with autoRewrite.

```js
this.options.autoRewrite = true;
httpProxy.setRedirectHostRewrite(this.req, {}, this.proxyRes, this.options);
(0, _chai.expect)(this.proxyRes.headers.location).to.eql('https://ext-auto.com/');
```

<a name="libes-http-proxypassesweb-outgoingjs-setconnection"></a>
## #setConnection
set the right connection with 1.0 - `close`.

```js
var proxyRes = { headers: {} };
httpProxy.setConnection({ httpVersion: '1.0', headers: { connection: null } }, {}, proxyRes);
(0, _chai.expect)(proxyRes.headers.connection).to.eql('close');
```

set the right connection with 1.0 - req.connection.

```js
var proxyRes = { headers: {} };
httpProxy.setConnection({ httpVersion: '1.0', headers: { connection: 'hey' } }, {}, proxyRes);
(0, _chai.expect)(proxyRes.headers.connection).to.eql('hey');
```

set the right connection - req.connection.

```js
var proxyRes = { headers: {} };
httpProxy.setConnection({ httpVersion: null, headers: { connection: 'hola' } }, {}, proxyRes);
(0, _chai.expect)(proxyRes.headers.connection).to.eql('hola');
```

set the right connection - `keep-alive`.

```js
var proxyRes = { headers: {} };
httpProxy.setConnection({ httpVersion: null, headers: { connection: null } }, {}, proxyRes);
(0, _chai.expect)(proxyRes.headers.connection).to.eql('keep-alive');
```

<a name="libes-http-proxypassesweb-outgoingjs-writestatuscode"></a>
## #writeStatusCode
should write status code.

```js
var res = { writeHead: function writeHead(n) {
    (0, _chai.expect)(n).to.eql(200);
  } };
httpProxy.writeStatusCode({}, res, { statusCode: 200 });
```

<a name="libes-http-proxypassesws-incomingjs"></a>
# lib/es-http-proxy/passes/ws-incoming.js
<a name="libes-http-proxypassesws-incomingjs-checkmethodandheader"></a>
## #checkMethodAndHeader
should drop non-GET connections.

```js
var destroyCalled = false,
    stubRequest = { method: 'DELETE', headers: {} },
    stubSocket = { destroy: function destroy() {
    // Simulate Socket.destroy() method when call
    destroyCalled = true;
  } };
var returnValue = httpProxy.checkMethodAndHeader(stubRequest, stubSocket);
(0, _chai.expect)(returnValue).to.eql(true);
(0, _chai.expect)(destroyCalled).to.eql(true);
```

should drop connections when no upgrade header.

```js
var destroyCalled = false,
    stubRequest = { method: 'GET',
  headers: {} },
    stubSocket = { destroy: function destroy() {
    // Simulate Socket.destroy() method when call
    destroyCalled = true;
  } };
var returnValue = httpProxy.checkMethodAndHeader(stubRequest, stubSocket);
(0, _chai.expect)(returnValue).to.eql(true);
(0, _chai.expect)(destroyCalled).to.eql(true);
```

should drop connections when upgrade header is different of `websocket`.

```js
var destroyCalled = false,
    stubRequest = { method: 'GET',
  headers: { upgrade: 'anotherprotocol' } },
    stubSocket = { destroy: function destroy() {
    // Simulate Socket.destroy() method when call
    destroyCalled = true;
  } };
var returnValue = httpProxy.checkMethodAndHeader(stubRequest, stubSocket);
(0, _chai.expect)(returnValue).to.eql(true);
(0, _chai.expect)(destroyCalled).to.eql(true);
```

should return nothing when all is ok.

```js
var destroyCalled = false,
    stubRequest = { method: 'GET',
  headers: { upgrade: 'websocket' } },
    stubSocket = { destroy: function destroy() {
    // Simulate Socket.destroy() method when call
    destroyCalled = true;
  } };
var returnValue = httpProxy.checkMethodAndHeader(stubRequest, stubSocket);
(0, _chai.expect)(returnValue).to.eql(undefined);
(0, _chai.expect)(destroyCalled).to.eql(false);
```

<a name="libes-http-proxypassesws-incomingjs-xheaders"></a>
## #XHeaders
return if no forward request.

```js
var returnValue = httpProxy.XHeaders({}, {}, {});
(0, _chai.expect)(returnValue).to.be.undefined;
```

set the correct x-forwarded-* headers from req.connection.

```js
var stubRequest = { connection: { remoteAddress: '192.168.1.2',
    remotePort: '8080' },
  headers: { host: '192.168.1.2:8080' } };
httpProxy.XHeaders(stubRequest, {}, { xfwd: true });
(0, _chai.expect)(stubRequest.headers['x-forwarded-for']).to.eql('192.168.1.2');
(0, _chai.expect)(stubRequest.headers['x-forwarded-port']).to.eql('8080');
(0, _chai.expect)(stubRequest.headers['x-forwarded-proto']).to.eql('ws');
```

set the correct x-forwarded-* headers from req.socket.

```js
var stubRequest = { socket: { remoteAddress: '192.168.1.3',
    remotePort: '8181' },
  connection: { pair: true },
  headers: { host: '192.168.1.3:8181' } };
httpProxy.XHeaders(stubRequest, {}, { xfwd: true });
(0, _chai.expect)(stubRequest.headers['x-forwarded-for']).to.eql('192.168.1.3');
(0, _chai.expect)(stubRequest.headers['x-forwarded-port']).to.eql('8181');
(0, _chai.expect)(stubRequest.headers['x-forwarded-proto']).to.eql('wss');
```

<a name="proxyserver"></a>
# ProxyServer
should exist.

```js
return should.exist(_ProxyServer2.default);
```

should be a function.

```js
return _ProxyServer2.default.should.be.a('function');
```

should create instanceof EE3.

```js
return new _ProxyServer2.default().should.be.instanceof(_eventemitter2.default);
```

<a name="libes-http-proxyjs"></a>
# lib/es-http-proxy.js
<a name="libes-http-proxyjs-createproxyserver"></a>
## #createProxyServer
<a name="libes-http-proxyjs-createproxyserver-should-return-an-object-otherwise"></a>
### should return an object otherwise
should exist.

```js
return should.exist(obj);
```

should be an object.

```js
return obj.should.be.an('object');
```

should have web function.

```js
return obj.should.have.property('web').that.is.a('function');
```

should have ws function.

```js
return obj.should.have.property('ws').that.is.a('function');
```

should have listen function.

```js
return obj.should.have.property('listen').that.is.a('function');
```

<a name="libes-http-proxyjs-createproxyserver-with-forward-options-and-using-web-incoming-passes"></a>
## #createProxyServer with forward options and using web-incoming passes
should pipe the request using web-incoming#stream method.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  forward: 'http://127.0.0.1:' + ports.source
}).listen(ports.proxy);
var source = _http2.default.createServer(function (req, res) {
  /*
  should.exist(req)
  should.exist(req.method)
  */
  req.method.should.eql('GET');
  /*
  should.exist(req.headers)
  should.exist(req.headers.host)
  */
  req.headers.host.split(':')[1].should.eql(ports.proxy.toString());
  source.close();
  proxy.close();
  done();
});
source.listen(ports.source);
_http2.default.request('http://127.0.0.1:' + ports.proxy, function () {}).end();
```

<a name="libes-http-proxyjs-createproxyserver-using-the-web-incoming-passes"></a>
## #createProxyServer using the web-incoming passes
should proxy sse.

```js
var ports = { source: gen.port, proxy: gen.port },
    proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'http://localhost:' + ports.source
}),
    proxyServer = proxy.listen(ports.proxy),
    source = _http2.default.createServer(),
    sse = new _sse2.default(source, { path: '/' });
sse.on('connection', function (client) {
  client.send('Hello over SSE');
  client.close();
});
source.listen(ports.source);
var options = { hostname: 'localhost', port: ports.proxy };
var req = _http2.default.request(options, function (res) {
  var streamData = '';
  res.on('data', function (chunk) {
    streamData += chunk.toString('utf8');
  });
  res.on('end', function (chunk) {
    //should.exist(streamData)
    streamData.should.eql(':ok\n\ndata: Hello over SSE\n\n');
    source.close();
    proxy.close();
    done();
  });
}).end();
```

should make the request on pipe and finish it.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'http://127.0.0.1:' + ports.source
}).listen(ports.proxy);
var source = _http2.default.createServer(function (req, res) {
  should.exist(req);
  req.should.be.an('object').that.has.property('method');
  req.method.should.eql('POST');
  should.exist(req.headers);
  should.exist(req.headers['x-forwarded-for']);
  req.headers['x-forwarded-for'].should.eql('127.0.0.1');
  should.exist(req.headers.host);
  req.headers.host.split(':')[1].should.eql(ports.proxy.toString());
  source.close();
  proxy.close();
  done();
});
source.listen(ports.source);
_http2.default.request({ hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'POST',
  headers: { 'x-forwarded-for': '127.0.0.1' }
}, function () {}).end();
```

<a name="libes-http-proxyjs-createproxyserver-using-the-web-incoming-passes"></a>
## #createProxyServer using the web-incoming passes
should make the request, handle response and finish it.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'http://127.0.0.1:' + ports.source
}).listen(ports.proxy);
var source = _http2.default.createServer(function (req, res) {
  req.method.should.eql('GET');
  req.headers.host.split(':')[1].should.eql(ports.proxy.toString());
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from ' + source.address().port);
});
source.listen(ports.source);
_http2.default.request({ hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'GET'
}, function (res) {
  res.statusCode.should.eql(200);
  res.on('data', function (data) {
    data.toString().should.eql('Hello from ' + ports.source);
  });
  res.on('end', function () {
    source.close();
    proxy.close();
    done();
  });
}).end();
```

<a name="libes-http-proxyjs-createproxyserver-method-with-error-response"></a>
## #createProxyServer() method with error response
should make the request and emit the error event.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'http://127.0.0.1:' + ports.source
});
proxy.on('error', function (err) {
  (0, _chai.expect)(err).to.be.an.instanceof(Error);
  (0, _chai.expect)(err.code).to.eql('ECONNREFUSED');
  proxy.close();
  done();
});
proxy.listen(ports.proxy);
_http2.default.request({ hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'GET'
}, function () {}).end();
```

<a name="libes-http-proxyjs-createproxyserver-setting-the-correct-timeout-value"></a>
## #createProxyServer setting the correct timeout value
should hang up the socket at the timeout.

```js
this.timeout(30);
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'http://127.0.0.1:' + ports.source,
  timeout: 3
}).listen(ports.proxy);
proxy.on('error', function (e) {
  should.exist(e);
  e.should.be.instanceof(Error);
  should.exist(e.code);
  e.code.should.eql('ECONNRESET');
});
var source = _http2.default.createServer(function (req, res) {
  setTimeout(function () {
    res.end('At this point the socket should be closed');
  }, 5);
});
source.listen(ports.source);
var testReq = _http2.default.request({ hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'GET'
}, function () {});
testReq.on('error', function (e) {
  (0, _chai.expect)(e).to.be.instanceof(Error);
  (0, _chai.expect)(e.code).to.eql('ECONNRESET');
  proxy.close();
  source.close();
  done();
});
testReq.end();
```

<a name="libes-http-proxyjs-createproxyserver-using-the-ws-incoming-passes"></a>
## #createProxyServer using the ws-incoming passes
should proxy the websockets stream.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
var proxyServer = proxy.listen(ports.proxy);
var destiny = new _ws2.default.Server({ port: ports.source }, function () {
  var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
  client.on('open', function () {
    client.send('hello there');
  });
  client.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('Hello over websockets');
    client.close();
    proxyServer.close();
    destiny.close();
    done();
  });
});
destiny.on('connection', function (socket) {
  socket.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('hello there');
    socket.send('Hello over websockets');
  });
});
```

should emit error on proxy error.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
var proxyServer = proxy.listen(ports.proxy);
var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
client.on('open', function () {
  client.send('hello there');
});
var count = 0;
function maybe_done() {
  count += 1;
  if (count === 2) done();
}
client.on('error', function (err) {
  (0, _chai.expect)(err).to.be.instanceof(Error);
  (0, _chai.expect)(err.code).to.eql('ECONNRESET');
  maybe_done();
});
proxy.on('error', function (err) {
  (0, _chai.expect)(err).to.be.instanceof(Error);
  (0, _chai.expect)(err.code).to.eql('ECONNREFUSED');
  proxyServer.close();
  maybe_done();
});
```

should close client socket if upstream is closed before upgrade.

```js
var ports = { source: gen.port, proxy: gen.port };
var server = _http2.default.createServer();
server.on('upgrade', function (req, socket, head) {
  var response = ['HTTP/1.1 404 Not Found', 'Content-type: text/html', '', ''];
  socket.write(response.join('\r\n'));
  socket.end();
});
server.listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
var proxyServer = proxy.listen(ports.proxy);
var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
client.on('open', function () {
  client.send('hello there');
});
client.on('error', function (err) {
  (0, _chai.expect)(err).to.be.instanceof(Error);
  (0, _chai.expect)(err.code).to.eql('ECONNRESET');
  proxyServer.close();
  done();
});
```

should proxy a socket.io stream.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
var proxyServer = proxy.listen(ports.proxy);
var server = _http2.default.createServer();
var destiny = _socket2.default.listen(server);
function startSocketIo() {
  var client = _socket4.default.connect('ws://127.0.0.1:' + ports.proxy);
  client.on('connect', function () {
    client.emit('incoming', 'hello there');
  });
  client.on('outgoing', function (data) {
    (0, _chai.expect)(data).to.eql('Hello over websockets');
    proxyServer.close();
    server.close();
    done();
  });
}
server.listen(ports.source);
server.on('listening', startSocketIo);
destiny.sockets.on('connection', function (socket) {
  socket.on('incoming', function (msg) {
    (0, _chai.expect)(msg).to.eql('hello there');
    socket.emit('outgoing', 'Hello over websockets');
  });
});
```

should emit open and close events when socket.io client connects and disconnects.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({ target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
var proxyServer = proxy.listen(ports.proxy);
var server = _http2.default.createServer();
var destiny = _socket2.default.listen(server);
function startSocketIo() {
  var client = _socket4.default.connect('ws://127.0.0.1:' + ports.proxy, { rejectUnauthorized: null });
  client.on('connect', function () {
    client.disconnect();
  });
}
var count = 0;
proxyServer.on('open', function () {
  count += 1;
});
proxyServer.on('close', function () {
  proxyServer.close();
  server.close();
  if (count == 1) {
    done();
  }
});
server.listen(ports.source);
server.on('listening', startSocketIo);
```

should pass all set-cookie headers to client.

```js
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'ws://127.0.0.1:' + ports.source,
  ws: true
}),
    proxyServer = proxy.listen(ports.proxy),
    destiny = new _ws2.default.Server({ port: ports.source }, function () {
  var key = new Buffer(Math.random().toString()).toString('base64');
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
  };
  var req = _http2.default.request(requestOptions);
  req.on('upgrade', function (res, socket, upgradeHead) {
    (0, _chai.expect)(res.headers['set-cookie'].length).to.eql(2);
    done();
  });
  req.end();
});
destiny.on('headers', function (headers) {
  headers.push('Set-Cookie: test1=test1');
  headers.push('Set-Cookie: test2=test2');
});
```

should detect a proxyReq event and modify headers.

```js
var ports = { source: gen.port, proxy: gen.port },
    proxy,
    proxyServer,
    destiny;
proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'ws://127.0.0.1:' + ports.source,
  ws: true
});
proxy.on('proxyReqWs', function (proxyReq, req, socket, options, head) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});
proxyServer = proxy.listen(ports.proxy);
destiny = new _ws2.default.Server({ port: ports.source }, function () {
  var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
  client.on('open', function () {
    client.send('hello there');
  });
  client.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('Hello over websockets');
    client.close();
    proxyServer.close();
    destiny.close();
    done();
  });
});
destiny.on('connection', function (socket) {
  (0, _chai.expect)(socket.upgradeReq.headers['x-special-proxy-header']).to.eql('foobar');
  socket.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('hello there');
    socket.send('Hello over websockets');
  });
});
```

should forward frames with single frame payload (including on node 4.x).

```js
var payload = Array(65529).join('0');
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'ws://127.0.0.1:' + ports.source,
  ws: true
}),
    proxyServer = proxy.listen(ports.proxy),
    destiny = new _ws2.default.Server({ port: ports.source }, function () {
  var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
  client.on('open', function () {
    client.send(payload);
  });
  client.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('Hello over websockets');
    client.close();
    proxyServer.close();
    destiny.close();
    done();
  });
});
destiny.on('connection', function (socket) {
  socket.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql(payload);
    socket.send('Hello over websockets');
  });
});
```

should forward continuation frames with big payload (including on node 4.x).

```js
var payload = Array(65530).join('0');
var ports = { source: gen.port, proxy: gen.port };
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'ws://127.0.0.1:' + ports.source,
  ws: true
}),
    proxyServer = proxy.listen(ports.proxy),
    destiny = new _ws2.default.Server({ port: ports.source }, function () {
  var client = new _ws2.default('ws://127.0.0.1:' + ports.proxy);
  client.on('open', function () {
    client.send(payload);
  });
  client.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql('Hello over websockets');
    client.close();
    proxyServer.close();
    destiny.close();
    done();
  });
});
destiny.on('connection', function (socket) {
  socket.on('message', function (msg) {
    (0, _chai.expect)(msg).to.eql(payload);
    socket.send('Hello over websockets');
  });
});
```

<a name="libes-http-proxyjs"></a>
# lib/es-http-proxy.js
<a name="libes-http-proxyjs-https-createproxyserver"></a>
## HTTPS #createProxyServer
<a name="libes-http-proxyjs-https-createproxyserver-https-to-http"></a>
### HTTPS to HTTP
should proxy the request en send back the response.

```js
var ports = { source: gen.port, proxy: gen.port };
var source = _http2.default.createServer(function (req, res) {
  (0, _chai.expect)(req.method).to.eql('GET');
  (0, _chai.expect)(req.headers.host.split(':')[1]).to.eql(ports.proxy.toString());
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from ' + ports.source);
});
source.listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'http://127.0.0.1:' + ports.source,
  ssl: {
    key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
    cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
    ciphers: 'AES128-GCM-SHA256'
  }
}).listen(ports.proxy);
_https2.default.request({
  host: 'localhost',
  port: ports.proxy,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false
}, function (res) {
  (0, _chai.expect)(res.statusCode).to.eql(200);
  res.on('data', function (data) {
    (0, _chai.expect)(data.toString()).to.eql('Hello from ' + ports.source);
  });
  res.on('end', function () {
    source.close();
    proxy.close();
    done();
  });
}).end();
```

<a name="libes-http-proxyjs-https-createproxyserver-http-to-https"></a>
### HTTP to HTTPS
should proxy the request and send back the response.

```js
var ports = { source: gen.port, proxy: gen.port };
var source = _https2.default.createServer({
  key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
  cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
  ciphers: 'AES128-GCM-SHA256'
}, function (req, res) {
  (0, _chai.expect)(req.method).to.eql('GET');
  (0, _chai.expect)(req.headers.host.split(':')[1]).to.eql(ports.proxy.toString());
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from ' + ports.source);
});
source.listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'https://127.0.0.1:' + ports.source,
  // Allow to use SSL self signed
  secure: false
}).listen(ports.proxy);
_http2.default.request({
  hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'GET'
}, function (res) {
  (0, _chai.expect)(res.statusCode).to.eql(200);
  res.on('data', function (data) {
    (0, _chai.expect)(data.toString()).to.eql('Hello from ' + ports.source);
  });
  res.on('end', function () {
    source.close();
    proxy.close();
    done();
  });
}).end();
```

<a name="libes-http-proxyjs-https-createproxyserver-https-to-https"></a>
### HTTPS to HTTPS
should proxy the request en send back the response.

```js
var ports = { source: gen.port, proxy: gen.port };
var source = _https2.default.createServer({
  key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
  cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
  ciphers: 'AES128-GCM-SHA256'
}, function (req, res) {
  (0, _chai.expect)(req.method).to.eql('GET');
  (0, _chai.expect)(req.headers.host.split(':')[1]).to.eql(ports.proxy.toString());
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from ' + ports.source);
});
source.listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'https://127.0.0.1:' + ports.source,
  ssl: {
    key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
    cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
    ciphers: 'AES128-GCM-SHA256'
  },
  secure: false
}).listen(ports.proxy);
_https2.default.request({
  host: 'localhost',
  port: ports.proxy,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false
}, function (res) {
  (0, _chai.expect)(res.statusCode).to.eql(200);
  res.on('data', function (data) {
    (0, _chai.expect)(data.toString()).to.eql('Hello from ' + ports.source);
  });
  res.on('end', function () {
    source.close();
    proxy.close();
    done();
  });
}).end();
```

<a name="libes-http-proxyjs-https-createproxyserver-https-not-allow-ssl-self-signed"></a>
### HTTPS not allow SSL self signed
should fail with error.

```js
var ports = { source: gen.port, proxy: gen.port };
var source = _https2.default.createServer({
  key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
  cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
  ciphers: 'AES128-GCM-SHA256'
}).listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({
  target: 'https://127.0.0.1:' + ports.source,
  secure: true
});
proxy.listen(ports.proxy);
proxy.on('error', function (err, req, res) {
  (0, _chai.expect)(err).to.be.an.instanceof(Error);
  if (_semver2.default.gt(process.versions.node, '0.12.0')) {
    (0, _chai.expect)(err.toString()).to.eql('Error: self signed certificate');
  } else {
    (0, _chai.expect)(err.toString()).to.eql('Error: DEPTH_ZERO_SELF_SIGNED_CERT');
  }
  done();
});
_http2.default.request({
  hostname: '127.0.0.1',
  port: ports.proxy,
  method: 'GET'
}).end();
```

<a name="libes-http-proxyjs-https-createproxyserver-https-to-http-using-own-server"></a>
### HTTPS to HTTP using own server
should proxy the request en send back the response.

```js
var ports = { source: gen.port, proxy: gen.port };
var source = _http2.default.createServer(function (req, res) {
  (0, _chai.expect)(req.method).to.eql('GET');
  (0, _chai.expect)(req.headers.host.split(':')[1]).to.eql(ports.proxy.toString());
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from ' + ports.source);
});
source.listen(ports.source);
var proxy = (0, _esHttpProxy.createProxyServer)({
  agent: new _http2.default.Agent({ maxSockets: 2 })
});
var ownServer = _https2.default.createServer({
  key: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-key.pem')),
  cert: _fs2.default.readFileSync(_path2.default.join(__dirname, 'fixtures', 'agent2-cert.pem')),
  ciphers: 'AES128-GCM-SHA256'
}, function (req, res) {
  proxy.web(req, res, {
    target: 'http://127.0.0.1:' + ports.source
  });
}).listen(ports.proxy);
_https2.default.request({
  host: 'localhost',
  port: ports.proxy,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false
}, function (res) {
  (0, _chai.expect)(res.statusCode).to.eql(200);
  res.on('data', function (data) {
    (0, _chai.expect)(data.toString()).to.eql('Hello from ' + ports.source);
  });
  res.on('end', function () {
    source.close();
    ownServer.close();
    done();
  });
}).end();
```

<a name="es-http-proxy-examples"></a>
# es-http-proxy examples
<a name="es-http-proxy-examples-before-testing-examples"></a>
## Before testing examples
<a name="es-http-proxy-examples-requiring-all-the-examples"></a>
## Requiring all the examples
