import $ from '../domProxy.js';

describe('getters primitives', function () {
    it('getter className on singel element', function () {
        document.body.className = 'test4';
        chai.expect($('body').className).to.equal('test4');
    });
    it('getter on multiple elements (first should be returned)', function () {
        $('head').className = 'test_33';
        chai.expect($('head, body').className).to.equal('test_33');
    });
    it('getter on void list should be null?', function () {
        chai.expect($('.doesNotExists').className).to.equal(null);
    });
    it('ensureId()', function () {
        const genId = $('body').ensureId();
        chai.expect(genId).to.not.equal('');
        chai.expect(document.body.id).to.equal(genId);
    });
});

describe('getters methods', function () {
});


describe('getters extended', function () {
});
