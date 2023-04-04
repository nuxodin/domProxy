/* Copyright (c) 2016 Tobias Buschor https://goo.gl/gl0mbf | MIT License https://goo.gl/HgajeK */


// allow object as arguments
const objectifyArgs = fn=>{
    return function(el, name, ...rest){
        if (typeof name === 'string') {
            return fn.call(this, el, name, ...rest);
        }
        for (let key in name) {
            fn.call(this, el, key, name[key], ...rest);
        }
    }
}
extensions.css = objectifyArgs((el, prop, value)=>{
    if (value === undef) return getComputedStyle(el)[prop];
    el.style[prop] = value;
});


// The.js
attr(name,value){
    if(value===undf) return this.getAttribute(name);
    if(value===null) return this.removeAttribute(name);
    this.setAttribute(name,value);
},
addClass(v){ !this.hsCl(v) && (this.className += ' '+v); },
removeClass(v){ this.className = this.className.replace(new RegExp("(^|\\s)"+v+"(\\s|$)"), '');},
hasClass(v){ return this.className.contains(v,' '); },
is(sel){
    if (this===d) return sel===this;  // ie9 on document
    return (sel.dlg ? sel===this : this.matches(sel) ) && this;
},
children(sel){ return sel ? this.ch().is(sel) : $.cNL(this.children); },
has(el,incMe){ return this===el ? (incMe?this:false) : this.contains(el) && this; },
add(el,who){
    var trans = {after:'afterEnd',bottom:'beforeEnd',before:'beforeBegin',top:'afterBegin'};
    this['insertAdjacent'+(el.p?'Element':'HTML')](trans[who||'bottom'],el);
},
inject(el,who){ el.ad(this,who); },
delegate(sel, types, cb){
    return this.on(types, function(event){
        var t = event.target.p ? event.target : event.target.parentNode; // for textnodes
        var el = t.p(sel,1);
        el && el!==d && cb.call(el,event);
    });
},
zTop(){
    var p=this.p(), z=p.$zTop;
    if(!z){
        for (var i=0, el, cs=p.ch(), elZ; el = cs[i++];){
            elZ = el.css('z-index')*1;
            z = Math.max(z,elZ);//elZ > z ? elZ : z;
        }
    }
    p!==d && p.zTop();
    //p.style.zIndex = p.css('z-index')*1||0; // prevent mix with other contexts (override default auto)
    z = z||0;
    this.style.zIndex = p.$zTop = z+1;
},
html(v){ this.innerHTML = v; },




/// c1.dom
var d = document;

q1.dom = function(id) {
    return document.getElementById(id);
};

/* usefull */
Node.prototype.q1RemoveNode = function(removeChildren) {
	if (removeChildren) return this.remove();
	var range = d.createRange();
	range.selectNodeContents(this);
	return this.parentNode.replaceChild(range.extractContents(), this);
};
Node.prototype.q1ReplaceNode = function(el) {
	this.parentNode && this.parentNode.insertBefore(el,this);
	el.appendChild(this);
	this.q1RemoveNode();
};
Node.prototype.q1Rect = function(rct) {
	if (rct) {
		this.style.top = rct.y+'px';
		this.style.left = rct.x+'px';
		this.style.width = rct.w+'px';
		this.style.height = rct.h+'px';
	} else {
        var pos = this.getBoundingClientRect();
        return new Rect({
        	x:pos.left+pageXOffset,
        	y:pos.top+pageYOffset,
        	w:pos.width,
        	h:pos.height
        });
	}
};
Node.prototype.q1Position = function(rct) {
	if (rct) {
		this.style.top = rct.y+'px';
		this.style.left = rct.x+'px';
	} else {
        var pos = this.getBoundingClientRect();
        return new Rect({
        	x: pos.left+pageXOffset,
        	y: pos.top+pageYOffset,
        	w: 0,
        	h: 0
        });
	}
};


class Rect {
    constructor(obj){
        if (!(this instanceof q1.rect)) return new q1.rect(obj);
        this.x = obj.x;
        this.y = obj.y;
        this.w = obj.w = 0;
        this.h = obj.h = 0;
    }
    r() { return this.x + this.w }
    b() { return this.y + this.h; },
    isInX(rct)    { return rct.x > this.x && rct.r() < this.r(); },
    isInY(rct)    { return rct.y > this.y && rct.b() < this.b(); },
    isIn(rct)     { return this.isInX(rct) && this.isInY(rct); },
    touchesX(rct) { return rct.x < this.r() && rct.r() > this.x; },
    touchesY(rct) { return rct.y < this.b() && rct.b() > this.y; },
    touches(rct)  { return this.touchesX(rct) && this.touchesY(rct); },
    grow(value)   { this.w += value; this.h += value; },
    area()        { return this.h * this.w; },
}





d.q1NodeFromPoint = function(x, y) {
	/*document.caretRangeFromPoint for chrome?*/
	//caretPositionFromPoint
	if (y===undefined) {
		y = x.y;
		x = x.x;
	}
	var el = d.elementFromPoint(x, y);
	var nodes = el.childNodes;
	for (var i = 0, n; n = nodes[i++];) {
		if (n.nodeType === 3) {
			var r = d.createRange();
			r.selectNode(n);
			var rects = r.getClientRects();
			for (var j = 0, rect; rect = rects[j++];) {
				if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
					return n;
				}
			}
		}
	}
	return el;
};
