# domProxy

lightweight 570 bytes at the moment!  
(alpha, I ask you to test and participate)

## What jQuery would look like if it was released in 2021

### ussage

```js
import $ from './domProxy.js';

$('.el').children.hidden = true;
$('.el').setAttribute('data-b','x').setAttribute('data-b', 'y');
$('.el').nextAll('.deleteable', true /* including me */).remove();
```

### how it works

All nodes are wrapped with a proxy.
When accessing the nodes, the lib first checks if there is an own property, if not, the correct property of the elements is used.
If a method returns `undefined ` on elements, the domProxy will be returned to allow chaining. (addEventListener, setAttribute, ...)


### api

```js
nodeList.next(selector?: string, includingMe?:boolean) 
// returns next sibling that matches

nodeList.nextAll(selector?: string, includingMe?:boolean)
// returns all next siblings that matches

nodeList.prev(selector?: string, includingMe?:boolean) 
// returns previous sibling that matches

nodeList.prevAll(selector?: string, includingMe?:boolean) 
// returns all previous matching siblings

nodeList.parent(selector?: string, includingMe?:boolean) 
// returns next parent that matches

nodeList.parentAll(selector?: string, includingMe?:boolean)
// returns all parents matching

// ...and every api available on the Elements itself

```
