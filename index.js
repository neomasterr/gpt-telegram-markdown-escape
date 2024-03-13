function MarkdownTokenizer() {
    //
}

MarkdownTokenizer.prototype.parse = function (value) {
    this.value = value;
    this.char = null;
    this.position = 0;
    this.tokens = [];
    this.flush();

    while (!this.eof()) {
        if (this.position == 0 && this.peek(3) == '```') {
            this.flushPlain();
            this.parseCodeBlock();
        } else if (this.position != 0 && this.peek(4) == "\n```") {
            this.consume(1);
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

MarkdownTokenizer.prototype.flushToken = function (type) {
    if (this.buffer.length) {
        this.tokens.push({type, value: this.flush()});
    }
}

MarkdownTokenizer.prototype.consumeRegexp = function (regexp) {
    while (regexp.test(this.char)) {
        this.consume(1);
    }
}

MarkdownTokenizer.prototype.word = function () {
    return this.consumeRegexp(/[/w]/);
}

MarkdownTokenizer.prototype.forward = function () {
    this.consumeRegexp(/[\n\t\s]/);
}

MarkdownTokenizer.prototype.consume = function (count = 1) {
    this.buffer += this.char = this.value.slice(this.position, this.position + count);
    this.position += count;

    return this.char;
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
    this.consume(3);

    while (!this.eof()) {
        if (this.peek(4) == "\n```") {
            this.consume(4);
            break;
        } else if (this.peek(3) == '```') {
            this.consume(3);
        } else {
            this.consume(1);
        }
    }

    this.flushToken('code');
}

MarkdownTokenizer.prototype.parseInlineCode = function () {
    this.consume(1);

    while (!this.eof()) {
        if (this.peek(1) == '`') {
            this.consume(1);
            break;
        }

        this.consume(1);
    }

    this.flushToken('inline-code');
}

const escape = (value, pattern = /([_\(\)\[\]])/g) => {
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
