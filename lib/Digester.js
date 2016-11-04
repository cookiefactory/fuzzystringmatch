"use strict"

var debug = require('debug')

var Subject = require('./Subject')
var splitter = require('./tools/splitter')
var prepareTerm = require('./tools/prepareTerm')
var defaultSplitterConfig = require('./tools/defaultSplitterConfig')

class Digester {
    constructor (configuration) {
        this._chunks = new Map()
        this._index = new Map()
        this._configuration = configuration || {splitter: defaultSplitterConfig}
        this._debug = debug('fuzzystringmatch:digester')
    }

    /**
     * accepts String or a Subject instance
     * @param subject Subject|String
     */
    feed (subject) {
        if (!(subject instanceof Subject)) {
            subject = new Subject(subject)
        }

        var term = prepareTerm(subject.getTerm())
        splitter(term, this._configuration.splitter)
            .map((snippet) => {
                if (!this._chunks.has(snippet)) {
                    this._chunks.set(snippet, new Subject(snippet))
                }

                return this._chunks.get(snippet)
            })
            .forEach((chunk) => {
                subject.addChunk(chunk)

                if (!this._index.has(chunk)) {
                    this._index.set(chunk, new Set())
                }
                this._index.get(chunk).add(subject)
            })
    }

    getChunks() {
        return this._chunks
    }

    getIndex() {
        return this._index
    }

    clear() {
        this._index = new Map()
        this._chunks = new Map()
    }
}

module.exports = Digester