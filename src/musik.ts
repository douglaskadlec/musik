interface Track {
	artist: string
	title: string
	artwork: string
	audio: string
	duration: string
}

type MusikConfig = Track[]

;(async function () {
	const CSS = `:host{container-type:inline-size;font-family:inherit,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:inherit;font-weight:inherit;color:inherit}*{padding:0;margin:0;box-sizing:border-box}.container{position:relative;display:grid;grid-template-columns:minmax(0, 17em) 1fr;gap:1.4em;width:100%}@container (max-width: 45em){.container{grid-template-columns:1fr}}.container .progress{grid-column:span 2;height:.9em;border-radius:.5em;background:color-mix(in srgb, currentColor 20%, transparent);overflow:hidden;cursor:pointer}@container (max-width: 45em){.container .progress{grid-column:span 1}}.container .progress .bar{width:0;height:100%;background:currentColor;opacity:.6}.container .meta{cursor:default}.container .meta .image{display:block;aspect-ratio:1/1;object-fit:cover;width:100%;border-radius:.5em}.container .meta .title,.container .meta .artist{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.container .meta .title{margin-top:.7em;font-size:1.1em}.container .playlist{display:flex;flex-direction:column}.container .playlist button{display:grid;grid-template-columns:max-content minmax(0, 1fr) max-content;align-items:center;column-gap:.4em;padding:.7em;border-radius:.5em;border:none;background:none;font-family:inherit;font-size:inherit;font-weight:inherit;color:inherit;text-align:inherit;transition:background .3s;cursor:pointer}.container .playlist button .play-icon,.container .playlist button .pause-icon{display:flex;width:1.3em;fill:currentColor;opacity:.2;transition:opacity .3s}.container .playlist button .pause-icon{display:none}.container .playlist button .track-title{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.container .playlist button .track-duration{margin-left:auto}.container .playlist button.active,.container .playlist button:hover{background:color-mix(in srgb, currentColor 20%, transparent)}.container .playlist button.active .play-icon,.container .playlist button.active .pause-icon,.container .playlist button:hover .play-icon,.container .playlist button:hover .pause-icon{opacity:.6}.container .playlist button:focus-visible{outline:2px solid currentColor}`

	const script = document.currentScript as HTMLScriptElement | null
	if (!script) return

	const targetSelector = script.dataset.target ?? '#musik'
	const configUrl = script.dataset.config

	const mount = document.querySelector<HTMLElement>(targetSelector)
	if (!mount) {
		console.error('Musik: target element not found')
		return
	}

	try {
		const config = await loadConfig()
		validateConfig(config)
		createPlayer(mount, config)
	}
	catch (err) {
		if (err instanceof Error) {
			console.error('Musik:', err.message)
		}
	}

	async function loadConfig(): Promise<MusikConfig> {
		if (!configUrl) {
			throw new Error('No data-config attribute provided')
		}
		const res = await fetch(configUrl)
		if (!res.ok) {
			throw new Error('Failed to load Musik config')
		}
		const config = (await res.json()) as unknown
		return config as MusikConfig
	}

	function validateConfig(config: unknown): asserts config is MusikConfig {
		if (!Array.isArray(config)) {
			throw new Error('Config must be an array')
		}
		if (config.length === 0) {
			throw new Error('Config must contain at least one track')
		}
		config.forEach((track, i) => {
			if (typeof track !== 'object' || track === null) {
				throw new Error(`Invalid track at index ${i}`)
			}
			const t = track as Partial<Track>
			if (typeof t.artist !== 'string') {
				throw new Error(`Invalid artist at index ${i}`)
			}
			if (typeof t.title !== 'string') {
				throw new Error(`Invalid title at index ${i}`)
			}
			if (typeof t.artwork !== 'string') {
				throw new Error(`Invalid artwork at index ${i}`)
			}
			if (typeof t.audio !== 'string') {
				throw new Error(`Invalid audio at index ${i}`)
			}
			if (typeof t.duration !== 'string') {
				throw new Error(`Invalid duration at index ${i}`)
			}
		})
	}

	function createPlayer(mount: HTMLElement, config: MusikConfig): void {
		if (mount.shadowRoot) {
			console.warn('Musik: already initialized')
			return
		}

		const shadow = mount.attachShadow({ mode: 'open' })

		const style = document.createElement('style')
		style.textContent = CSS

		const containerDiv = document.createElement('div')
		containerDiv.className = 'container'

		const progressSection = document.createElement('section')
		progressSection.className = 'progress'
		progressSection.setAttribute('role', 'progressbar')
		progressSection.setAttribute('aria-valuemin', '0')
		progressSection.setAttribute('aria-valuemax', '100')
		progressSection.setAttribute('aria-valuenow', '0')

		const barDiv = document.createElement('div')
		barDiv.className = 'bar'

		const metaSection = document.createElement('section')
		metaSection.className = 'meta'

		const artworkImg = document.createElement('img')
		artworkImg.className = 'image'
		artworkImg.src = config[0].artwork
		artworkImg.alt = ''
		artworkImg.loading = 'lazy'

		const titleP = document.createElement('p')
		titleP.className = 'title'
		titleP.textContent = config[0].title

		const artistP = document.createElement('p')
		artistP.className = 'artist'
		artistP.textContent = config[0].artist

		const playlistSection = document.createElement('section')
		playlistSection.className = 'playlist'

		config.forEach((track, i) => {
			const button = document.createElement('button')
			if (i === 0) {
				button.className = 'active'
			}
			button.setAttribute('type', 'button')
			button.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`)
			const playIconDiv = document.createElement('div')
			playIconDiv.className = 'play-icon'
			playIconDiv.innerHTML = playIcon()
			const pauseIconDiv = document.createElement('div')
			pauseIconDiv.className = 'pause-icon'
			pauseIconDiv.innerHTML = pauseIcon()
			const trackTitleP = document.createElement('p')
			trackTitleP.className = 'track-title'
			trackTitleP.textContent = track.title
			const trackDurationSpan = document.createElement('span')
			trackDurationSpan.className = 'track-duration'
			trackDurationSpan.textContent = track.duration

			button.appendChild(playIconDiv)
			button.appendChild(pauseIconDiv)
			button.appendChild(trackTitleP)
			button.appendChild(trackDurationSpan)
			playlistSection.appendChild(button)
		})

		progressSection.appendChild(barDiv)

		metaSection.appendChild(artworkImg)
		metaSection.appendChild(titleP)
		metaSection.appendChild(artistP)

		containerDiv.appendChild(progressSection)
		containerDiv.appendChild(metaSection)
		containerDiv.appendChild(playlistSection)

		shadow.appendChild(style)
		shadow.appendChild(containerDiv)
	}

	function playIcon(): string {
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>`
	}

	function pauseIcon(): string {
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/></svg>`
	}
})()