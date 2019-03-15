/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const PeerInfo = require('peer-info')
const pDefer = require('p-defer')

const GoMulticastDNS = require('../../src/compat')

describe('GoMulticastDNS', () => {
  const peerAddrs = [
    '/ip4/127.0.0.1/tcp/20001',
    '/ip4/127.0.0.1/tcp/20002'
  ]
  let peerInfos

  before(async () => {
    peerInfos = await Promise.all([
      PeerInfo.create(),
      PeerInfo.create()
    ])

    peerInfos.forEach((peer, index) => {
      peer.multiaddrs.add(peerAddrs[index])
    })
  })

  it('should start and stop', async () => {
    const mdns = new GoMulticastDNS(peerInfos[0])

    await mdns.start()
    return mdns.stop()
  })

  it('should not start when started', async () => {
    const mdns = new GoMulticastDNS(peerInfos[0])

    await mdns.start()
    await mdns.start()
      .then(expect.fail, (err) => {
        expect(err.message).to.equal('MulticastDNS service is already started')
      })

    return mdns.stop()
  })

  it('should not stop when not started', async () => {
    const mdns = new GoMulticastDNS(peerInfos[0])

    try {
      await mdns.stop()
    } catch (err) {
      expect(err.message).to.equal('MulticastDNS service is not started')
      return
    }

    expect.fail('An error should have been thrown')
  })

  it('should emit peer info when peer is discovered', async () => {
    const mdnsA = new GoMulticastDNS(peerInfos[0])
    const mdnsB = new GoMulticastDNS(peerInfos[1])
    const defer = pDefer()

    mdnsA.on('peer', info => {
      if (!info.id.isEqual(peerInfos[1].id)) return
      expect(info.multiaddrs.has(peerAddrs[1])).to.be.true()
      defer.resolve()
    })

    // Start in series
    Promise.all([
      mdnsA.start(),
      mdnsB.start()
    ])

    await defer.promise
  })
})
