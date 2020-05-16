import $ from '../domProxy.js';

describe('setter', function () {
    const body = document.body;
    it('setting className on singel element', function () {
        $(body).className = 'test';
        chai.expect(body.className).to.equal('test');
    });
    it('setting className on multiple elements', function () {
        $('body, head').className = 'test2';
        chai.expect(document.body.className).to.equal('test2');
        chai.expect(document.head.className).to.equal('test2');
    });
    it('setting multiple events', function () {
        var listener = function(){ };
        $('body, head').onmouseover = listener;
        chai.expect(document.body.onmouseover).to.equal(listener);
        chai.expect(document.head.onmouseover).to.equal(listener);
    });
    it('setting on void list', function () {
        $('.doesnotExists').classList = 'xyz';
    });
});

