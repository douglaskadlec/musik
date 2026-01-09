"use strict";
class CriticalError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CriticalError';
    }
}
class Musik extends HTMLElement {
    constructor() {
        super();
        this.currentIndex = 0;
        this.attachShadow({ mode: 'open' });
    }
    async connectedCallback() {
        try {
            const configUrl = this.getAttribute('config');
            if (!configUrl) {
                throw new CriticalError('No config attribute provided on <musik-app>');
            }
            const configData = await this.loadConfig(configUrl);
            this.validateConfig(configData);
            this.config = configData;
            this.dom = this.render();
            this.audio = new Audio(this.config.tracks[this.currentIndex].audio);
            this.init();
        }
        catch (err) {
            if (err instanceof CriticalError) {
                console.error(`Musik: ${err.message}`);
            }
            else {
                console.error(err);
            }
        }
    }
    async loadConfig(configUrl) {
        const res = await fetch(configUrl);
        if (!res.ok) {
            throw new CriticalError(`Failed to load config from "${configUrl}"`);
        }
        return await res.json();
    }
    validateConfig(config) {
        if (typeof config !== 'object' || config === null) {
            throw new CriticalError('Config must be an object');
        }
        const { style, tracks } = config;
        if (style !== undefined) {
            this.validateStyle(style);
            Object.freeze(style);
        }
        this.validateTracks(tracks);
        const typedTracks = tracks;
        for (const track of typedTracks) {
            Object.freeze(track);
        }
        Object.freeze(typedTracks);
        Object.freeze(config);
    }
    validateStyle(style) {
        if (typeof style !== 'object' || style === null) {
            throw new CriticalError('Style must be an object');
        }
        for (const [key, value] of Object.entries(style)) {
            if (typeof value !== 'string') {
                throw new CriticalError(`${key}: ${value} must be a string`);
            }
        }
    }
    validateTracks(tracks) {
        if (!Array.isArray(tracks)) {
            throw new CriticalError('Tracks must be an array');
        }
        if (tracks.length === 0) {
            throw new CriticalError('Tracks must contain at least one object');
        }
        const requiredKeys = ['artist', 'title', 'artwork', 'audio', 'duration'];
        for (let i = 0; i < tracks.length; i++) {
            if (typeof tracks[i] !== 'object' || tracks[i] === null) {
                throw new CriticalError(`Track at index ${i} is not an object`);
            }
            const t = tracks[i];
            for (const key of requiredKeys) {
                if (typeof t[key] !== 'string') {
                    throw new CriticalError(`Track at index ${i} is missing a string property: "${key}"`);
                }
            }
        }
    }
    render() {
        const shadow = this.shadowRoot;
        const style = document.createElement('style');
        style.textContent = `.container .playlist button .track-title,.container .meta .title,.container .meta .artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}*{padding:0;margin:0;box-sizing:border-box}:host{display:block;container-type:inline-size;--musik-gridTemplateColumns: 17em 1fr;--musik-columnGap: 1.3em;--musik-rowGap: 1.3em;--musik-accentColor-primary: #fff;--musik-accentColor-secondary: #808080;--musik-accentColor-tertiary: #808080;--musik-fontFamily-primary: inherit;--musik-fontFamily-secondary: inherit;--musik-fontFamily-tertiary: inherit;--musik-fontSize-primary: 1em;--musik-fontSize-secondary: 1.1em;--musik-fontSize-tertiary: 1.1em;--musik-fontWeight-primary: 400;--musik-fontWeight-secondary: 400;--musik-fontWeight-tertiary: 400;--musik-fontColor-primary: #fff;--musik-fontColor-secondary: #fff;--musik-fontColor-tertiary: #fff;--musik-borderRadius: 0;--musik-aspectRatio: 1;--musik-objectFit: fill;--musik-transitionSpeed: 0.3s;--musik-progressHeight: 0.9em;--musik-iconWidth: 1.3em;--musik-space-1: 0.8em;--musik-space-2: 0.4em;--musik-space-3: 0.7em}:focus-visible{outline:2px solid var(--musik-fontColor-primary)}.container{position:relative;display:grid;grid-template-columns:var(--musik-gridTemplateColumns);column-gap:var(--musik-columnGap);row-gap:var(--musik-rowGap);width:100%}@container (max-width: 45em){.container{grid-template-columns:1fr}}.container .progress{grid-column:1/-1;height:var(--musik-progressHeight);border-radius:var(--musik-borderRadius);background:var(--musik-accentColor-secondary);cursor:pointer;overflow:hidden}.container .progress .bar{width:0;height:100%;background:var(--musik-accentColor-primary)}.container .meta{cursor:default}.container .meta .image{display:block;aspect-ratio:var(--musik-aspectRatio);object-fit:var(--musik-objectFit);width:100%;border-radius:var(--musik-borderRadius)}.container .meta .title{margin-top:var(--musik-space-1);font-family:var(--musik-fontFamily-secondary);font-size:var(--musik-fontSize-secondary);font-weight:var(--musik-fontWeight-secondary);color:var(--musik-fontColor-secondary)}.container .meta .artist{font-family:var(--musik-fontFamily-tertiary);font-size:var(--musik-fontSize-tertiary);font-weight:var(--musik-fontWeight-tertiary);color:var(--musik-fontColor-tertiary)}.container .playlist{display:flex;flex-direction:column}.container .playlist button{display:grid;grid-template-columns:max-content minmax(0, 1fr) max-content;align-items:center;column-gap:var(--musik-space-2);padding:var(--musik-space-3);border-radius:var(--musik-borderRadius);border:none;background:none;font-family:var(--musik-fontFamily-primary);font-size:var(--musik-fontSize-primary);font-weight:var(--musik-fontWeight-primary);color:var(--musik-fontColor-primary);text-align:left;transition:background var(--musik-transitionSpeed);cursor:pointer}.container .playlist button .play-icon,.container .playlist button .pause-icon{display:flex;width:var(--musik-iconWidth);fill:var(--musik-accentColor-secondary);transition:fill var(--musik-transitionSpeed)}.container .playlist button .pause-icon{display:none}.container .playlist button .track-title,.container .playlist button .track-duration{color:var(--musik-fontColor-primary)}.container .playlist button .track-duration{margin-left:auto}.container .playlist button.active,.container .playlist button:hover{background:var(--musik-accentColor-tertiary)}.container .playlist button.active .play-icon,.container .playlist button.active .pause-icon,.container .playlist button:hover .play-icon,.container .playlist button:hover .pause-icon{fill:var(--musik-accentColor-primary)}.container.playing .playlist button.active .play-icon{display:none}.container.playing .playlist button.active .pause-icon{display:flex}`;
        shadow.appendChild(style);
        if (this.config.style) {
            const customStyle = document.createElement('style');
            customStyle.textContent = this.createCustomCSS(this.config.style);
            shadow.appendChild(customStyle);
        }
        const containerDiv = document.createElement('div');
        containerDiv.className = 'container';
        const progressSection = document.createElement('section');
        progressSection.className = 'progress';
        progressSection.tabIndex = 0;
        progressSection.setAttribute('role', 'slider');
        progressSection.setAttribute('aria-label', 'Playback position');
        progressSection.setAttribute('aria-valuemin', '0');
        progressSection.setAttribute('aria-valuemax', '100');
        progressSection.setAttribute('aria-valuenow', '0');
        const barDiv = document.createElement('div');
        barDiv.className = 'bar';
        const metaSection = document.createElement('section');
        metaSection.className = 'meta';
        const artworkImg = document.createElement('img');
        artworkImg.className = 'image';
        artworkImg.src = this.config.tracks[0].artwork;
        artworkImg.alt = `${this.config.tracks[0].title} artwork`;
        artworkImg.loading = 'lazy';
        const titleP = document.createElement('p');
        titleP.className = 'title';
        titleP.textContent = this.config.tracks[0].title;
        const artistP = document.createElement('p');
        artistP.className = 'artist';
        artistP.textContent = this.config.tracks[0].artist;
        const playlistSection = document.createElement('section');
        playlistSection.className = 'playlist';
        this.config.tracks.forEach((track, i) => {
            const button = document.createElement('button');
            if (i === 0) {
                button.className = 'active';
            }
            button.setAttribute('type', 'button');
            button.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`);
            const playIconDiv = document.createElement('div');
            playIconDiv.className = 'play-icon';
            playIconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>';
            const pauseIconDiv = document.createElement('div');
            pauseIconDiv.className = 'pause-icon';
            pauseIconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/></svg>';
            const trackTitleP = document.createElement('p');
            trackTitleP.className = 'track-title';
            trackTitleP.textContent = track.title;
            const trackDurationSpan = document.createElement('span');
            trackDurationSpan.className = 'track-duration';
            trackDurationSpan.textContent = track.duration;
            button.appendChild(playIconDiv);
            button.appendChild(pauseIconDiv);
            button.appendChild(trackTitleP);
            button.appendChild(trackDurationSpan);
            playlistSection.appendChild(button);
        });
        progressSection.appendChild(barDiv);
        metaSection.appendChild(artworkImg);
        metaSection.appendChild(titleP);
        metaSection.appendChild(artistP);
        containerDiv.appendChild(progressSection);
        containerDiv.appendChild(metaSection);
        containerDiv.appendChild(playlistSection);
        shadow.appendChild(containerDiv);
        return {
            container: containerDiv,
            progress: progressSection,
            bar: barDiv,
            artwork: artworkImg,
            title: titleP,
            artist: artistP,
            buttons: Array.from(playlistSection.querySelectorAll('button'))
        };
    }
    createCustomCSS(style) {
        let css = ':host{';
        for (const [key, value] of Object.entries(style)) {
            css += `--musik-${key}:${value};`;
        }
        css += '}';
        return css;
    }
    init() {
        this.bindUI();
        this.bindAudio();
    }
    bindUI() {
        this.dom.buttons.forEach((button, i) => {
            button.addEventListener('click', () => {
                this.handleClick(i);
            });
        });
        this.dom.progress.addEventListener('click', e => {
            const rect = this.dom.progress.getBoundingClientRect();
            const raw = (e.clientX - rect.left) / rect.width;
            const percent = Math.min(Math.max(raw, 0), 1);
            if (!this.audio.duration)
                return;
            this.audio.currentTime = percent * this.audio.duration;
        });
        this.dom.progress.addEventListener('keydown', e => {
            switch (e.key) {
                case 'ArrowRight':
                    if (!this.audio.duration)
                        return;
                    this.audio.currentTime = Math.min(this.audio.currentTime + (0.05 * this.audio.duration), this.audio.duration);
                    break;
                case 'ArrowLeft':
                    if (!this.audio.duration)
                        return;
                    this.audio.currentTime = Math.max(this.audio.currentTime - (0.05 * this.audio.duration), 0);
                    break;
                case 'Home':
                    this.audio.currentTime = 0;
                    break;
                case 'End':
                    if (!this.audio.duration)
                        return;
                    this.audio.currentTime = this.audio.duration;
                    break;
                case ' ':
                    this.handleClick(this.currentIndex);
                    break;
                default:
                    return;
            }
            e.preventDefault();
        });
    }
    bindAudio() {
        this.audio.addEventListener('timeupdate', () => {
            if (!this.audio.duration)
                return;
            const percent = Math.min((this.audio.currentTime / this.audio.duration) * 100, 100);
            this.dom.progress.setAttribute('aria-valuenow', Math.round(percent).toString());
            this.dom.progress.setAttribute('aria-valuetext', `${this.formatTime(this.audio.currentTime)} of ${this.formatTime(this.audio.duration)}`);
            this.dom.bar.style.width = `${percent}%`;
        });
        this.audio.addEventListener('ended', () => {
            if (this.config.tracks[this.currentIndex + 1]) {
                this.switchTo(this.currentIndex + 1);
            }
            else {
                this.switchTo(0);
            }
        });
        this.audio.addEventListener('play', () => {
            this.dom.container.classList.add('playing');
        });
        this.audio.addEventListener('pause', () => {
            this.dom.container.classList.remove('playing');
        });
    }
    formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return '0:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    handleClick(i) {
        if (i === this.currentIndex) {
            if (this.audio.paused) {
                this.audio.play().catch(err => {
                    console.error(`Musik: ${err.message}`);
                });
            }
            else {
                this.audio.pause();
            }
        }
        else {
            this.switchTo(i);
        }
    }
    switchTo(i) {
        this.currentIndex = i;
        this.audio.pause();
        this.audio.src = '';
        this.audio.load();
        this.audio.src = this.config.tracks[this.currentIndex].audio;
        this.audio.load();
        this.audio.play().catch(err => {
            console.error(`Musik: ${err.message}`);
        });
        this.updateUI();
    }
    updateUI() {
        this.dom.buttons.forEach(b => { b.classList.remove('active'); });
        this.dom.bar.style.width = '0%';
        this.dom.artwork.src = this.config.tracks[this.currentIndex].artwork;
        this.dom.artwork.alt = `${this.config.tracks[this.currentIndex].title} artwork`;
        this.dom.title.textContent = this.config.tracks[this.currentIndex].title;
        this.dom.artist.textContent = this.config.tracks[this.currentIndex].artist;
        this.dom.buttons[this.currentIndex].classList.add('active');
    }
    disconnectedCallback() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio.load();
        }
    }
}
customElements.define('musik-app', Musik);
