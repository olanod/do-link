# do-link
A simple to use and non intrusive custom built-in element that enhances links in your 
static or server side rendered website to load remote pages asynchronously replacing the part of
the document you specify with new content behaving like a single page application.

Similar attempts exist but this solution uses a native custom element loaded as a module,
if the browser doesn't support modules nothing happens, your website works as usual :ok_hand: 
but if it does the anchor elements you specify in your page gain super powers :muscle:
Some advantages of using this custom element loaded as a module over some libraries:
- Progressive enhancement: Your page still works if the browser doesn't support the features required.
- Size: The browser is doing most of the work, modern JavaScript and no transpilation keeps things small.
- Simplicity: Import, use! It just does one thing and no glue JS is required for most cases.
- Performance: Instantiating custom element is fast. Pages are pre-fetched and cached when link is about to be clicked*. 
- Dynamic creation of elements: No need for mutation observers or similar approach to enhance dynamically created links, 
when using custom elements existing and new tags get upgraded automatically.
- No dependencies and good team player: keep using your favorite libraries and frameworks :wink:
- Web standards :heart:
- Open pages in a dialog(see below)

## Usage
1. Import
```html
<head>
  <!-- other stuff -->
  <script type="module" src="https://olanod.github.io/do-link/link.js" async></script>
</head>
```
2. Use
```html
<a is="do-link" href="./a-page.html">Link to a page</a>
```
3. Enjoy! :grin:

### Content selection
Since the most common navigation pattern in a website is to keep your header, navigation, 
footer, etc. by default the `<main>` content of your page will be replaced with the `<main>` content of the linked page.
If you want to change what element gets its content replaced and what element to take contents from:
```html
<a is="do-link" href="./interesting-page.html" from="#my-container" into="aside">Show interesting info</a>
```

### Dialog
If the `into` attribute is a dialog and the browser supports native dialog elements 
the dialog will be opened and the first `form` will have its method set to `"dialog"`

### History(TODO)
Visited links update the address bar using the `history.pushState` API.

