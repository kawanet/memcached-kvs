#!/usr/bin/env mocha -R spec

/**
 * @example
 * docker run -d -p 11211:11211 --name memcached memcached
 * docker stop memcached
 * docker restart memcached
 * MEMCACHE_SERVERS=localhost:11211 mocha test
 */

import {strict as assert} from "assert";
import {Client} from "memjs";

import {bufferKVS, textKVS} from "../lib/memcached-kvs";

const TESTNAME = __filename.split("/").pop();
const SLEEP = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// run this test only when environment variable specified
const {MEMCACHE_SERVERS} = process.env;
const DESCRIBE = MEMCACHE_SERVERS ? describe : describe.skip;

DESCRIBE(TESTNAME, () => {
    const memjs = Client.create(MEMCACHE_SERVERS);

    after(() => {
        memjs.close();
    });

    it("bufferKVS", async () => {
        const kvs = bufferKVS({memjs: memjs, expires: 1});

        {
            await kvs.set("foo", Buffer.from([65, 66, 67]));
            const val = await kvs.get("foo");
            assert.equal(Buffer.isBuffer(val), true);
            assert.deepEqual([].slice.call(val), [65, 66, 67]);

            await kvs.delete("foo");
            assert.equal(await kvs.get("foo"), undefined);
        }
        {
            await kvs.set("bar", Buffer.from([]));
            const val = await kvs.get("bar");
            assert.equal(Buffer.isBuffer(val), true);
            assert.equal(val.length, 0);
        }
        {
            await kvs.set("buz", Buffer.from([97, 98, 99]));
            await SLEEP(1);
            assert.deepEqual([].slice.call(await kvs.get("buz")), [97, 98, 99]);
            await SLEEP(1000);
            assert.equal(await kvs.get("buz"), undefined);
        }

    });

    it("textKVS", async () => {
        const kvs = textKVS({memjs: memjs, expires: 1});

        {
            await kvs.set("foo", "FOO");
            const val = await kvs.get("foo");
            assert.equal(typeof val, "string");
            assert.equal(val, "FOO");

            await kvs.delete("foo");
            assert.equal(await kvs.get("foo"), undefined);
        }
        {
            await kvs.set("bar", "");
            const val = await kvs.get("bar");
            assert.equal(typeof val, "string");
            assert.equal(val.length, 0);
        }
        {
            await kvs.set("buz", "BUZ");
            await SLEEP(1);
            assert.equal(await kvs.get("buz"), "BUZ");
            await SLEEP(1000);
            assert.equal(await kvs.get("buz"), undefined);
        }
    });
});
