#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";

import {bufferKVS, textKVS} from "../lib/memcached-kvs";
import {MemcachedStub, StubClient} from "./utils/_stub";

const TESTNAME = __filename.split("/").pop();

describe(TESTNAME, () => {
    const memjs = StubClient.create<Buffer>();
    const memcached = new MemcachedStub<string>();

    after(() => {
        memjs.close();
        memcached.end();
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
            assert.equal(await kvs.get("buz"), undefined);
        }
    });

    it("textKVS", async () => {
        const kvs = textKVS({memcached: memcached, expires: 1});

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
            assert.equal(await kvs.get("qux"), undefined);
        }
    });
});
