(async function () {
	const script = document.currentScript
	if (!script) return

	const targetSelector = script.dataset.target || '#musik'
	const configUrl = script.dataset.config

	const mount = document.querySelector(targetSelector)
	if (!mount) {
		console.error('Musik: target element not found')
		return
	}

	try {
		const config = await loadConfig()
		createPlayer(config)
	}
	catch (err) {
		console.error(err)
	}

	async function loadConfig() {
		if (!configUrl) {
			throw new Error('No data-config attribute provided')
		}
		const res = await fetch(configUrl)
		if (!res.ok) {
			throw new Error('Failed to load Musik config')
		}
		const data = await res.json()
		return data
	}

	function createPlayer(config) {
		const shadow = mount.attachShadow({ mode: 'open' })

		const style = document.createElement('style')
		style.textContent = ``

		const container_div = document.createElement('div')
		container_div.className = 'container'

		const progress_section = document.createElement('section')
		progress_section.className = 'progress'
		const bar_div = document.createElement('div')
		bar_div.className = 'bar'

		const meta_section = document.createElement('section')
		meta_section.className = 'meta'
		const image_img = document.createElement('img')
		image_img.className = 'image'
		const title_p = document.createElement('p')
		title_p.className = 'title'
		const artist_p = document.createElement('p')
		artist_p.className = 'artist'

		const playlist_section = document.createElement('section')
		playlist_section.className = 'playlist'
		config.forEach(elem => {
			const track_div = document.createElement('div')
			track_div.textContent = elem.title
			playlist_section.appendChild(track_div)
		})

		progress_section.appendChild(bar_div)

		meta_section.appendChild(image_img)
		meta_section.appendChild(title_p)
		meta_section.appendChild(artist_p)

		container_div.appendChild(progress_section)
		container_div.appendChild(meta_section)
		container_div.appendChild(playlist_section)

		shadow.appendChild(style)
		shadow.appendChild(container_div)
	}
})()