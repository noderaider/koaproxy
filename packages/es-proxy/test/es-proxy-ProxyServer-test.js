import ProxyServer from '../lib/es-proxy/ProxyServer'
import EE3 from 'eventemitter3'
const should = require('chai').should()

describe('ProxyServer', () => {
  it('should exist', () => should.exist(ProxyServer))
  it('should be a function', () => ProxyServer.should.be.a('function'))
  it('should create instanceof EE3', () => new ProxyServer().should.be.instanceof(EE3))
})
