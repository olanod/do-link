// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPLv3
// Copyright © 2018 Daniel Olano
const on = (ctx, events, handler) =>
	events.forEach(e => ctx.addEventListener(e, handler))
const $ = (s, e = document) => e.querySelector(s)
const ce = ([e]) => new CustomEvent(e, {bubbles: true})
const pages = new Map([[location.href, document.cloneNode(true)]])
let firstVisit = null

/**
 * Link is a customized built-in anchor element that asynchronously
 * fetches the contents of the linked document and puts its content
 * in the specified element.
 */
export class Link extends HTMLAnchorElement {
	connectedCallback() {
		on(this, ['pointerenter', 'focus'], () => this.fetch())
		on(this, ['click'], e => {
			e.preventDefault()
			this.visit()
		})
	}

	async visit() {
		if (location.href === this.href) return
		this.dispatchEvent(ce`linkStarted`)
		try {
			let {from, into} = this, t = $(into)
			if (!firstVisit) firstVisit = {from, into}
			let p = await this.fetch()
			update($(from, p), t)
			history.pushState({from, into}, '', this.href)
		} finally {
			this.dispatchEvent(ce`linkFinished`)
		}
	}
	
	async fetch() { return fetchPage(this.href) }

	get into() { return this.getAttribute('into') || 'main' }
	get from() { return this.getAttribute('from') || 'main' }
}
customElements.define('do-link', Link, {extends: 'a'})

self.addEventListener('popstate', ({state: s}) => {
	s = s || firstVisit
	update($(s.from, pages.get(location.href)), $(s.into))
})

const isDialog = e => 'HTMLDialogElement' in self && e instanceof HTMLDialogElement

function update(src, target) {
	if (!src || !target) return
	src = src.cloneNode(true)
	while (target.firstChild) target.firstChild.remove()
	target.append(...src.children)
	if (isDialog(target)) {
		let f = $('form', target)
		if (f) f.method = 'dialog'
		target.show()
	}
}

async function fetchPage(url) {
	if (pages.has(url)) return pages.get(url)
	let page = await fetch(url).then(r => r.text())
	page = new DOMParser().parseFromString(page, 'text/html')
	pages.set(url, page)
	return page
}
// @license-end
