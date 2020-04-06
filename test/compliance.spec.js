'use strict'

const test = require('interface-discovery')
const PeerId = require('peer-id')
const MulticastDNS = require('../src')
let mdns

const common = {
  async setup () {
    const peerId = await PeerId.create()
    mdns = new MulticastDNS({
      peerId: peerId,
      broadcast: false,
      port: 50001,
      compat: true
    })

    return mdns
  }
}

// use all of the test suits
test(common)
