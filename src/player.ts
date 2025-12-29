import { tracks } from './tracks.js'
import { progress, bar, image, title, buttons } from './dom.js'

export class Player {
	private audio: HTMLAudioElement
	private defaultId = 'musik001'
	private activeId = this.defaultId

	constructor() {
		this.audio = new Audio(`assets/mix/${this.activeId}.mp3`)
		this.bindUI()
		this.bindAudio()
	}

	private bindUI() {
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				this.handleClick(button)
			})
		})

		progress.addEventListener('click', e => {
			const rect = progress.getBoundingClientRect()
			const percent = (e.clientX - rect.left) / rect.width
			this.audio.currentTime = percent * this.audio.duration
		})
	}

	private bindAudio() {
		this.audio.addEventListener('timeupdate', () => {
			bar.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`
		})

		this.audio.addEventListener('ended', () => {
			bar.style.width = '0%'
			buttons.forEach(b => {b.classList.remove('playing')})
		})
	}

	private handleClick(button: HTMLButtonElement) {
		if (button.dataset.id === this.activeId) {
			this.audio.paused ? this.audio.play() : this.audio.pause()
			button.classList.toggle('playing')
			return
		}

		buttons.forEach(b => {b.classList.remove('active', 'playing')})
		this.switchTo(button)
	}

	private switchTo(button: HTMLButtonElement) {
		this.activeId = button.dataset.id || this.defaultId
		this.audio.src = `assets/mix/${this.activeId}.mp3`
		this.audio.play()

		bar.style.width = '0%'
		image.src = `assets/images/${this.activeId}.webp`
		title.textContent = tracks.find(track => this.activeId === track.id)?.title ?? 'title not found'
		button.classList.add('active', 'playing')
	}
}