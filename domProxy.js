{
    window.domProxy = arg => {
        const list = new Set(
            arg instanceof Node
                ? [arg]
                : typeof arg === 'string'
                    ? (arg[0] === '<' ? strToDom(arg) : d.querySelectorAll(arg))
                    : arg
        );
        return new Proxy(list, handler);
    }

    const undef = void 0;
    const d = document;
    const strToDom = str => {
        const el = d.createElement('template');
        el.innerHTML = str;
        return el.content.childNodes;
    }
    const handler = {
        get(elements, prop){
console.log(prop)
            // first check if prop exists in the "Set" (keys, forEach, size, add, ...)
            if (prop in elements) {
                let property = elements[prop]
                return typeof property === 'function' ? property.bind(elements) : property;
            }
            // then check if an extended property exists
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

    const returnFromElements = (proxy, elements, call)=>{
        const returns = new Set();
        let returnsUndefined = false;
        for (let element of elements) {
            const value = call(element);
            if (typeof value === 'string') return value; // if its a string return from first element
            if (value === undef) { // chain if return value is undefined
                returnsUndefined = true;
            } else if (typeof value[Symbol.iterator] === 'function') { // add items if it is iterable
                for (let item of value) returns.add(item);
            } else if (value instanceof Node) { // add items if its node
                returns.add(value);
            } else {
                return value; // if others, return value from first element
            }
        }
        if (returnsUndefined) return proxy;
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
        nextAll  :(el, sel, incMe) => walkGen(el, 'nextElementSibling', sel, incMe),
        prevAll  :(el, sel, incMe) => walkGen(el, 'previousElementSibling', sel, incMe) ,
        parentAll:(el, sel, incMe) => walkGen(el, 'parentNode', sel, incMe) ,
        next(...args)  { return this.nextAll(...args).next().value },
        prev(...args)  { return this.prevAll(...args).next().value },
        parent(...args){ return this.parentAll(...args).next().value },
        ensureId:(el) => el.id ?? (el.id = 'gen-'+Math.random().toString(36).substr(2, 8)),
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
        trigger(el, type, options={}){
            if(options.bubbles===undef) options.bubbles = true; // default bubbles
            //options = {...{bubbles:true}, ...options};
            el.dispatchEvent(new CustomEvent(type, options));
        },
        css(el, prop, value){
            if (value === undef) return getComputedStyle(el)[prop];
            el.style[prop] = value;
        },
    }

    /* // allow object as arguments
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
    */

    /* old code, for inspirations
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

    */

}

export default domProxy;
