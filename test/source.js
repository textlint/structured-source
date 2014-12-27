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

import * as StructuredSource from '../'
import * as assert from 'power-assert'

describe('StructuredSource', () => {
        it('constructor', () => {
            {
                let src = new StructuredSource('');
                assert.deepEqual(src.indice, [ 0 ]);
                assert(src.line === 1);
            }

            {
                let src = new StructuredSource('\n');
                assert.deepEqual(src.indice, [ 0, 1 ]);
                assert(src.line === 2);
            }

            {
                let src = new StructuredSource('\r\n');
                assert.deepEqual(src.indice, [ 0, 2 ]);
                assert(src.line === 2);
            }

            {
                let src = new StructuredSource('\n\r');
                assert.deepEqual(src.indice, [ 0, 1, 2 ]);
                assert(src.line === 3);
            }

            {
                let src = new StructuredSource('aaa\naaaa\raaaaa');
                assert.deepEqual(src.indice, [ 0, 4, 9 ]);
                assert(src.line === 3);
            }

            {
                let src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
                assert.deepEqual(src.indice, [ 0, 4, 9, 15 ]);
                assert(src.line === 4);
            }
        });

        it('locToRange', () => {
            {
                let src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
                assert(src.locToRange({ line: 1, column: 2 }) === 2);
                assert(src.locToRange({ line: 2, column: 2 }) === 6);
                assert(src.locToRange({ line: 2, column: 5 }) === 9);  // out of source column is calculated.
                assert(src.locToRange({ line: 3, column: 0 }) === 9);
                assert(src.locToRange({ line: 4, column: 0 }) === 15);
                assert(src.locToRange({ line: 4, column: 10 }) === 25);
                assert(isNaN(src.locToRange({ line: 5, column: 10 })));  // out of source line is calculated as NaN.
            }
        });

        it('indexToLoc', () => {
            {
                let src = new StructuredSource('aaa\u2028aaaa\u2029aaaaa\n');
                assert.deepEqual(src.indexToLoc(2), { line: 1, column: 2 });
                assert.deepEqual(src.indexToLoc(6), { line: 2, column: 2 });
                assert.deepEqual(src.indexToLoc(9), { line: 3, column: 0 });
                assert.deepEqual(src.indexToLoc(15), { line: 4, column: 0 });
                assert.deepEqual(src.indexToLoc(25), { line: 4, column: 10 });
                assert.deepEqual(src.indexToLoc(30), { line: 4, column: 15 });
                assert.deepEqual(src.indexToLoc(0), { line: 1, column: 0 });
            }

            {
                let src = new StructuredSource('');
                assert.deepEqual(src.indexToLoc(2), { line: 1, column: 2 });
                assert.deepEqual(src.indexToLoc(6), { line: 1, column: 6 });
                assert.deepEqual(src.indexToLoc(0), { line: 1, column: 0 });
            }
        });
});

/* vim: set sw=4 ts=4 et tw=80 : */
