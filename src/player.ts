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
			if (!this.audio.duration) return
			this.audio.currentTime = percent * this.audio.duration
		})
	}

	private bindAudio() {
		this.audio.addEventListener('timeupdate', () => {
			if (!this.audio.duration) return
			bar.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`
		})
		this.audio.addEventListener('ended', () => {
			const nextId = this.getNextId()
			if (!nextId) {
				buttons.forEach(b => b.classList.remove('playing'))
				bar.style.width = '0%'
				return
			}
			this.switchTo(nextId)
		})
	}

	private handleClick(button: HTMLButtonElement) {
		if (button.dataset.id === this.activeId) {
			this.audio.paused ? this.audio.play() : this.audio.pause()
			button.classList.toggle('playing')
			return
		}
		this.switchTo(button.dataset.id || this.defaultId)
	}

	private switchTo(id: string) {
		this.activeId = id
		this.audio.src = `assets/mix/${this.activeId}.mp3`
		this.audio.play()
		this.updateUI()
	}

	private updateUI() {
		buttons.forEach(b => {b.classList.remove('active', 'playing')})
		bar.style.width = '0%'
		image.src = `assets/images/${this.activeId}.webp`
		title.textContent = tracks.find(t => this.activeId === t.id)?.title ?? 'title not found'
		const activeButton = buttons.find(b => this.activeId === b.dataset.id)
		activeButton?.classList.add('active', 'playing')
	}

	private getNextId(): string | null {
		const index = tracks.findIndex(t => this.activeId === t.id)
		return tracks[index + 1]?.id ?? null
	}
}