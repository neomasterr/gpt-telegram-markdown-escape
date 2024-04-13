function MarkdownTokenizer() {
    //
}

MarkdownTokenizer.prototype.parse = function (value) {
    this.value = value;
    this.slice = null;
    this.position = 0;
    this.tokens = [];
    this.flush();

    while (!this.eof()) {
        if (this.peek(3) == '```') {
            this.flushPlain();
            this.parseCodeBlock();
        } else if (this.peek(1) == '`') {
            this.flushPlain();
            this.parseInlineCode();
        } else {
            this.consume(1);
        }
    }

    this.flushPlain();

    return this.tokens;
}

MarkdownTokenizer.prototype.flushPlain = function () {
    this.flushToken('plain');
}

MarkdownTokenizer.prototype.flushToken = function (type, open = '', close = '') {
    if (this.buffer.length) {
        this.tokens.push({type, value: this.flush(), open, close});
    }
}

MarkdownTokenizer.prototype.consumeRegexp = function (regexp) {
    let consumed = '';

    while (regexp.test(this.slice)) {
        consumed += this.consume(1);
    }

    return consumed;
}


MarkdownTokenizer.prototype.consumeLine = function () {
    let consumed = '';

    while (!this.eof()) {
        consumed += this.consume(1);

        if (this.slice == "\n") {
            break;
        }
    }

    return consumed;
}

MarkdownTokenizer.prototype.word = function () {
    return this.consumeRegexp(/[/w]/);
}

MarkdownTokenizer.prototype.forward = function () {
    this.consumeRegexp(/[\n\t\s]/);
}

MarkdownTokenizer.prototype.consume = function (count = 1) {
    this.buffer += this.slice = this.value.slice(this.position, this.position + count);
    this.position += count;

    return this.slice;
}

MarkdownTokenizer.prototype.flush = function () {
    const buffer = this.buffer;
    this.buffer = '';

    return buffer;
}

MarkdownTokenizer.prototype.peek = function (count = 1) {
    return this.value.slice(this.position, this.position + count);
}

MarkdownTokenizer.prototype.eof = function () {
    return this.position >= this.value.length;
}

MarkdownTokenizer.prototype.parseCodeBlock = function () {
    const open = this.consumeLine();
    const close = '```';

    while (!this.eof()) {
        if (this.peek(3) != close) {
            this.consume(1);
            continue;
        }

        this.consume(3);
        break;
    }

    if (this.buffer.slice(-3) != close) {
        this.buffer += close;
    }

    this.flushToken('code', open, close);
}

MarkdownTokenizer.prototype.parseInlineCode = function () {
    const open = '`';
    const close = open;
    this.consume(1);

    while (!this.eof()) {
        if (this.peek(1) == open) {
            this.consume(1);
            break;
        }

        this.consume(1);
    }

    if (this.buffer.slice(-1) != close) {
        this.buffer += close;
    }

    this.flushToken('inline-code', open, close);
}

const escape = (value, pattern = /([*_\(\)\[\]])/g) => {
    if (!MarkdownTokenizer.instance) {
        MarkdownTokenizer.instance = new MarkdownTokenizer();
    }

    return MarkdownTokenizer.instance
        .parse(value)
        .map(token => {
            if (token.type != 'plain') {
                return token.value;
            }

            return token.value.replace(pattern, '\\$1');
        })
        .join('')
    ;
}

export {MarkdownTokenizer};
export default escape;
