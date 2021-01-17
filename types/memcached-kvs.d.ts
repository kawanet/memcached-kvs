/**
 * memcached-kvs.d.ts
 */

export function textKVS(options: mKVS.Options): mKVS.KVS<string>;

export function bufferKVS(options: mKVS.Options): mKVS.KVS<Buffer>;

declare namespace mKVS {
    /**
     * `Promise` based key value storage interface.
     */
    interface KVS<T> {
        get(key: string): Promise<T>;

        set(key: string, value: T): Promise<void>;

        delete(key: string): Promise<void>;
    }

    /**
     * Option parameters.
     * any one of `memcached` or `memjs` options is required.
     */
    interface Options {
        /**
         * Memcached client.
         * @see https://www.npmjs.com/package/memcached
         * @see https://www.npmjs.com/package/memcached-lite
         */
        memcached?: MemcachedClient;

        /**
         * MemJS client.
         * https://www.npmjs.com/package/memjs
         */
        memjs?: MemjsClient;

        /**
         * a time interval, in seconds, after which memcached will expire the object.
         */
        expires?: number;

        /**
         * prefix string to prepend to memcached key.
         */
        namespace?: string;

        /**
         * hash digest function to keep memcached keys short.
         */
        hasher?: (key: string) => string;
    }

    /**
     * Memcached module's callback based interface
     * @see node_modules/@types/memcached/index.d.ts
     * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/memcached/index.d.ts
     */

    interface MemcachedClient {
        get(key: string, callback: (err: any, data: any) => void): void;

        set(key: string, value: any, expires: number, callback: (err: any) => void): void;

        del(key: string, callback: (err: any) => void): void;
    }

    /**
     * MemJS module's callback based interface
     * @see node_modules/@types/memjs/index.d.ts
     * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/memjs/index.d.ts
     */

    interface MemjsClient {
        get(key: string, callback: (err: Error, value: any) => void): void;

        set(key: string, value: any, options: { expires?: number }, callback: (err: any) => void): void;

        delete(key: string, callback: (err: Error) => void): void;
    }
}
