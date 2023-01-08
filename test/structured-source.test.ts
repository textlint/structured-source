/*
  Copyright (C) 2014 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import { StructuredSource } from '../src/structured-source'
import assert from 'assert/strict'

describe('StructuredSource', () => {
    it('constructor', () => {
        {
            const src = new StructuredSource('');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0]);
            assert.strictEqual(src.line , 1);
        }

        {
            const src = new StructuredSource('\n');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0, 1]);
            assert.strictEqual(src.line , 2);
        }

        {
            const src = new StructuredSource('\r\n');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0, 2]);
            assert.strictEqual(src.line , 2);
        }

        {
            const src = new StructuredSource('\n\r');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0, 1, 2]);
            assert.strictEqual(src.line , 3);
        }

        {
            const src = new StructuredSource('aaa\naaaa\raaaaa');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0, 4, 9]);
            assert.strictEqual(src.line , 3);
        }

        {
            const src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
            // @ts-expect-error: for testing
            assert.deepEqual(src.indice, [0, 4, 9, 15]);
            assert.strictEqual(src.line , 4);
        }
    });

    it('positionToIndex', () => {
        {
            const src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
            assert(src.positionToIndex({ line: 1, column: 2 }) === 2);
            assert(src.positionToIndex({ line: 2, column: 2 }) === 6);
            assert(src.positionToIndex({ line: 2, column: 5 }) === 9);  // out of source column is calculated.
            assert(src.positionToIndex({ line: 3, column: 0 }) === 9);
            assert(src.positionToIndex({ line: 4, column: 0 }) === 15);
            assert(src.positionToIndex({ line: 4, column: 10 }) === 25);
            assert(isNaN(src.positionToIndex({ line: 5, column: 10 })));  // out of source line is calculated as NaN.
        }
    });

    it('indexToPosition', () => {
        {
            const src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
            assert.deepEqual(src.indexToPosition(2), { line: 1, column: 2 });
            assert.deepEqual(src.indexToPosition(6), { line: 2, column: 2 });
            assert.deepEqual(src.indexToPosition(9), { line: 3, column: 0 });
            assert.deepEqual(src.indexToPosition(15), { line: 4, column: 0 });
            assert.deepEqual(src.indexToPosition(25), { line: 4, column: 10 });
            assert.deepEqual(src.indexToPosition(30), { line: 4, column: 15 });
            assert.deepEqual(src.indexToPosition(0), { line: 1, column: 0 });
        }

        {
            const src = new StructuredSource('');
            assert.deepEqual(src.indexToPosition(2), { line: 1, column: 2 });
            assert.deepEqual(src.indexToPosition(6), { line: 1, column: 6 });
            assert.deepEqual(src.indexToPosition(0), { line: 1, column: 0 });
        }
    });

    it('rangeToLocation', () => {
        {
            const src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
            assert.deepEqual(src.rangeToLocation([0, 2]), {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 2 }
            });
            assert.deepEqual(src.rangeToLocation([0, 45]), {
                start: { line: 1, column: 0 },
                end: { line: 4, column: 30 }
            });
        }
        {
            const src = new StructuredSource('');
            assert.deepEqual(src.rangeToLocation([0, 2]), {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 2 }
            });
        }
    });

    it('locationToRange', () => {
        {
            const src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
            assert.deepEqual(src.locationToRange({
                start: { line: 1, column: 0 },
                end: { line: 1, column: 2 }
            }), [0, 2]);
            assert.deepEqual(src.locationToRange({
                start: { line: 1, column: 0 },
                end: { line: 4, column: 30 }
            }), [0, 45]);
        }
        {
            const src = new StructuredSource('');
            assert.deepEqual(src.locationToRange({
                start: { line: 1, column: 0 },
                end: { line: 1, column: 2 }
            }), [0, 2]);
        }
    });
});

/* vim: set sw=4 ts=4 et tw=80 : */
