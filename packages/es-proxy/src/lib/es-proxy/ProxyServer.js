import { inherits } from 'util'
import { parse as parse_url } from 'url'
import EE3 from 'eventemitter3'
import http from 'http'
import https from 'https'
import * as web from './passes/web-incoming'
import * as ws from './passes/ws-incoming'

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

export function createRightProxy(type) {

  return function(options) {
    return function(req, res /*, [head], [opts] */) {
      let passes = (type === 'ws') ? this.wsPasses : this.webPasses
      let args = [].slice.call(arguments)
      let cntr = args.length - 1
      let head
      let cbl

      /* optional args parse begin */
      if(typeof args[cntr] === 'function') {
        cbl = args[cntr]
        cntr--
      }

      if(
        !(args[cntr] instanceof Buffer) &&
        args[cntr] !== res
      ) {
        //Overwrite with request options
        options = { ...options, ...args[cntr] }
        cntr--
      }

      if(args[cntr] instanceof Buffer)
        head = args[cntr]

      /* optional args parse end */
      const argKeys = [ 'target', 'forward' ]
      argKeys.forEach(e => {
        if (typeof options[e] === 'string')
          options[e] = parse_url(options[e])
      })

      if (!options.target && !options.forward)
        return this.emit('error', new Error('Must provide a proper URL as target'))

      for(var i=0; i < passes.length; i++) {
        /**
         * Call of passes functions
         * pass(req, res, options, head)
         *
         * In WebSockets case the `res` variable
         * refer to the connection socket
         * pass(req, socket, options, head)
         */
        if(passes[i](req, res, options, head, this, cbl)) { // passes can return a truthy value to halt the loop
          break
        }
      }
    }
  }
}

export default class ProxyServer extends EE3 {
  constructor(options) {
    super(options)
    options = options || {}
    options.prependPath = options.prependPath === false ? false : true

    this.web = this.proxyRequest           = createRightProxy('web')(options)
    this.ws  = this.proxyWebsocketRequest  = createRightProxy('ws')(options)
    this.options = options

    this.webPasses = Object.keys(web).map(pass => web[pass])
    this.wsPasses = Object.keys(ws).map(pass => ws[pass])
    this.on('error', this.onError, this)
  }
  onError = err => {
    //
    // Remark: Replicate node core behavior using EE3
    // so we force people to handle their own errors
    //
    if(this.listeners('error').length === 1)
      throw err
  };

  listen = (port, hostname) => {
    const closure = (req, res) => { this.web(req, res) }
    this._server  = this.options.ssl ?
      https.createServer(this.options.ssl, closure) :
      http.createServer(closure)

    if(this.options.ws)
      this._server.on('upgrade', (req, socket, head) => { this.ws(req, socket, head) })
    this._server.listen(port, hostname)
    return this
  };

  close = callback => {
    if (this._server) {
      this._server.close(() => {
        this._server = null
        if (callback)
          callback.apply(null, arguments)
      })
    }
  };

  before = (type, passName, callback) => {
    if (type !== 'ws' && type !== 'web')
      throw new Error('type must be `web` or `ws`')
    let passes = (type === 'ws') ? this.wsPasses : this.webPasses
    let i = false

    passes.forEach((v, idx) => { if(v.name === passName) i = idx })

    if(i === false) throw new Error('No such pass')
    passes.splice(i, 0, callback)
  };

  after = (type, passName, callback) => {
    if (type !== 'ws' && type !== 'web')
      throw new Error('type must be `web` or `ws`')
    let passes = (type === 'ws') ? this.wsPasses : this.webPasses
    let i = false

    passes.forEach((v, idx) => {
      if(v.name === passName) i = idx
    })

    if(i === false) throw new Error('No such pass')

    passes.splice(i++, 0, callback)
  };
}
