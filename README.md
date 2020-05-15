# domProxy (alpha)

lightweight **570 bytes** (gzip) at the moment!  
I ask you to test and participate  

## What jQuery would look like if it was released in 2021

### ussage

```js
import $ from './domProxy.js';

$('.el').children.hidden = true;
$('.el').setAttribute('data-b','x').setAttribute('data-b', 'y');
$('.el').nextAll('.deleteable', true /* including self */).remove();
```

### how it works

All nodes are wrapped with a proxy.
When accessing the nodes, the lib first checks if there is an own property, if not, the correct property of the elements is used.
If a method returns `undefined ` on elements, the domProxy will be returned to allow chaining. (addEventListener, setAttribute, ...)


### api

```js
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


// ...and every api available on the Elements itself

```
