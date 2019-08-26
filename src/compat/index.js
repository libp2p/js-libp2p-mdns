'use strict'

// Compatibility with Go libp2p MDNS

const EE = require('events')
const parallel = require('async/parallel')
const Responder = require('./responder')
const Querier = require('./querier')

/**
 * @class
 */
class GoMulticastDNS extends EE {
  /**
   *
   * @param {object} peerInfo
   */
  constructor (peerInfo) {
    super()
    this._started = false
    this._peerInfo = peerInfo
    this._onPeer = this._onPeer.bind(this)
  }
  /**
   *
   * @param {function} callback
   * @returns {functio}
   */
  start (callback) {
    if (this._started) {
      return callback(new Error('MulticastDNS service is already started'))
    }

    this._started = true
    this._responder = new Responder(this._peerInfo)
    this._querier = new Querier(this._peerInfo.id)

    this._querier.on('peer', this._onPeer)

    parallel([
      cb => this._responder.start(cb),
      cb => this._querier.start(cb)
    ], callback)
  }
  /**
   *
   * @param {object} peerInfo
   */
  _onPeer (peerInfo) {
    this.emit('peer', peerInfo)
  }
  /**
   *
   * @param {function} callback
   * @returns {?object}
   */
  stop (callback) {
    if (!this._started) {
      return callback(new Error('MulticastDNS service is not started'))
    }

    const responder = this._responder
    const querier = this._querier

    this._started = false
    this._responder = null
    this._querier = null

    querier.removeListener('peer', this._onPeer)

    parallel([
      cb => responder.stop(cb),
      cb => querier.stop(cb)
    ], callback)
  }
}

module.exports = GoMulticastDNS
