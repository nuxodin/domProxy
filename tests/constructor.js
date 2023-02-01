import $ from '../domProxy.js';

describe('constructor single element', function () {
    const body = document.body;
    it('first entry should be the element', function () {
        let domProxy = $(body);
        chai.expect(domProxy.values().next().value).to.equal(body);
    });
    it('size should be 1', function () {
        const body = document.body;
        let domProxy = $(body);
        chai.expect(domProxy.size).to.equal(1);
    });
});

describe('constructor html content', function () {
    it('first element should be "TR"', function () {
        let domProxy = $('<tr>');
        chai.expect(domProxy.values().next().value.tagName).to.equal('TR');
    });
    it('first element should be "svg', function () {
        let domProxy = $('<svg>');
        chai.expect(domProxy.values().next().value.tagName).to.equal('svg');
    });
    it('should have 2 elements', function () {
        let domProxy = $('<td>1<td>2');
        let size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('should have 3 elements (one textnode)', function () {
        let domProxy = $('<br>text<br>');
        let size = domProxy.size;
        chai.expect(size).to.equal(3);
    });
});

describe('constructor selector', function () {
    it('selector ":root', function () {
        let domProxy = $(':root');
        chai.expect(domProxy.values().next().value).to.equal(document.documentElement);
    });
});


describe('constructor nodeLists', function () {
    it('htmlCollection works (.children)', function () {
        let domProxy = $(document.documentElement.children);
        let size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('nodeList works (qurySelectorAll)', function () {
        let domProxy = $(document.documentElement.querySelectorAll('head, body'));
        let size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
    it('array works', function () {
        let domProxy = $([document.body, document.head]);
        console.log(domProxy)
        let size = domProxy.size;
        chai.expect(size).to.equal(2);
    });
});

describe('constructor Set', function () {
    it('ensure a clone is not a reference', function () {
        let original = $('body')
        let clone = $(original);
        original.add(document.head);
        chai.expect(clone.size).to.equal(1);
        chai.expect(original.size).to.equal(2);
    });
});
