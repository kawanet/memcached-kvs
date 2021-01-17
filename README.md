# memcached-kvs

[![Node.js CI](https://github.com/kawanet/memcached-kvs/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/memcached-kvs/actions/)
[![npm version](https://badge.fury.io/js/memcached-kvs.svg)](https://www.npmjs.com/package/memcached-kvs)

Promise based interface for memcached key-value storage.

## SYNOPSIS

Text storage with [Memcached](https://www.npmjs.com/package/memcached)
or [memcached-lite](https://www.npmjs.com/package/memcached-lite) module.

```js
const Memcached = require("memcached");
const textKVS = require("memcached-kvs").textKVS;

const memcached = new Memcached("localhost:11211");
const kvs = textKVS({memcached: memcached, namespace: "ns:", expires: 300});

await kvs.set("foo", "FOO");
const text = await kvs.get("foo");
await kvs.delete("foo");

memcached.end();
```

Buffer storage with [MemJS](https://www.npmjs.com/package/memjs) module.

```js
const Memjs = require("memjs");
const bufferKVS = require("memcached-kvs").bufferKVS;

const memjs = new Memjs("localhost:11211");
const kvs = bufferKVS({memjs: memjs, namespace: "ns:", expires: 300});

await kvs.set("bar", Buffer.from("BAR"));
const buffer = await kvs.get("BAR");
await kvs.delete("bar");

memjs.close();
```

See TypeScript declaration
[memcached-kvs.d.ts](https://github.com/kawanet/memcached-kvs/blob/main/types/memcached-kvs.d.ts)
for more detail.

## BENCHMARK

`memcached-kvs` does not include a brand new
[Memcached protocol](https://github.com/memcached/memcached/wiki/Protocols)
client with itself.
It provides `Promsie` interface for other existing Memcached client modules.
Note that MemJS looks faster than other modules.

| Engine | string | Buffer |
|---|---|---|
| this + [Memcached](https://www.npmjs.com/package/memcached) |52,927ms|54,559ms|
| this + [memcached-lite](https://www.npmjs.com/package/memcached-lite) |51,107ms|51,594ms|
| this + [MemJS](https://www.npmjs.com/package/memjs) |50,951ms|48,713ms|
| [KeyV](https://www.npmjs.com/package/keyv) + [Keyv-Memcache](https://github.com/jaredwray/keyv-memcache) |54,090ms|56,972ms|

Above shows milliseconds to perform 50,000 operations of 
10% `set()`, 80% `get()` and 10% `delete()` methods
toward a memcached server running in `localhost`.

```sh
git clone https://github.com/kawanet/memcached-kvs.git
cd memcached-kvs
npm install
./node_modules/.bin/tsc -p .
docker run -d -p 11211:11211 --name memcached memcached
MEMCACHE_SERVERS=localhost:11211 REPEAT=1000 test/99.benchmark.js
```

## LINKS

- https://github.com/kawanet/memcached-kvs
- https://www.npmjs.com/package/memcached-kvs

## MIT LICENSE

Copyright (c) 2021 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
