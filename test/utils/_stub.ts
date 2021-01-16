/**
 * stub-adapter.ts
 */

import {mKVS} from "../../types/memcached-kvs";

type Item<T> = T;

export const StubClient = {
    create: <T>() => new MemjsStub<T>()
};

class MemjsStub<T> implements mKVS.MemjsClient {
    memory = {} as { [key: string]: Item<T> };

    get(key: string, callback: (err: any, value: T) => void) {
        callback(null, this.memory[key]);
    }

    set(key: string, value: any, options: any, callback: (err: any) => void) {
        this.memory[key] = value;
        callback(null);
    }

    delete(key: string, callback: (err: Error) => void) {
        delete this.memory[key];
        callback(null);
    }

    close() {
        // stub
    }

}

export class MemcachedStub<T> implements mKVS.MemcachedClient {
    memory = {} as { [key: string]: Item<T> };

    get(key: string, callback: (err: any, value: T) => void) {
        callback(null, this.memory[key]);
    }

    set(key: string, value: any, options: any, callback: (err: any) => void) {
        this.memory[key] = value;
        callback(null);
    }

    del(key: string, callback: (err: Error) => void) {
        delete this.memory[key];
        callback(null);
    }

    end() {
        // stub
    }
}