const insertAfter = (ele, sib) =>
	  ele.parentElement.insertBefore(sib, ele.nextSibling)
const on = (ctx, events, handler) =>
	  events.forEach(e => ctx.addEventListener(e, handler))
const $ = document.querySelector.bind(document)

/**
 * Link is a customized built-in anchor element that asynchronously
 * fetches the contents of the linked document and opens it in the current
 * page or in a dialog box enhancing the browsing experience.
 */
class Link extends HTMLAnchorElement {
	constructor() {
		super()
		this._page = null
		this._previous = null
	}

	async connectedCallback() {
		on(this, ['pointerenter', 'focus'], () => this._fetch())
		on(this, ['click'], e => {
			e.preventDefault()
			this.visit()
		})
		if (this.dataset.mode === 'dialog') {
			this.$dialog = document.createElement('dialog')
			insertAfter(this, this.$dialog)
		}
	}

	disconnectedCallback() {
		if (this.$dialog) this.$dialog.remove()
	}

	async visit() {
		try {
			this.dispatchEvent(new CustomEvent('linkStarted', {bubbles: true}))
			const container = this.$dialog || $(this.dataset.root || 'main')
			const p = await this._fetch()
			if (p == this._previous) return
			this._previous = this._page
			// clean container before adding new children
			while (container.firstChild) container.firstChild.remove()
			container.append(...p.children)
		} finally {
			if (this.$dialog) this.$dialog.show()
			this.dispatchEvent(new CustomEvent('linkFinished', {bubbles: true}))
		}
	}

	async _fetch() {
		if (this._page) return this._page
		this._page = await fetchPage(this.href, this.dataset.root)
		return this._page
	}
}
customElements.define('do-link', Link, {extends: 'a'})

const pages = new Map()
async function fetchPage(url, ele = 'main') {
	if (pages.has(url)) return pages.get(url)
	let page = await fetch(url).then(r => r.text())
	page = new DOMParser().parseFromString(page, 'text/html').querySelector(ele)
	pages.set(url, page)
	return page
}
