'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.deleteLength = deleteLength;
exports.timeout = timeout;
exports.XHeaders = XHeaders;
exports.stream = stream;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _webOutgoing = require('./web-outgoing');

var _webOutgoing2 = _interopRequireDefault(_webOutgoing);

var _common = require('../common');

var common = _interopRequireWildcard(_common);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, res, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */

/**
 * Sets `content-length` to '0' if request is of DELETE type.
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {Object} Options Config object passed to the proxy
 *
 * @api private
 */

function deleteLength(req, res, options) {
  if ((req.method === 'DELETE' || req.method === 'OPTIONS') && !req.headers['content-length']) {
    req.headers['content-length'] = '0';
    delete req.headers['transfer-encoding'];
  }
}

/**
 * Sets timeout in request socket if it was specified in options.
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {Object} Options Config object passed to the proxy
 *
 * @api private
 */
function timeout(req, res, options) {
  if (options.timeout) req.socket.setTimeout(options.timeout);
}

/**
 * Sets `x-forwarded-*` headers if specified in config.
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {Object} Options Config object passed to the proxy
 *
 * @api private
 */
function XHeaders(req, res, options) {
  if (!options.xfwd) return;

  var encrypted = req.isSpdy || common.hasEncryptedConnection(req);
  var values = { for: req.connection.remoteAddress || req.socket.remoteAddress,
    port: common.getPort(req),
    proto: encrypted ? 'https' : 'http'
  };

  var xValues = ['for', 'port', 'proto'];
  xValues.forEach(function setXForwardedHeader(header) {
    req.headers['x-forwarded-' + header] = '' + (req.headers['x-forwarded-' + header] || '') + (req.headers['x-forwarded-' + header] ? ',' : '') + values[header];
  });
  try {
    var hostHeader = req.headers['host'];
    if (hostHeader) req.headers['x-forwarded-host'] = hostHeader;else console.warn('No host was specified in proxy request.');
  } catch (err) {
    console.error(err, 'An error occurred in xfwd area attempting to set proxy headers.');
  }
}

/**
 * Does the actual proxying. If `forward` is enabled fires up
 * a ForwardStream, same happens for ProxyStream. The request
 * just dies otherwise.
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {Object} Options Config object passed to the proxy
 *
 * @api private
 */

function stream(req, res, options, _, server, clb) {

  // And we begin!
  server.emit('start', req, res, options.target);
  if (options.forward) {
    // If forward enable, so just pipe the request
    var forwardReq = (options.forward.protocol === 'https:' ? _https2.default : _http2.default).request(common.setupOutgoing(options.ssl || {}, options, req, 'forward'));
    (options.buffer || req).pipe(forwardReq);
    if (!options.target) {
      return res.end();
    }
  }

  // Request initalization
  var proxyReq = (options.target.protocol === 'https:' ? _https2.default : _http2.default).request(common.setupOutgoing(options.ssl || {}, options, req));

  // Enable developers to modify the proxyReq before headers are sent
  proxyReq.on('socket', function (socket) {
    if (server) {
      server.emit('proxyReq', proxyReq, req, res, options);
    }
  });

  // allow outgoing socket to timeout so that we could
  // show an error page at the initial request
  if (options.proxyTimeout) {
    proxyReq.setTimeout(options.proxyTimeout, function () {
      proxyReq.abort();
    });
  }

  // Ensure we abort proxy if request is aborted
  req.on('aborted', function () {
    proxyReq.abort();
  });

  // Handle errors on incoming request as well as it makes sense to
  req.on('error', proxyError);

  // Error Handler
  proxyReq.on('error', proxyError);

  function proxyError(err) {
    if (req.socket.destroyed && err.code === 'ECONNRESET') {
      server.emit('econnreset', err, req, res, options.target);
      return proxyReq.abort();
    }

    if (clb) {
      clb(err, req, res, options.target);
    } else {
      server.emit('error', err, req, res, options.target);
    }
  }

  (options.buffer || req).pipe(proxyReq);

  proxyReq.on('response', function (proxyRes) {
    if (server) {
      server.emit('proxyRes', proxyRes, req, res);
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(_webOutgoing2.default), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var outgoing = _step.value;

        if (outgoing(req, res, proxyRes, options)) break;
      }

      // Allow us to listen when the proxy has completed
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    proxyRes.on('end', function () {
      server.emit('end', req, res, proxyRes);
    });

    proxyRes.pipe(res);
  });

  //proxyReq.end();
}