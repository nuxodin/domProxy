const d = document;

function domProxy (arg) {
    const list = new Set(
        arg instanceof Node
            ? [arg]
            : typeof arg === 'string'
                ? (arg[0] === '<' ? strToDom(arg) : d.querySelectorAll(arg))
                : arg
    );
    return new Proxy(list, handler);
}

const strToDom = str => {
    const el = d.createElement('template');
    el.innerHTML = str;
    return el.content.childNodes;
}

const handler = {
    get(elements, prop){
        if (callOnElementsSet[prop]) return elements[prop].bind(elements);
        if (prop === 'elements') return [...elements];
        if (extensions[prop]) {
            return function(...args){
                return returnFromElements(this, elements, element=>extensions[prop](element, ...args))
            }
        }
        let first = elements.values().next().value;
        if (!first) return null;
        if (typeof first[prop] === 'function') {
        //if (typeof HTMLElement.prototype[prop] === 'function') { // better ask the prototype if it should be function?
            return function(...args){
                return returnFromElements(this, elements, element=>{
                    return element[prop].apply(element, args);
                })
            }
        } else {
            return returnFromElements(this, elements, element=>element[prop]);
        }
        // else return elements[prop].bind(elements); // todo if not in prototype? props of the elements-set
    },
    set(elements, prop, value){
        for (let element of elements) element[prop] = value;
        return true;
    }
}

const callOnElementsSet = {
    [Symbol.iterator]:1,
    'forEach':1,
};


function returnFromElements(proxy, elements, call) {
    let retIsDefined = true;
    const returns = new Set();
    for (let element of elements) {
        const value = call(element);
        if (value === undefined) {
            retIsDefined = false;
        } else if (typeof value[Symbol.iterator] === 'function') { // add items if it is iterable
            for (let item of value) returns.add(item);
        } else if (value instanceof Node) { // add items if its node
            returns.add(value);
        } else {
            return value;
        }
    }
    if (!retIsDefined) return proxy; // chain if return value is undefined
    return domProxy(returns);
}

function *walkGen(el, operation, selector, incMe){
    if (!incMe) el = el[operation];
    while (el) {
        if (selector) {
            if (el.matches(selector)) yield el;
        } else {
            yield next;
        }
        el = el[operation];
    }
};

const extensions = {
    //first(el, sel) { const node = el.firstElementChild; return sel ? node && this.next(node, sel, true) : node; },
    //last(el, sel)  { const node = el.lastElementChild;  return sel ? node && this.prev(node, sel, true) : node; },
    nextAll  :(el, sel, incMe) => walkGen(el, 'nextElementSibling', sel, incMe),
    prevAll  :(el, sel, incMe) => walkGen(el, 'previousElementSibling', sel, incMe) ,
    parentAll:(el, sel, incMe) => walkGen(el, 'parentNode', sel, incMe) ,
    next(...args)  { return this.nextAll(...args).next().value },
    prev(...args)  { return this.prevAll(...args).next().value },
    parent(...args){ return this.parentAll(...args).next().value },
    //childs(el, selector){ return this.nextAll(el.firstElementChild, selector, true) },
}

export default domProxy;

