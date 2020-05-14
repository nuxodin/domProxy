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
    $.cEl = function(tag){ return d.createElement(tag); }
    $.cNL = function(els){ return new $.NodeList(els); }
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
        _walk(operation,sel,incMe,un){
            return incMe && this.is(sel) ? un  : (un=this[operation]) && ( sel ? un._walk(operation,sel,1) : un ); 
        },
        fst(sel, n){ n = this.firstElementChild; return sel ? n && n.nxt(sel,1) : n; },
        lst(sel, n){ n = this.lastElementChild;  return sel ? n && n.prv(sel,1) : n; },
        prv(sel,incMe){ return this._walk('previousElementSibling',sel,incMe); },
        nxt(sel,incMe){ return this._walk('nextElementSibling',sel,incMe); },
        p(sel,incMe){ return this._walk('parentNode',sel,incMe); },
        ch(sel){ return sel ? this.ch().is(sel) : $.cNL(this.children); },
        rm(){ return this.remove(); }, // todo: no return!?
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
            var e = d.createEvent('Events');
            e.initEvent(n, true, false);
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
        rct(rct){
            rct && this.css({top:rct.y+'px',left:rct.x+'px',width:rct.w+'px',height:rct.h+'px'});
            var pos = this.getBoundingClientRect();
            return new $.rct(pos.left+pageXOffset,pos.top+pageYOffset,this.offsetWidth,this.offsetHeight)
        }
    });
    $.Eventer = {
        initEvent(n){
            !this._Es && (this._Es={});
            !this._Es[n] && (this._Es[n]=[]);
            return this._Es[n];
        },
        on(n,fn){
            this.initEvent(n).push(fn);
        }.multi(),
        no(n,fn){
            var Events = this.initEvent(n);
            Events.splice(Events.indexOf(fn) ,1);
        }.multi(),
        fire(n,e){
            var Events = this.initEvent(n), i=0, E;
            while (E=Events[i++]) E.bind(this)(e);
        }
    };
    k = d.els('script');
    k = k[k.length-1];
    $.use.path = k.attr('basis') || k.src.replace(/\/[^\/]+$/,'/');
    $.use.cbs = {};

    on(vendor+'TransitionEnd',function(e){ e.target.fire('transitionend',e) });
    on('DOMMouseScroll',function(e){ e.wheelDelta = -e.detail*40; e.target.fire('mousewheel',e) }); // firefox?

    w.$||(w.$=$);
    return $;

}();
