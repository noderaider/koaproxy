import url from 'url'
import required from 'requires-port'

const upgradeHeader = /(^|,)\s*upgrade\s*($|,)/i

/**
 * Simple Regex for testing if protocol is https
 */
export const isSSL = /^https|wss/

/**
 * Copies the right headers from `options` and `req` to
 * `outgoing` which is then used to fire the proxied
 * request.
 *
 * Examples:
 *
 *    setupOutgoing(outgoing, options, req)
 *    // => { host: ..., hostname: ...}
 *
 * @param {Object} Outgoing Base object to be filled with required properties
 * @param {Object} Options Config object passed to the proxy
 * @param {ClientRequest} Req Request Object
 * @param {String} Forward String to select forward or target
 * 
 * @return {Object} Outgoing Object with all required properties set
 *
 * @api private
 */

export function setupOutgoing(outgoing, options, req, forward) {
  outgoing.port = options[forward || 'target'].port || (isSSL.test(options[forward || 'target'].protocol) ? 443 : 80)

  const outgoingTypes = [ 'host', 'hostname', 'socketPath', 'pfx', 'key', 'passphrase', 'cert', 'ca', 'ciphers', 'secureProtocol' ]
  outgoingTypes.forEach(function mapOutgoing(e) {
    outgoing[e] = options[forward || 'target'][e]
  })

  outgoing.method = req.method
  outgoing.headers = Object.assign({}, req.headers)

  if (options.headers)
    outgoing.headers = { ...outgoing.headers, ...options.headers }
  if (options.auth)
    outgoing.auth = options.auth
  if (isSSL.test(options[forward || 'target'].protocol))
    outgoing.rejectUnauthorized = (typeof options.secure === 'undefined') ? true : options.secure

  outgoing.agent = options.agent || false
  outgoing.localAddress = options.localAddress

  //
  // Remark: If we are false and not upgrading, set the connection: close. This is the right thing to do
  // as node core doesn't handle this COMPLETELY properly yet.
  //
  if (!outgoing.agent) {
    outgoing.headers = outgoing.headers || {}
    if (typeof outgoing.headers.connection !== 'string' || !upgradeHeader.test(outgoing.headers.connection))
      outgoing.headers.connection = 'close'
  }


  // the final path is target path + relative path requested by user:
  var target = options[forward || 'target']
  var targetPath = target && options.prependPath !== false
    ? (target.path || '')
    : ''

  //
  // Remark: Can we somehow not use url.parse as a perf optimization?
  //
  var outgoingPath = !options.toProxy
    ? (url.parse(req.url).path || '')
    : req.url

  //
  // Remark: ignorePath will just straight up ignore whatever the request's
  // path is. This can be labeled as FOOT-GUN material if you do not know what
  // you are doing and are using conflicting options.
  //
  outgoingPath = !options.ignorePath ? outgoingPath : ''

  outgoing.path = urlJoin(targetPath, outgoingPath)

  if (options.changeOrigin) {
    outgoing.headers.host =
      required(outgoing.port, options[forward || 'target'].protocol) && !hasPort(outgoing.host)
        ? outgoing.host + ':' + outgoing.port
        : outgoing.host
  }
  return outgoing
}

/**
 * Set the proper configuration for sockets,
 * set no delay and set keep alive, also set
 * the timeout to 0.
 *
 * Examples:
 *
 *    setupSocket(socket)
 *    // => Socket
 *
 * @param {Socket} Socket instance to setup
 * 
 * @return {Socket} Return the configured socket.
 *
 * @api private
 */

export function setupSocket(socket) {
  socket.setTimeout(0)
  socket.setNoDelay(true)

  socket.setKeepAlive(true, 0)

  return socket
}

/**
 * Get the port number from the host. Or guess it based on the connection type.
 *
 * @param {Request} req Incoming HTTP request.
 *
 * @return {String} The port number.
 *
 * @api private
 */
export function getPort(req) {
  var res = req.headers.host ? req.headers.host.match(/:(\d+)/) : ''

  return res ?
    res[1] :
    hasEncryptedConnection(req) ? '443' : '80'
}

/**
 * Check if the request has an encrypted connection.
 *
 * @param {Request} req Incoming HTTP request.
 *
 * @return {Boolean} Whether the connection is encrypted or not.
 *
 * @api private
 */
export function hasEncryptedConnection(req) {
  return Boolean(req.connection.encrypted || req.connection.pair)
}

/**
 * OS-agnostic join (doesn't break on URLs like path.join does on Windows)>
 *
 * @return {String} The generated path.
 *
 * @api private
 */

export function urlJoin() {
    //
    // We do not want to mess with the query string. All we want to touch is the path.
    //
  const args = Array.prototype.slice.call(arguments)
  let lastIndex = args.length - 1
  let last = args[lastIndex]
  let lastSegs = last.split('?')
  let retSegs

  args[lastIndex] = lastSegs.shift()

  //
  // Join all strings, but remove empty strings so we don't get extra slashes from
  // joining e.g. ['', 'am']
  //
  retSegs = [
    args.filter(Boolean).join('/')
        .replace(/\/+/g, '/')
        .replace('http:/', 'http://')
        .replace('https:/', 'https://')
  ]

  // Only join the query string if it exists so we don't have trailing a '?'
  // on every request

  // Handle case where there could be multiple ? in the URL.
  retSegs.push.apply(retSegs, lastSegs)

  return retSegs.join('?')
}

/**
 * Check the host and see if it potentially has a port in it (keep it simple)
 *
 * @returns {Boolean} Whether we have one or not
 *
 * @api private
 */
function hasPort(host) {
  return !!~host.indexOf(':')
}