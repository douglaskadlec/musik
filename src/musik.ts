interface PlayerDOM {
	progress: HTMLElement
	bar: HTMLDivElement
	artwork: HTMLImageElement
	title: HTMLParagraphElement
	artist: HTMLParagraphElement
	buttons: HTMLButtonElement[]
}

interface MusikOptions {
	colors?: {
		textPrimary?: string
		textSecondary?: string
		accentPrimary?: string
		accentSecondary?: string
		accentTertiary?: string
	}
	fontWeight?: {
		primary?: string
		secondary?: string
		tertiary?: string
	}
	radius?: {
		primary?: string
	}
}

interface Track {
	artist: string
	title: string
	artwork: string
	audio: string
	duration: string // Display-only
}

interface MusikConfig {
	options?: MusikOptions
	tracks: Track[]
}

;(async function () {
	const CSS = `*{padding:0;margin:0;box-sizing:border-box}:host{container-type:inline-size;--color-textPrimary: #fff;--color-textSecondary: #fff;--color-accentPrimary: #fff;--color-accentSecondary: #808080;--color-accentTertiary: #808080;--fontWeight-primary: 400;--fontWeight-secondary: 400;--fontWeight-tertiary: 400;--radius-primary: 0}.container{position:relative;display:grid;grid-template-columns:minmax(0, 18.18em) 1fr;gap:1.36em;width:100%}@container (max-width: 45em){.container{grid-template-columns:1fr}}.container .progress{grid-column:span 2;height:.9em;border-radius:var(--radius-primary);background:var(--color-accentSecondary);overflow:hidden;cursor:pointer}@container (max-width: 45em){.container .progress{grid-column:span 1}}.container .progress .bar{width:0;height:100%;background:var(--color-accentPrimary)}.container .meta{cursor:default}.container .meta .image{display:block;aspect-ratio:1/1;object-fit:cover;width:100%;border-radius:var(--radius-primary)}.container .meta .title,.container .meta .artist{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.container .meta .title{margin-top:.8em;font-size:1.1em;color:var(--color-textPrimary);font-weight:var(--fontWeight-secondary)}.container .meta .artist{font-size:1.1em;color:var(--color-textSecondary);font-weight:var(--fontWeight-tertiary)}.container .playlist{display:flex;flex-direction:column}.container .playlist button{display:grid;grid-template-columns:max-content minmax(0, 1fr) max-content;align-items:center;column-gap:.4em;padding:.7em;border-radius:var(--radius-primary);border:none;background:none;font-family:inherit;font-size:inherit;color:var(--color-textPrimary);font-weight:var(--fontWeight-primary);text-align:left;transition:background .3s;cursor:pointer}.container .playlist button .play-icon,.container .playlist button .pause-icon{display:flex;width:1.3em;fill:var(--color-accentSecondary);transition:fill .3s}.container .playlist button .pause-icon{display:none}.container .playlist button .track-title,.container .playlist button .track-duration{color:var(--color-textPrimary)}.container .playlist button .track-title{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.container .playlist button .track-duration{margin-left:auto}.container .playlist button.active,.container .playlist button:hover{background:var(--color-accentTertiary)}.container .playlist button.active .play-icon,.container .playlist button.active .pause-icon,.container .playlist button:hover .play-icon,.container .playlist button:hover .pause-icon{fill:var(--color-accentPrimary)}.container .playlist button.playing .play-icon{display:none}.container .playlist button.playing .pause-icon{display:flex}.container .playlist button:focus-visible{outline:2px solid var(--color-textPrimary)}`

	class Player {
		private audio: HTMLAudioElement
		private currentIndex = 0

		constructor(private config: MusikConfig, private dom: PlayerDOM) {
			this.audio = new Audio(this.config.tracks[this.currentIndex].audio)
		}

		init() {
			this.bindUI()
			this.bindAudio()
		}

		private bindUI() {
			this.dom.buttons.forEach((button, i) => {
				button.addEventListener('click', () => {
					this.handleClick(i)
				})
			})
			this.dom.progress.addEventListener('click', e => {
				const rect = this.dom.progress.getBoundingClientRect()
				const percent = (e.clientX - rect.left) / rect.width
				if (!this.audio.duration) return
				this.audio.currentTime = percent * this.audio.duration
			})
		}

		private bindAudio() {
			this.audio.addEventListener('timeupdate', () => {
				if (!this.audio.duration) return
				this.dom.bar.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`
			})
			this.audio.addEventListener('ended', () => {
				if (!this.config.tracks[this.currentIndex + 1]) {
					this.audio.currentTime = 0
					this.dom.bar.style.width = '0%'
					this.dom.buttons.forEach(b => b.classList.remove('playing'))
					return
				}
				this.switchTo(this.currentIndex + 1)
			})
			this.audio.addEventListener('play', () => {
				this.dom.buttons[this.currentIndex].classList.add('playing')
			})
			this.audio.addEventListener('pause', () => {
				this.dom.buttons[this.currentIndex].classList.remove('playing')
			})
		}

		private handleClick(i: number) {
			if (i === this.currentIndex) {
				if (this.audio.paused) {
					this.audio.play()
				}
				else {
					this.audio.pause()
				}
			}
			else {
				this.switchTo(i)
			}
		}

		private switchTo(i: number) {
			this.currentIndex = i
			this.audio.src = this.config.tracks[this.currentIndex].audio
			this.audio.play()
			this.updateUI()
		}

		private updateUI() {
			this.dom.buttons.forEach(b => {b.classList.remove('active', 'playing')})
			this.dom.bar.style.width = '0%'
			this.dom.artwork.src = this.config.tracks[this.currentIndex].artwork
			this.dom.title.textContent = this.config.tracks[this.currentIndex].title
			this.dom.artist.textContent = this.config.tracks[this.currentIndex].artist
			this.dom.buttons[this.currentIndex].classList.add('active', 'playing')
		}
	}

	try {
		const script = document.currentScript as HTMLScriptElement | null
		if (!script) {
			return
		}
		const targetElement = script.dataset.target || '#musik'
		const root = document.querySelector<HTMLElement>(targetElement)
		if (!root) {
			throw new Error(`Target element "${targetElement}" not found`)
		}
		const configUrl = script.dataset.config
		if (!configUrl) {
			throw new Error('No data-config attribute provided')
		}
		const config = await loadConfig(configUrl)
		validateConfig(config)
		Object.freeze(config)
		createPlayer(root, config)
	}
	catch (err) {
		if (err instanceof Error) {
			console.error(`Musik: ${err.message}`)
		}
	}

	async function loadConfig(configUrl: string): Promise<unknown> {
		const res = await fetch(configUrl)
		if (!res.ok) {
			throw new Error(`Failed to load config from "${configUrl}"`)
		}
		return await res.json()
	}

	function validateConfig(config: unknown): asserts config is MusikConfig {
		if (typeof config !== 'object' || config === null) {
			throw new Error('Config must be an object')
		}
		const { tracks, options } = config as {
			tracks?: unknown
			options?: unknown
		}
		if (options) {
			validateOptions(options)
		}
		validateTracks(tracks)
	}

	function validateOptions(options: unknown): asserts options is MusikOptions {
		if (typeof options !== 'object' || options === null) {
			throw new Error('Options must be an object')
		}
		for (const [key, value] of Object.entries(options)) {
			if (typeof value !== 'object' || value === null) {
				throw new Error(`Options.${key} must be an object`)
			}
			for (const [k, v] of Object.entries(value)) {
				if (typeof v !== 'string') {
					throw new Error(`Options.${key}.${k} must be a string`)
				}
			}
		}
	}

	function validateTracks(tracks: unknown): asserts tracks is Track[] {
		if (!Array.isArray(tracks)) {
			throw new Error('Tracks must be an array')
		}
		if (tracks.length === 0) {
			throw new Error('Tracks must contain at least one object')
		}
		tracks.forEach((track, i) => {
			if (typeof track !== 'object' || track === null) {
				throw new Error(`Invalid element at index ${i}`)
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

	function createPlayer(root: HTMLElement, config: MusikConfig): void {
		if (root.shadowRoot) {
			console.warn('Musik: already initialized')
			return
		}
		const shadow = root.attachShadow({ mode: 'open' })
		const style = document.createElement('style')
		style.textContent = CSS
		const containerDiv = document.createElement('div')
		containerDiv.className = 'container'
		const progressSection = document.createElement('section')
		progressSection.className = 'progress'
		const barDiv = document.createElement('div')
		barDiv.className = 'bar'
		const metaSection = document.createElement('section')
		metaSection.className = 'meta'
		const artworkImg = document.createElement('img')
		artworkImg.className = 'image'
		artworkImg.src = config.tracks[0].artwork
		artworkImg.alt = ''
		artworkImg.loading = 'lazy'
		const titleP = document.createElement('p')
		titleP.className = 'title'
		titleP.textContent = config.tracks[0].title
		const artistP = document.createElement('p')
		artistP.className = 'artist'
		artistP.textContent = config.tracks[0].artist
		const playlistSection = document.createElement('section')
		playlistSection.className = 'playlist'
		config.tracks.forEach((track, i) => {
			const button = document.createElement('button')
			if (i === 0) {
				button.className = 'active'
			}
			button.setAttribute('type', 'button')
			button.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`)
			const playIconDiv = document.createElement('div')
			playIconDiv.className = 'play-icon'
			playIconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>'
			const pauseIconDiv = document.createElement('div')
			pauseIconDiv.className = 'pause-icon'
			pauseIconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/></svg>'
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

		if (config.options) {
			applyOptions(root, config.options)
		}

		shadow.appendChild(style)
		shadow.appendChild(containerDiv)
		const dom: PlayerDOM = {
			progress: progressSection,
			bar: barDiv,
			artwork: artworkImg,
			title: titleP,
			artist: artistP,
			buttons: Array.from(playlistSection.querySelectorAll('button'))
		}
		const player = new Player(config, dom)
		player.init()
	}

	function applyOptions(root: HTMLElement, options: MusikOptions) {
		const { colors, fontWeight, radius } = options
		if (colors?.textPrimary) {
			root.style.setProperty('--color-textPrimary', colors.textPrimary)
		}
		if (colors?.textSecondary) {
			root.style.setProperty('--color-textSecondary', colors.textSecondary)
		}
		if (colors?.accentPrimary) {
			root.style.setProperty('--color-accentPrimary', colors.accentPrimary)
		}
		if (colors?.accentSecondary) {
			root.style.setProperty('--color-accentSecondary', colors.accentSecondary)
		}
		if (colors?.accentTertiary) {
			root.style.setProperty('--color-accentTertiary', colors.accentTertiary)
		}
		if (fontWeight?.primary) {
			root.style.setProperty('--fontWeight-primary', fontWeight.primary)
		}
		if (fontWeight?.secondary) {
			root.style.setProperty('--fontWeight-secondary', fontWeight.secondary)
		}
		if (fontWeight?.tertiary) {
			root.style.setProperty('--fontWeight-tertiary', fontWeight.tertiary)
		}
		if (radius?.primary) {
			root.style.setProperty('--radius-primary', radius.primary)
		}
	}
})()