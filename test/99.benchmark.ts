#!/usr/bin/env mocha -R spec

/**
 * @example
 * docker run -d -p 11211:11211 --name memcached memcached
 * docker stop memcached
 * docker restart memcached
 * MEMCACHE_SERVERS=localhost:11211 mocha test
 */

import {strict as assert} from "assert";

import {bufferKVS, textKVS} from "../lib/memcached-kvs";
import {mKVS} from "../types/memcached-kvs";
import * as mocha from "mocha";

const TESTNAME = __filename.split("/").pop();
const SLEEP = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// run this test only when environment variable specified
const {MEMCACHE_SERVERS} = process.env;
const DESCRIBE = MEMCACHE_SERVERS ? describe : describe.skip;

const REPEAT = +process.env.REPEAT || 1;

const expires = 300;

DESCRIBE("REPEAT=" + REPEAT + " " + TESTNAME, () => {

    /**
     * https://www.npmjs.com/package/memcached
     */

    describe("memcached " + require("memcached/package.json").version, () => {
        const Memcached = require("memcached");
        const memcached = new Memcached(MEMCACHE_SERVERS);
        const namespace = `memcached:${+new Date}:`;

        before(() => new Promise(resolve => memcached.get("connection", resolve)));

        it("string 1KB", textTest(1000, textKVS({memcached, expires, namespace})));
        it("string 100KB", textTest(100000, textKVS({memcached, expires, namespace})));
        it("Buffer 1KB", bufferTest(1000, bufferKVS({memcached, expires, namespace})));
        it("Buffer 100KB", bufferTest(100000, bufferKVS({memcached, expires, namespace})));

        after(async () => {
            memcached.end();
            await SLEEP(10);
        });
    });

    /**
     * https://www.npmjs.com/package/memcached-lite
     */

    describe("memcached-lite " + require("memcached-lite/package.json").version, () => {
        const Memcached = require("memcached-lite");
        const memcached = new Memcached(MEMCACHE_SERVERS);
        const namespace = `memcached-lite:${+new Date}:`;

        before(() => new Promise(resolve => memcached.get("connection", resolve)));

        it("string 1KB", textTest(1000, textKVS({memcached, expires, namespace})));
        it("string 100KB", textTest(100000, textKVS({memcached, expires, namespace})));
        it("Buffer 1KB", bufferTest(1000, bufferKVS({memcached, expires, namespace})));
        it("Buffer 100KB", bufferTest(100000, bufferKVS({memcached, expires, namespace})));

        after(async () => {
            memcached.end();
            await SLEEP(10);
        });
    });

    /**
     * https://www.npmjs.com/package/memjs
     */

    describe("MemJS " + require("memjs/package.json").version, () => {
        const {Client} = require("memjs");
        const memjs = Client.create(MEMCACHE_SERVERS);
        const namespace = `MemJS:${+new Date}:`;

        before(() => new Promise(resolve => memjs.get("connection", resolve)));

        it("string 1KB", textTest(1000, textKVS({memjs, expires, namespace})));
        it("string 100KB", textTest(100000, textKVS({memjs, expires, namespace})));
        it("Buffer 1KB", bufferTest(1000, bufferKVS({memjs, expires, namespace})));
        it("Buffer 100KB", bufferTest(100000, bufferKVS({memjs, expires, namespace})));

        after(async () => {
            memjs.close();
            await SLEEP(10);
        });
    });

    /**
     * https://www.npmjs.com/package/keyv-memcache
     */

    describe("keyv-memcache " + require("keyv-memcache/package.json").version, () => {
        const Keyv = require("keyv");
        const KeyvMemcache = require("keyv-memcache");
        const namespace = `keyv-memcache:${+new Date}:`;

        const memcache = new KeyvMemcache(MEMCACHE_SERVERS);
        // expiry TTL in milliseconds.
        const keyv = new Keyv({store: memcache, ttl: expires * 1000, namespace});

        before(() => keyv.get("connection"));

        it("string 1KB", textTest(1000, keyv));
        it("string 100KB", textTest(100000, keyv));
        it("Buffer 1KB", bufferTest(1000, keyv));
        it("Buffer 100KB", bufferTest(100000, keyv));

        after(async () => {
            (memcache as any).client.close();
            await SLEEP(10);
        });
    });
});

/**
 * run (5 * 10 * REPEAT) operations with text KVS
 */

function textTest(size: number, kvs: mKVS.KVS<string>) {
    return async function (this: mocha.Context) {
        this.timeout(1000 * REPEAT);
        const value = "a".repeat(size);
        const key = "string:" + size;

        for (let repeat = 0; repeat < REPEAT; repeat++) {
            await kvs.set(key, value);

            for (let i = 0; i < 8; i++) {
                const buffer = await kvs.get(key);
                assert.equal(typeof buffer, "string");
                assert.equal(buffer[0], "a");
                assert.equal(buffer.length, size);
            }

            await kvs.delete(key);
        }
    };
}

/**
 * run (5 * 10 * REPEAT) operations with Buffer KVS
 */

function bufferTest(size: number, kvs: mKVS.KVS<Buffer>) {
    return async function (this: mocha.Context) {
        this.timeout(1000 * REPEAT);
        const value = Buffer.alloc(size);
        value.fill(97);
        const key = "buffer:" + size;

        for (let repeat = 0; repeat < REPEAT; repeat++) {
            await kvs.set(key, value);

            for (let i = 0; i < 8; i++) {
                const buffer = await kvs.get(key);
                assert.equal(Buffer.isBuffer(buffer), true);
                assert.equal(buffer[0], 97);
                assert.equal(buffer.length, size);
            }

            await kvs.delete(key);
        }
    };
}