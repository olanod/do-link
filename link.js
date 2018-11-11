/* Copyright © 2018  Daniel Olano | @license GPLv3 */
const insertAfter = (ele, sib) =>
	  ele.parentElement.insertBefore(sib, ele.nextSibling)
const on = (ctx, events, handler) =>
	  events.forEach(e => ctx.addEventListener(e, handler))
const $ = document.querySelector.bind(document)
const _$ = (e, s) => e.querySelector(s)

let prevPage = null

/**
 * Link is a customized built-in anchor element that asynchronously
 * fetches the contents of the linked document and opens it in the current
 * page or in a dialog box enhancing the browsing experience.
 */
class Link extends HTMLAnchorElement {
	constructor() {
		super()
		this._page = null
	}

	async connectedCallback() {
		on(this, ['pointerenter', 'focus'], () => this._fetchNode())
		on(this, ['click'], e => {
			e.preventDefault()
			this.visit()
		})
	}

	disconnectedCallback() {}

	async visit() {
		try {
			this.dispatchEvent(new CustomEvent('linkStarted', {bubbles: true}))
			let target = $(this.for)
			let n = await this._fetchNode()
			if (prevPage === this._page) return
			prevPage = this._page
			while (target.firstChild) target.firstChild.remove()
			target.append(...n.children)
			if ('HTMLDialogElement' in window &&
				target instanceof HTMLDialogElement) {
				let f = _$(target, 'form')
				if (f) f.method = 'dialog'
				target.show()
			}
		} finally {
			this.dispatchEvent(new CustomEvent('linkFinished', {bubbles: true}))
		}
	}

	get for() { return this.dataset.for || 'main' }
	get from() { return this.dataset.from || 'main' }

	async _fetchNode() {
		if (!this._page) {
			this._page = await fetchPage(this.href)
		}
		return document.importNode(_$(this._page, this.from), true)
	}
}
customElements.define('do-link', Link, {extends: 'a'})

const pages = new Map()
async function fetchPage(url) {
	if (pages.has(url)) return pages.get(url)
	let page = await fetch(url).then(r => r.text())
	page = new DOMParser().parseFromString(page, 'text/html')
	pages.set(url, page)
	return page
}
