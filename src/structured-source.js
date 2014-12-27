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

import { upperBound } from 'boundary';

export class Position {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }
}

export class SourceLocation {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

/**
 * StructuredSource
 * @class
 */
export default class StructuredSource {
    /**
     * @constructs StructuredSource
     * @param {string} source - source code text.
     */
    constructor(source) {
        this.indice = [ 0 ];
        let regexp = /[\r\n\u2028\u2029]/g;
        let length = source.length;
        regexp.lastIndex = 0;
        while (true) {
            let result = regexp.exec(source);
            if (!result) {
                break;
            }
            let index = result.index;
            if (source.charCodeAt(index) === 0x0D  /* '\r' */ &&
                    source.charCodeAt(index + 1) === 0x0A  /* '\n' */) {
                index += 1;
            }
            let nextIndex = index + 1;
            // If there's a last line terminator, we push it to the indice.
            // So use < instead of <=.
            if (length < nextIndex) {
                break;
            }
            this.indice.push(nextIndex);
            regexp.lastIndex = nextIndex;
        }
    }

    get line() {
        return this.indice.length;
    }

    /**
     * @param {SourceLocation} loc - location indicator.
     * @return {[ number, number ]} range.
     */
    locationToRange(loc) {
        return [ this.positionToIndex(loc.start), this.positionToIndex(loc.end) ];
    }

    /**
     * @param {[ number, number ]} range - pair of indice.
     * @return {SourceLocation} location.
     */
    rangeToLocation(range) {
        return new SourceLocation(this.indexToPosition(range[0]), this.indexToPosition(range[1]));
    }

    /**
     * @param {Position} pos - position indicator.
     * @return {number} index.
     */
    positionToIndex(pos) {
        // Line number starts with 1.
        // Column number starts with 0.
        let start = this.indice[pos.line - 1];
        return start + pos.column;
    }

    /**
     * @param {number} index - index to the source code.
     * @return {Position} position.
     */
    indexToPosition(index) {
        let startLine = upperBound(this.indice, index);
        return new Position(startLine, index - this.indice[startLine - 1]);
    }
};

/* vim: set sw=4 ts=4 et tw=80 : */
