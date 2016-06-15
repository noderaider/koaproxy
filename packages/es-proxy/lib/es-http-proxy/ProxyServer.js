'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.createRightProxy = createRightProxy;

var _util = require('util');

var _url = require('url');

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _webIncoming = require('./passes/web-incoming');

var web = _interopRequireWildcard(_webIncoming);

var _wsIncoming = require('./passes/ws-incoming');

var ws = _interopRequireWildcard(_wsIncoming);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function that creates the loader for
 * either `ws` or `web`'s  passes.
 *
 * Examples:
 *
 *    httpProxy.createRightProxy('ws')
 *    // => [Function]
 *
 * @param {String} Type Either 'ws' or 'web'
 * 
 * @return {Function} Loader Function that when called returns an iterator for the right passes
 *
 * @api private
 */

function createRightProxy(type) {

  return function (options) {
    return function (req, res /*, [head], [opts] */) {
      var passes = type === 'ws' ? this.wsPasses : this.webPasses;
      var args = [].slice.call(arguments);
      var cntr = args.length - 1;
      var head = void 0;
      var cbl = void 0;

      /* optional args parse begin */
      if (typeof args[cntr] === 'function') {
        cbl = args[cntr];
        cntr--;
      }

      if (!(args[cntr] instanceof Buffer) && args[cntr] !== res) {
        //Overwrite with request options
        options = (0, _extends3.default)({}, options, args[cntr]);
        cntr--;
      }

      if (args[cntr] instanceof Buffer) head = args[cntr];

      /* optional args parse end */
      var argKeys = ['target', 'forward'];
      argKeys.forEach(function (e) {
        if (typeof options[e] === 'string') options[e] = (0, _url.parse)(options[e]);
      });

      if (!options.target && !options.forward) return this.emit('error', new Error('Must provide a proper URL as target'));

      for (var i = 0; i < passes.length; i++) {
        /**
         * Call of passes functions
         * pass(req, res, options, head)
         *
         * In WebSockets case the `res` variable
         * refer to the connection socket
         * pass(req, socket, options, head)
         */
        if (passes[i](req, res, options, head, this, cbl)) {
          // passes can return a truthy value to halt the loop
          break;
        }
      }
    };
  };
}

var ProxyServer = function (_EE) {
  (0, _inherits3.default)(ProxyServer, _EE);

  function ProxyServer(options) {
    var _arguments = arguments;
    (0, _classCallCheck3.default)(this, ProxyServer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ProxyServer).call(this, options));

    _this.onError = function (err) {
      //
      // Remark: Replicate node core behavior using EE3
      // so we force people to handle their own errors
      //
      if (_this.listeners('error').length === 1) throw err;
    };

    _this.listen = function (port, hostname) {
      var closure = function closure(req, res) {
        _this.web(req, res);
      };
      _this._server = _this.options.ssl ? _https2.default.createServer(_this.options.ssl, closure) : _http2.default.createServer(closure);

      if (_this.options.ws) _this._server.on('upgrade', function (req, socket, head) {
        _this.ws(req, socket, head);
      });
      _this._server.listen(port, hostname);
      return _this;
    };

    _this.close = function (callback) {
      if (_this._server) {
        _this._server.close(function () {
          _this._server = null;
          if (callback) callback.apply(null, _arguments);
        });
      }
    };

    _this.before = function (type, passName, callback) {
      if (type !== 'ws' && type !== 'web') throw new Error('type must be `web` or `ws`');
      var passes = type === 'ws' ? _this.wsPasses : _this.webPasses;
      var i = false;

      passes.forEach(function (v, idx) {
        if (v.name === passName) i = idx;
      });

      if (i === false) throw new Error('No such pass');
      passes.splice(i, 0, callback);
    };

    _this.after = function (type, passName, callback) {
      if (type !== 'ws' && type !== 'web') throw new Error('type must be `web` or `ws`');
      var passes = type === 'ws' ? _this.wsPasses : _this.webPasses;
      var i = false;

      passes.forEach(function (v, idx) {
        if (v.name === passName) i = idx;
      });

      if (i === false) throw new Error('No such pass');

      passes.splice(i++, 0, callback);
    };

    options = options || {};
    options.prependPath = options.prependPath === false ? false : true;

    _this.web = _this.proxyRequest = createRightProxy('web')(options);
    _this.ws = _this.proxyWebsocketRequest = createRightProxy('ws')(options);
    _this.options = options;

    _this.webPasses = (0, _keys2.default)(web).map(function (pass) {
      return web[pass];
    });
    _this.wsPasses = (0, _keys2.default)(ws).map(function (pass) {
      return ws[pass];
    });
    _this.on('error', _this.onError, _this);
    return _this;
  }

  return ProxyServer;
}(_eventemitter2.default);

exports.default = ProxyServer;