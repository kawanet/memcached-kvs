/**
 * memcached-adapter.ts
 */

import {mKVS} from "../types/memcached-kvs";

// import * as Client from "memcached";

type Client = mKVS.MemcachedClient;

export class MemcachedAdapter<T extends (string | Buffer)> implements mKVS.KVS<T> {
    private readonly expires: number;

    constructor(protected client: Client, expires: number) {
        if (expires != null) this.expires = expires;
    }

    get(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => err ? reject(err) : resolve(value));
        });
    }

    set(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, this.expires, err => err ? reject(err) : resolve());
        });
    }

    delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.del(key, err => err ? reject(err) : resolve());
        });
    }
}
