'use strict'

const multicastDNS = require('multicast-dns')
const EventEmitter = require('events').EventEmitter
const debug = require('debug')
const log = debug('libp2p:mdns')
const query = require('./query')

class MulticastDNS extends EventEmitter {
  constructor (peerInfo, options) {
    super()
    options = options || {}

    this.broadcast = options.broadcast !== false
    this.serviceTag = options.serviceTag || 'ipfs.local'
    this.port = options.port || 5353
    this.peerInfo = peerInfo
  }

  start (callback) {
    const self = this
    const mdns = multicastDNS({ port: this.port })

    this.mdns = mdns

    mdns.on('response', (event) => {
      if (!self.mdns) {
        return
      }
      query.gotResponse(event, self.peerInfo, self.serviceTag, (err, foundPeer) => {
        if (err) {
          return log('Error processing peer response', err)
        }

        self.emit('peer', foundPeer)
      })
    })

    mdns.on('query', (event) => {
      if (!self.mdns) {
        return
      }
      query.gotQuery(event, self.mdns, self.peerInfo, self.serviceTag, self.broadcast)
    })

    query.queryLAN(this.mdns, this.serviceTag)
    setImmediate(callback)
  }

  stop (callback) {
    const mdns = this.mdns
    if (!mdns) {
      return callback(new Error('MulticastDNS service had not started yet'))
    }
    this.mdns = undefined
    mdns.destroy(callback)
  }
}

module.exports = MulticastDNS

/* for reference

   [ { name: 'discovery.ipfs.io.local',
       type: 'PTR',
       class: 1,
       ttl: 120,
       data: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local' },

     { name: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local',
       type: 'SRV',
       class: 1,
       ttl: 120,
       data: { priority: 10, weight: 1, port: 4001, target: 'lorien.local' } },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '127.0.0.1' },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '127.94.0.1' },

     { name: 'lorien.local',
       type: 'A',
       class: 1,
       ttl: 120,
       data: '172.16.38.224' },

     { name: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC.discovery.ipfs.io.local',
       type: 'TXT',
       class: 1,
       ttl: 120,
       data: 'QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC' } ],

*/
