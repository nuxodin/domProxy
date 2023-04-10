# domProxy

lightweight **under 1KB** (gzip) at the moment!  
I ask you to test and participate  

## What jQuery would look like if it was released in 2021
Some things i still miss from jQuery, like assigning multiple events to multiple elements in one go.
`elements.addEventListener('click focus', listener)`  
Using js-proxies, its now possible to do this with very little code.  
The goal of this project is to integrate only the really useful apis.  

### Ussage

```js
import domProxy from './domProxy.js';

// children is also a domProxy
domProxy('.el').children.hidden = true;
// chaining
domProxy('.el').setAttribute('data-b','x').setAttribute('data-b', 'y');
// traversal methods: second argument means including the element itself
domProxy('.el').nextAll('.deletable', true).remove();
```

### How it works

All nodes are wrapped with a proxy.
When accessing a property of the nodeList, the lib first checks if there is an own property, if not, the correct property of the elements is used.
If a method returns `undefined ` on elements, the domProxy will be returned to allow chaining. (addEventListener, setAttribute, ...)


### API

```js
// constructor:
domProxy(element) // or:
domProxy([element, element, ...]) // also nodeList, htmlCollection, Set... or:
domProxy('<div>html-elements</div><h1>test</h1>') // or:
domProxy('.selector')

nodeList.next(selector?, includingSelf?) 
// returns next sibling that matches

nodeList.nextAll(selector?, includingSelf?)
// returns all next siblings that matches

nodeList.prev(selector?, includingSelf?) 
// returns previous sibling that matches

nodeList.prevAll(selector?, includingSelf?) 
// returns all previous matching siblings

nodeList.parent(selector?, includingSelf?) 
// returns next parent that matches

nodeList.parentAll(selector?, includingSelf?)
// returns all parents matching

nodeList.ensureId()
// returns the id of the Element, if it has none, it generates one

nodeList.on(types, listener, options)
// add event listeners for multiple types (eg.'click mouseover')

nodeList.off(types, listener, options)
// remove event listeners for multiple types (eg.'click mouseover')

nodeList.trigger(type, init)
// like dispatchEvent(new CustomEvent(type, init)) but defaults to bubbles:true

nodeList.css(name, value?)
// get or set (value) styles


// ...and every api available on the Elements itself
nodeList.getAttribute
nodeList.setAttribute
nodeList.hasAttribute
nodeList.closest
nodeList.matches
nodeList.insertAdjacentElement
nodeList.insertAdjacentText
nodeList.getBoundingClientRect
nodeList.querySelector
nodeList.querySelectorAll
nodeList.before
nodeList.after
nodeList.replaceWith
nodeList.remove
nodeList.prepend
nodeList.append
nodeList.innerHTML
nodeList.children
nodeList.cloneNode
nodeList.addEventListener
...
...
```

### Take part
I am very happy about every participation, even if it is only spelling corrections.  
And leave a star if you like it!


### Similar projects

https://gist.github.com/AdaRoseCannon/d95a7cbb8edd730443c62f0daff875ac

https://github.com/WebReflection/handy-wrap
