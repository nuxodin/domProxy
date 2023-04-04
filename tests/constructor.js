import $ from '../domProxy.js';

describe('constructor single element', function () {
    const body = document.body;
    it('first entry should be the element', function () {
        const domProxy = $(body);
        chai.expect(domProxy.values().next().value).to.equal(body);
    });
    it('size should be 1', function () {
        const body = document.body;
        const domProxy = $(body);
        chai.expect(domProxy.size).to.equal(1);
    });
});

describe('constructor html content', function () {
    it('first element should be "TR"', function () {
        const domProxy = $('<tr>');
        chai.expect(domProxy.values().next().value.tagName).to.equal('TR');
    });
    it('first element should be "svg', function () {
        const domProxy = $('<svg>');
        chai.expect(domProxy.values().next().value.tagName).to.equal('svg');
    });
    it('should have 2 elements', function () {
        const domProxy = $('<td>1<td>2');
        const size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('should have 3 elements (one textnode)', function () {
        const domProxy = $('<br>text<br>');
        const size = domProxy.size;
        chai.expect(size).to.equal(3);
    });
});

describe('constructor selector', function () {
    it('selector ":root', function () {
        const domProxy = $(':root');
        chai.expect(domProxy.values().next().value).to.equal(document.documentElement);
    });
});


describe('constructor nodeLists', function () {
    it('htmlCollection works (.children)', function () {
        const domProxy = $(document.documentElement.children);
        const size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('nodeList works (qurySelectorAll)', function () {
        const domProxy = $(document.documentElement.querySelectorAll('head, body'));
        const size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('array works', function () {
        const domProxy = $([document.body, document.head]);
        const size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
});

describe('constructor Set', function () {
    it('ensure a clone is not a reference', function () {
        const original = $('body')
        const clone = $(original);
        original.add(document.head);
        chai.expect(clone.size).to.equal(1);
        chai.expect(original.size).to.equal(2);
    });
});