/* old code, for inspirations
The = function(){
    var undf, k, d=document, w=self
    ,Ext = {
        Function:{
            chained(){ // if function returns undefined, it now returns "this"
                var fn = this;
                return function(){
                    var ret = fn.apply(this,arguments);
                    return ret===undf?this:ret;
                };
            },
            each(retConst){ // make a funktion that calls itself for every properties of its instance
                var fn = this;
                return function(){
                    var ret = retConst ? new retConst : [], i=0, el, v;
                    while(el=this[i++]){ // return this.map(fn.args(arguments)) ??
                        v = fn.apply(el,arguments);
                        v && ret.push(v);
                    };
                    return ret;
                };
            },
            multi(){
                var fn = this;
                return function(a,b){
                    if(b === undf && typeof a == 'object'){
                        for(var i in a)
                            if(a.hasOwnProperty(i))
                                fn.call(this,i,a[i]);
                        return;
                    }
                    return fn.apply(this,arguments);
                }
            },
            args(){ // make a function with defined Arguments
                var fn = this, args = arguments;
                return function(){
                    fn.apply(this,args);
                };
            }
        },
    };

    function $(n){ return n.chained ? n($) : ( n.p ? n : d.getElementById(n) ); }
    $.fn = function(v){return v;};
    $.ext = function(target, src){ target=target||{}; for(k in src) target[k]===undf && (target[k] = src[k]); return target; };
    for (k in Ext) { w[k] && $.ext(w[k].prototype,Ext[k]) }

    $.extEl = function(src){
        for (k in src) {
            var fn = src[k].chained();
            window[k] = document[k] = fn;
            w.HTMLElement && (HTMLElement.prototype[k] = fn);
            w.Element && (Element.prototype[k] = fn);

            $.NodeList.prototype[k] =
//          HTMLCollection.prototype[k] = // ie
//          NodeList.prototype[k] =
            fn.each($.NodeList);
        }
    };
    $.NodeList = function(els){
        if(els){
            // els.__proto__ = $.NodeList.prototype; return els;
            for(var i=0,l=els.length;i<l;i++) // this.push.apply(this,els) // working with ff4
                this[i]=els[i]
            this.length = l;
        }
    };
    $.NodeList.prototype = [];
    $.cEl = function(tag){ return d.createElement(tag); };
    $.cNL = function(els){ return new $.NodeList(els); };
    $.extEl({
        css(prop, value){
            if (value === undf) {
                k = getComputedStyle(this,null);
                return (k[prop]||k['-'+vendor+'-'+prop])+'';
            }
            this.style[prop] = this.style['-'+vendor+'-'+prop] = value;
        }.multi(),
        attr(name,value){
            if(value===undf) return this.getAttribute(name);
            if(value===null) return this.removeAttribute(name);
            this.setAttribute(name,value);
        }.multi(),
        adCl(v){ !this.hsCl(v) && (this.className += ' '+v); },
        rmCl(v){ this.className = this.className.replace(new RegExp("(^|\\s)"+v+"(\\s|$)"), '');},
        hsCl(v){ return this.className.contains(v,' '); },
        els(sel){ return $.cNL(this.querySelectorAll(sel)); },
        el(sel){ return this.querySelector(sel); },
        is(sel){
            if (this===d) return sel===this;  // ie9 on document
            return (sel.dlg ? sel===this : this.matches(sel) ) && this;
        },
        ch(sel){ return sel ? this.ch().is(sel) : $.cNL(this.children); },
        hs(el,incMe){ return this===el ? (incMe?this:false) : this.contains(el) && this; },
        ad(el,who){
            var trans = {after:'afterEnd',bottom:'beforeEnd',before:'beforeBegin',top:'afterBegin'};
            this['insertAdjacent'+(el.p?'Element':'HTML')](trans[who||'bottom'],el);
        },
        inj(el,who){ el.ad(this,who); },
        on(ev,cb,useCapture){
            for (var i=0,evs=ev.split(/\s/),x ; x=evs[i++];) {
                this.addEventListener(x, cb, useCapture);
            }
        }.multi(),
        no(ev,cb){
            for (var i=0,evs=ev.split(/\s/),x ; x=evs[i++]; ){
                this.removeEventListener(x, cb, false);
            }
        }.multi(),
        fire(n,ce){
            var e = new CustomEvent(n, {bubbels:true});
            this.dispatchEvent( $.ext(e,ce||{}) );
        },
        one(n,cb){
            var fn = function(e){ cb.call(this,e); this.no(n,fn); }
            this.on(n, fn);
        }.multi(),
        dlg(sel, ev, cb){
            return this.on(ev, function(ev){
                var t = ev.target.p ? ev.target : ev.target.parentNode; // for textnodes
                var el = t.p(sel,1);
                el && el!==d && cb.call(el,ev);
            });
        },
        show(){ this.style.display='block'; },
        hide(){ this.style.display='none'; },
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
    });

    on(vendor+'TransitionEnd',function(e){ e.target.fire('transitionend',e) });
    on('DOMMouseScroll',function(e){ e.wheelDelta = -e.detail*40; e.target.fire('mousewheel',e) }); // firefox?

}();

*/
