#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {createHash} from "crypto";

import {textKVS} from "../lib/memcached-kvs";
import {MemcachedStub, StubClient} from "./utils/_stub";

const TESTNAME = __filename.split("/").pop();

describe(TESTNAME, () => {
    const memjs = StubClient.create<Buffer>();
    const memcached = new MemcachedStub<string>();

    after(() => {
        memjs.close();
        memcached.end();
    });

    it("SHA-1", async () => {
        const hasher = (key: string) => createHash("sha1").update(key).digest("hex");

        // const key = "sha1:" + hasher("foo");
        const key = "sha1:0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33";

        const direct = textKVS({memjs});
        const kvs = textKVS({
            memjs: memjs,
            namespace: "sha1:",
            hasher: hasher,
        });

        {
            await kvs.set("foo", "FOO");
            assert.equal(await kvs.get("foo"), "FOO");

            const raw = (await direct.get(key));
            assert.equal(raw.toString(), "FOO");

            await kvs.delete("foo");
            assert.equal((await direct.get(key)), undefined);
        }
    });

    it("SHA-256", async () => {
        const hasher = (key: string) => createHash("sha256").update(key).digest("hex");

        // const key = "sha256:" + hasher("bar");
        const key = "sha256:fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9";

        const direct = textKVS({memcached});
        const kvs = textKVS({
            memcached: memcached,
            namespace: "sha256:",
            hasher: hasher,
        });

        {
            await kvs.set("bar", "BAR");
            assert.equal(await kvs.get("bar"), "BAR");

            const raw = (await direct.get(key));
            assert.equal(raw.toString(), "BAR");

            await kvs.delete("bar");
            assert.equal((await direct.get(key)), undefined);
        }
    });
});
