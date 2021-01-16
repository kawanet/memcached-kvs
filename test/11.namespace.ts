#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";

import {bufferKVS, textKVS} from "../lib/memcached-kvs";
import {MemcachedStub, StubClient} from "./utils/_stub";

const TESTNAME = __filename.split("/").pop();

describe(TESTNAME, () => {
    const namespace = TESTNAME + ":" + (+new Date) + ":";
    const memjs = StubClient.create<Buffer>();
    const memcached = new MemcachedStub<string>();

    after(() => {
        memjs.close();
        memcached.end();
    });

    it("bufferKVS", async () => {
        const direct = bufferKVS({memjs});
        const key = namespace + "foo";
        const kvs = bufferKVS({memjs: memjs, expires: 1, namespace: namespace});

        {
            await kvs.set("foo", Buffer.from([65, 66, 67]));
            const val = await kvs.get("foo");
            assert.deepEqual([].slice.call(val), [65, 66, 67]);

            const raw = await direct.get(key);
            assert.deepEqual([].slice.call(raw), [65, 66, 67]);

            await kvs.delete("foo");
            assert.equal(await direct.get(namespace + "foo"), undefined);
        }
    });

    it("textKVS", async () => {
        const direct = textKVS({memcached});
        const key = namespace + "bar";
        const kvs = textKVS({memcached: memcached, expires: 1, namespace: namespace});

        {
            await kvs.set("bar", "BAR");
            const val = await kvs.get("bar");
            assert.equal(val, "BAR");

            const raw = await direct.get(key);
            assert.equal(raw.toString(), "BAR");

            await kvs.delete("bar");
            assert.equal(await direct.get(key), undefined);
        }
    });
});
