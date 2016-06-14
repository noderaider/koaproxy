'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeStatusCode = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.removeChunked = removeChunked;
exports.setConnection = setConnection;
exports.setRedirectHostRewrite = setRedirectHostRewrite;
exports.writeHeaders = writeHeaders;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var redirectRegex = /^30(1|2|7|8)$/;

/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, res, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */

/**
 * If is a HTTP 1.0 request, remove chunk headers
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {proxyResponse} Res Response object from the proxy request
 *
 * @api private
 */
function removeChunked(req, res, proxyRes) {
  if (req.httpVersion === '1.0') delete proxyRes.headers['transfer-encoding'];
}

/**
 * If is a HTTP 1.0 request, set the correct connection header
 * or if connection header not present, then use `keep-alive`
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {proxyResponse} Res Response object from the proxy request
 *
 * @api private
 */
function setConnection(req, res, proxyRes) {
  if (req.httpVersion === '1.0') {
    proxyRes.headers.connection = req.headers.connection || 'close';
  } else if (!proxyRes.headers.connection) {
    proxyRes.headers.connection = req.headers.connection || 'keep-alive';
  }
}

function setRedirectHostRewrite(req, res, proxyRes, options) {
  if ((options.hostRewrite || options.autoRewrite || options.protocolRewrite) && proxyRes.headers['location'] && redirectRegex.test(proxyRes.statusCode)) {
    var target = _url2.default.parse(options.target);
    var u = _url2.default.parse(proxyRes.headers['location']);

    // make sure the redirected host matches the target host before rewriting
    if (target.host != u.host) {
      return;
    }

    if (options.hostRewrite) {
      u.host = options.hostRewrite;
    } else if (options.autoRewrite) {
      u.host = req.headers['host'];
    }
    if (options.protocolRewrite) {
      u.protocol = options.protocolRewrite;
    }

    proxyRes.headers['location'] = u.format();
  }
}
/**
 * Copy headers from proxyResponse to response
 * set each header in response object.
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {proxyResponse} Res Response object from the proxy request
 *
 * @api private
 */
function writeHeaders(req, res, proxyRes) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(proxyRes.headers)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      if (typeof proxyRes.headers[key] !== 'undefined') {
        if (res.headersSent) throw new Error('Cannot write header ' + key + ' because headers have already been sent.');
        res.setHeader(String(key).trim(), proxyRes.headers[key]);
      }
    }
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
}

/**
 * Set the statusCode from the proxyResponse
 *
 * @param {ClientRequest} Req Request object
 * @param {IncomingMessage} Res Response object
 * @param {proxyResponse} Res Response object from the proxy request
 *
 * @api private
 */
var writeStatusCode = exports.writeStatusCode = function writeStatusCode(req, res, proxyRes) {
  return res.writeHead(proxyRes.statusCode);
};

exports.default = [removeChunked, setConnection, setRedirectHostRewrite, writeHeaders, writeStatusCode];