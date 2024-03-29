import { describe, it } from 'mocha'
import assert from 'node:assert'
// eslint-disable-next-line no-unused-vars
import * as API from '../src/clock/api.js'
import { advance, EventBlock, vis } from '../src/clock/index.js'
import { Blockstore, randomCID } from './helpers.js'

async function randomEventData () {
  return {
    type: 'put',
    key: `test-${Date.now()}`,
    value: await randomCID(32)
  }
}

describe('clock', () => {
  it('create a new clock', async () => {
    const blocks = new Blockstore()
    const event = await EventBlock.create({})

    await blocks.put(event.cid, event.bytes)
    const head = await advance(blocks, [], event.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 1)
    assert.equal(head[0].toString(), event.cid.toString())
  })

  it('add an event', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]

    const event = await EventBlock.create(await randomEventData(), head)
    await blocks.put(event.cid, event.bytes)

    head = await advance(blocks, head, event.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 1)
    assert.equal(head[0].toString(), event.cid.toString())
  })

  it('add two events with shared parents', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]
    const parents = head

    const event0 = await EventBlock.create(await randomEventData(), parents)
    await blocks.put(event0.cid, event0.bytes)
    head = await advance(blocks, parents, event0.cid)

    const event1 = await EventBlock.create(await randomEventData(), parents)
    await blocks.put(event1.cid, event1.bytes)
    head = await advance(blocks, head, event1.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 2)
    assert.equal(head[0].toString(), event0.cid.toString())
    assert.equal(head[1].toString(), event1.cid.toString())
  })

  it('add two events with some shared parents', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]
    const parents0 = head

    const event0 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event0.cid, event0.bytes)
    head = await advance(blocks, head, event0.cid)

    const event1 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event1.cid, event1.bytes)
    head = await advance(blocks, head, event1.cid)

    const event2 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event2.cid, event2.bytes)
    head = await advance(blocks, head, event2.cid)

    const event3 = await EventBlock.create(await randomEventData(), [event0.cid, event1.cid])
    await blocks.put(event3.cid, event3.bytes)
    head = await advance(blocks, head, event3.cid)

    const event4 = await EventBlock.create(await randomEventData(), [event2.cid])
    await blocks.put(event4.cid, event4.bytes)
    head = await advance(blocks, head, event4.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 2)
    assert.equal(head[0].toString(), event3.cid.toString())
    assert.equal(head[1].toString(), event4.cid.toString())
  })

  it('converge when multi-root', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]
    const parents0 = head

    const event0 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event0.cid, event0.bytes)
    head = await advance(blocks, head, event0.cid)

    const event1 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event1.cid, event1.bytes)
    head = await advance(blocks, head, event1.cid)

    const parents1 = head

    const event2 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event2.cid, event2.bytes)
    head = await advance(blocks, head, event2.cid)

    const event3 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event3.cid, event3.bytes)
    head = await advance(blocks, head, event3.cid)

    const event4 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event4.cid, event4.bytes)
    head = await advance(blocks, head, event4.cid)

    const parents2 = head

    const event5 = await EventBlock.create(await randomEventData(), parents2)
    await blocks.put(event5.cid, event5.bytes)
    head = await advance(blocks, head, event5.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 1)
    assert.equal(head[0].toString(), event5.cid.toString())
  })

  it('add an old event', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]
    const parents0 = head

    const event0 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event0.cid, event0.bytes)
    head = await advance(blocks, head, event0.cid)

    const event1 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event1.cid, event1.bytes)
    head = await advance(blocks, head, event1.cid)

    const parents1 = head

    const event2 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event2.cid, event2.bytes)
    head = await advance(blocks, head, event2.cid)

    const event3 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event3.cid, event3.bytes)
    head = await advance(blocks, head, event3.cid)

    const event4 = await EventBlock.create(await randomEventData(), parents1)
    await blocks.put(event4.cid, event4.bytes)
    head = await advance(blocks, head, event4.cid)

    const parents2 = head

    const event5 = await EventBlock.create(await randomEventData(), parents2)
    await blocks.put(event5.cid, event5.bytes)
    head = await advance(blocks, head, event5.cid)

    // now very old one
    const event6 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event6.cid, event6.bytes)
    head = await advance(blocks, head, event6.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 2)
    assert.equal(head[0].toString(), event5.cid.toString())
    assert.equal(head[1].toString(), event6.cid.toString())
  })

  it('add an event with missing parents', async () => {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)

    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]

    const event0 = await EventBlock.create(await randomEventData(), head)
    await blocks.put(event0.cid, event0.bytes)

    const event1 = await EventBlock.create(await randomEventData(), [event0.cid])
    await blocks.put(event1.cid, event1.bytes)

    head = await advance(blocks, head, event1.cid)

    for await (const line of vis(blocks, head)) console.log(line)
    assert.equal(head.length, 1)
    assert.equal(head[0].toString(), event1.cid.toString())
  })

  it('test to compare retrivals',async ()=>
  {
    const blocks = new Blockstore()
    const root = await EventBlock.create(await randomEventData())
    await blocks.put(root.cid, root.bytes)
    /** @type {API.EventLink<any>[]} */
    let head = [root.cid]
    const parents0 = head
    const blockGet = blocks.get.bind(blocks)
    let count = 0
    blocks.get = async cid => {
      count++
      return blockGet(cid)
    }
    const event0 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event0.cid, event0.bytes)
    head = await advance(blocks, head, event0.cid)

    const event0a = await EventBlock.create(await randomEventData(), [event0.cid])
    await blocks.put(event0a.cid, event0a.bytes)
    head = await advance(blocks, head, event0a.cid)

    const event0b = await EventBlock.create(await randomEventData(), [event0a.cid])
    await blocks.put(event0b.cid, event0b.bytes)
    head = await advance(blocks, head, event0b.cid)
    const event0c = await EventBlock.create(await randomEventData(), [event0b.cid])
    await blocks.put(event0c.cid, event0c.bytes)
    head = await advance(blocks, head, event0c.cid)

    const event1 = await EventBlock.create(await randomEventData(), [event0c.cid])
    await blocks.put(event1.cid, event1.bytes)
    head = await advance(blocks, head, event1.cid)

    const event2 = await EventBlock.create(await randomEventData(), parents0)
    await blocks.put(event2.cid, event2.bytes)
    head = await advance(blocks, head, event2.cid)

    const event3 = await EventBlock.create(await randomEventData(), [event0c.cid, event1.cid,event2.cid])
    await blocks.put(event3.cid, event3.bytes)
    head = await advance(blocks, head, event3.cid)

    const event4 = await EventBlock.create(await randomEventData(), [event0c.cid,event1.cid])
    await blocks.put(event4.cid, event4.bytes)
    head = await advance(blocks, head, event4.cid)

    const event5 = await EventBlock.create(await randomEventData(), [event3.cid,event4.cid])
    await blocks.put(event5.cid, event5.bytes)
    head = await advance(blocks, head, event5.cid)

    const event6 = await EventBlock.create(await randomEventData(),parents0)
    await blocks.put(event6.cid, event6.bytes)
    const before = count
    head = await advance(blocks, head, event6.cid)

    assert.equal(head.length, 2);
    assert.equal(head[0].toString(),event5.cid.toString())
    assert.equal(head[1].toString(),event6.cid.toString())
    assert.equal(count-before,13,"The number of traversals should be 13 with optimization")
  })
})
