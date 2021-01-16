import {mKVS} from "../types/memcached-kvs";
import {MemcachedAdapter} from "./memcached-adapter";
import {MemjsAdapter} from "./memjs-adapter";

type KVS<T> = mKVS.KVS<T>
type Options = mKVS.Options;

function promiseKVS<T extends (string | Buffer)>(options: Options): KVS<T> {
    let client: KVS<T>;

    const {expires, hasher, memcached, memjs, namespace} = options;

    if (memcached) {
        client = new MemcachedAdapter<T>(memcached, expires);
    } else if (memjs) {
        client = new MemjsAdapter<T>(memjs, expires);
    } else {
        throw new Error("memcached client not given");
    }

    if (namespace) {
        client = keyFilterKVS(client, key => namespace + key);
    }

    if (hasher) {
        client = keyFilterKVS(client, hasher)
    }

    return client;
}

export function bufferKVS(options: Options): KVS<Buffer> {
    return forceBuffer(promiseKVS<Buffer>(options));
}

export function textKVS(options: Options): KVS<string> {
    return forceString(promiseKVS<string>(options));
}

function forceBuffer(kvs: KVS<any>): KVS<Buffer> {
    const out = Object.create(kvs);

    out.get = (key: string) => kvs.get(key).then(bufferify);

    out.set = (key: string, value: any) => kvs.set(key, bufferify(value));

    return out;
}

function forceString(kvs: KVS<any>): KVS<string> {
    const out = Object.create(kvs);

    out.get = (key: string) => kvs.get(key).then(stringify);

    out.set = (key: string, value: any) => kvs.set(key, stringify(value));

    return out;
}

function bufferify(value: any) {
    if (value != null) {
        return Buffer.isBuffer(value) ? value : Buffer.from(value);
    }
}

function stringify(value: any) {
    if (value != null) {
        return ("string" === typeof value) ? value : String(value);
    }
}

function keyFilterKVS<V>(kvs: KVS<V>, filter: (key: string) => string): KVS<V> {
    const out = {} as typeof kvs;

    out.get = (key: string) => kvs.get(filter(key)) as any;

    out.set = (key: string, value: V) => kvs.set(filter(key), value);

    if (kvs.delete) out.delete = (key: string) => kvs.delete(filter(key));

    return out;
}