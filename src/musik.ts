interface Track {
	artist: string
	title: string
	artwork: string
	audio: string
	duration: string
}

type MusikConfig = Track[]

;(async function () {
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
		console.error(err)
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
			throw new Error('Config must be an array of tracks')
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
		const shadow = mount.attachShadow({ mode: 'open' })

		const style = document.createElement('style')
		style.textContent = ``

		const containerDiv = document.createElement('div')
		containerDiv.className = 'container'

		const progressSection = document.createElement('section')
		progressSection.className = 'progress'

		const barDiv = document.createElement('div')
		barDiv.className = 'bar'

		const metaSection = document.createElement('section')
		metaSection.className = 'meta'

		const imageImg = document.createElement('img')
		imageImg.className = 'image'

		const titleP = document.createElement('p')
		titleP.className = 'title'

		const artistP = document.createElement('p')
		artistP.className = 'artist'

		const playlistSection = document.createElement('section')
		playlistSection.className = 'playlist'

		config.forEach((track) => {
			const trackDiv = document.createElement('div')
			trackDiv.textContent = track.title
			playlistSection.appendChild(trackDiv)
		})

		progressSection.appendChild(barDiv)

		metaSection.appendChild(imageImg)
		metaSection.appendChild(titleP)
		metaSection.appendChild(artistP)

		containerDiv.appendChild(progressSection)
		containerDiv.appendChild(metaSection)
		containerDiv.appendChild(playlistSection)

		shadow.appendChild(style)
		shadow.appendChild(containerDiv)
	}
})()
