'use strict'

// Compatibility with Go libp2p MDNS

const EE = require('events')
const parallel = require('async/parallel')
const Responder = require('./responder')
const Querier = require('./querier')

class GoMulticastDNS extends EE {
  constructor (peerInfo) {
    super()
    this._started = false
    this._responder = new Responder(peerInfo)
    this._querier = new Querier(peerInfo.id)
    this._querier.on('peer', peerInfo => this.emit('peer', peerInfo))
  }

  start (callback) {
    if (this._started) {
      return callback(new Error('MulticastDNS service is already started'))
    }

    this._started = true

    parallel([
      cb => this._responder.start(cb),
      cb => this._querier.start(cb)
    ], callback)
  }

  stop (callback) {
    if (!this._started) {
      return callback(new Error('MulticastDNS service is not started'))
    }

    this._started = false

    parallel([
      cb => this._responder.stop(cb),
      cb => this._querier.stop(cb)
    ], callback)
  }
}

module.exports = GoMulticastDNS
