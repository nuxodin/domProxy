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
        // first check if prop exists in the "Set" (keys, forEach..., size)
        if (prop in elements) return typeof elements[prop] === 'function' ? elements[prop].bind(elements) : elements[prop];
        // then check an extended method
        if (extensions[prop]) {
            return function(...args){
                return returnFromElements(this, elements, element=>extensions[prop](element, ...args))
            }
        }
        // then check if its a property from the elements
        let first = elements.values().next().value;
        if (!first) return null;
        if (typeof first[prop] === 'function') { // better ask the htmlElement-prototype if it should be function?
            return function(...args){
                return returnFromElements(this, elements, element=>{
                    return element[prop].apply(element, args);
                })
            }
        }
        return returnFromElements(this, elements, element=>element[prop]);
    },
    set(elements, prop, value){
        for (let element of elements) element[prop] = value;
        return true;
    }
}

/*
const callOnElementsSet = {
    [Symbol.iterator]:1,
    'forEach':1,
};
*/


function returnFromElements(proxy, elements, call) {
    let retIsDefined = true;
    const returns = new Set();
    for (let element of elements) {
        const value = call(element);
        if (value === undefined) {
            retIsDefined = false;
        } else if (typeof value === 'string') { // add items if it is iterable
            return value;
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
}

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
    on(el, types, listener, options){
        for (let type of types.split(/\s/)) {
            el.addEventListener(type, listener, options);
        }
    },
    off(el, types, listener, options){
        for (let type of types.split(/\s/)) {
            el.removeEventListener(type, listener, options);
        }
    },
    //trigger(el, type options){ // todo should i default to bubble?
    //    const event = new CustomEvent(type, options);
    //    el.dispatchEvent(event);
    //},
    ensureId(el){
        return el.id ?? (el.id = 'gen-'+Math.random().toString(36).substr(2, 8));
    },
}

export default domProxy;

/* old code, for inspirations
The = function(){
    var undf, k, d=document, w=self
    ,Ext = {
        Function:{
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
    $.cEl = function(tag){ return d.createElement(tag); };
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
        dlg(sel, types, cb){
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
    });

    on(vendor+'TransitionEnd',function(e){ e.target.fire('transitionend',e) });
    on('DOMMouseScroll',function(e){ e.wheelDelta = -e.detail*40; e.target.fire('mousewheel',e) }); // firefox?

}();

*/
