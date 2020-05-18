# domProxy (beta)

lightweight **~700 bytes** (gzip) at the moment, 1% of jQuerys size!  
I ask you to test and participate  

## What jQuery would look like if it was released in 2021
Some things i still miss from jQuery, like assigning multiple events to multiple elements in one go.
`elements.addEventListener('click focus', listener)`  
Using js-proxies, its now possible to do this with very little code.  
The goal of this project is to integrate only the really useful apis.  

### ussage

```js
import $ from './domProxy.js';

$('.el').children.hidden = true;
$('.el').setAttribute('data-b','x').setAttribute('data-b', 'y');
$('.el').nextAll('.deletable', true /* including self */).remove();
```

### how it works

All nodes are wrapped with a proxy.
When accessing a property of the nodeList, the lib first checks if there is an own property, if not, the correct property of the elements is used.
If a method returns `undefined ` on elements, the domProxy will be returned to allow chaining. (addEventListener, setAttribute, ...)


### api

```js
// constructor:
$(element) // or:
$([element, element, ...]) // also nodeList, htmlCollection, Set... or:
$('<div>html-elements</div><h1>test</h1>') // or:
$('.selector')

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
// returns the id of the first Element, if it has none, it generates one

nodeList.on(types, listener, options)
// add event listeners for multiple types (eg.'click mouseover')

nodeList.off(types, listener, options)
// remove event listeners for multiple types (eg.'click mouseover')

nodeList.trigger(type, init)
// like dispatchEvent(new CustomEvent(type, init)) bud defaults to bubbles:true

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

### take part
I am very happy about every participation, even if it is only spelling corrections.  
And leave a star if you like it!
