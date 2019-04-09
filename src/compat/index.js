'use strict'

const OS = require('os')
const assert = require('assert')
const MDNS = require('multicast-dns')
const TCP = require('libp2p-tcp')
const nextTick = require('async/nextTick')
const { SERVICE_TAG_LOCAL } = require('./constants')

const tcp = new TCP()

// Simply advertise ourselves every 10 seconds with a go-libp2p-mdns compatible
// MDNS response. We can't discover go-libp2p nodes but they'll discover and
// connect to us.
class GoMulticastDNS {
  constructor (peerInfo, options) {
    assert(peerInfo, 'missing peerInfo parameter')
    this._peerInfo = peerInfo
    this._peerIdStr = peerInfo.id.toB58String()
    this._options = options || {}
    this._onTick = this._onTick.bind(this)
  }

  start (callback) {
    this._mdns = MDNS()
    this._intervalId = setInterval(this._onTick, this._options.interval || 10000)
    nextTick(() => callback())
  }

  _onTick () {
    const multiaddrs = tcp.filter(this._peerInfo.multiaddrs.toArray())
    // Only announce TCP for now
    if (!multiaddrs.length) return

    const answers = []
    const peerServiceTagLocal = `${this._peerIdStr}.${SERVICE_TAG_LOCAL}`

    answers.push({
      name: SERVICE_TAG_LOCAL,
      type: 'PTR',
      class: 'IN',
      ttl: 120,
      data: peerServiceTagLocal
    })

    // Only announce TCP multiaddrs for now
    const port = multiaddrs[0].toString().split('/')[4]

    answers.push({
      name: peerServiceTagLocal,
      type: 'SRV',
      class: 'IN',
      ttl: 120,
      data: {
        priority: 10,
        weight: 1,
        port,
        target: OS.hostname()
      }
    })

    answers.push({
      name: peerServiceTagLocal,
      type: 'TXT',
      class: 'IN',
      ttl: 120,
      data: [Buffer.from(this._peerIdStr)]
    })

    multiaddrs.forEach((ma) => {
      const proto = ma.protoNames()[0]
      if (proto === 'ip4' || proto === 'ip6') {
        answers.push({
          name: OS.hostname(),
          type: proto === 'ip4' ? 'A' : 'AAAA',
          class: 'IN',
          ttl: 120,
          data: ma.toString().split('/')[2]
        })
      }
    })

    this._mdns.respond(answers)
  }

  stop (callback) {
    clearInterval(this._intervalId)
    this._mdns.removeListener('query', this._onQuery)
    this._mdns.destroy(callback)
  }
}

module.exports = GoMulticastDNS
module.exports.tag = 'mdns'
