/**
 * memjs-adapter.ts
 */

import {mKVS} from "../types/memcached-kvs";

// import {Client} from "memjs";

type Client = mKVS.MemjsClient;

export class MemjsAdapter<T extends (string | Buffer)> implements mKVS.KVS<T> {
    private readonly expires: { expires: number };

    constructor(protected client: Client, expires: number) {
        if (expires != null) this.expires = {expires: expires};
    }

    get(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => err ? reject(err) : resolve(value as any));
        });
    }

    set(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, this.expires, err => err ? reject(err) : resolve());
        });
    }

    delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.delete(key, err => err ? reject(err) : resolve());
        });
    }
}
