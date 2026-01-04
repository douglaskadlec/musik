"use strict";
(async function () {
    var _a;
    const script = document.currentScript;
    if (!script)
        return;
    const targetSelector = (_a = script.dataset.target) !== null && _a !== void 0 ? _a : '#musik';
    const configUrl = script.dataset.config;
    const mount = document.querySelector(targetSelector);
    if (!mount) {
        console.error('Musik: target element not found');
        return;
    }
    try {
        const config = await loadConfig();
        validateConfig(config);
        createPlayer(mount, config);
    }
    catch (err) {
        console.error(err);
    }
    async function loadConfig() {
        if (!configUrl) {
            throw new Error('No data-config attribute provided');
        }
        const res = await fetch(configUrl);
        if (!res.ok) {
            throw new Error('Failed to load Musik config');
        }
        const config = (await res.json());
        return config;
    }
    function validateConfig(config) {
        if (!Array.isArray(config)) {
            throw new Error('Config must be an array of tracks');
        }
        config.forEach((track, i) => {
            if (typeof track !== 'object' || track === null) {
                throw new Error(`Invalid track at index ${i}`);
            }
            const t = track;
            if (typeof t.artist !== 'string') {
                throw new Error(`Invalid artist at index ${i}`);
            }
            if (typeof t.title !== 'string') {
                throw new Error(`Invalid title at index ${i}`);
            }
            if (typeof t.artwork !== 'string') {
                throw new Error(`Invalid artwork at index ${i}`);
            }
            if (typeof t.audio !== 'string') {
                throw new Error(`Invalid audio at index ${i}`);
            }
            if (typeof t.duration !== 'string') {
                throw new Error(`Invalid duration at index ${i}`);
            }
        });
    }
    function createPlayer(mount, config) {
        const shadow = mount.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = ``;
        const containerDiv = document.createElement('div');
        containerDiv.className = 'container';
        const progressSection = document.createElement('section');
        progressSection.className = 'progress';
        const barDiv = document.createElement('div');
        barDiv.className = 'bar';
        const metaSection = document.createElement('section');
        metaSection.className = 'meta';
        const artworkImg = document.createElement('img');
        artworkImg.className = 'image';
        artworkImg.src = config[0].artwork;
        const titleP = document.createElement('p');
        titleP.className = 'title';
        titleP.textContent = config[0].title;
        const artistP = document.createElement('p');
        artistP.className = 'artist';
        artistP.textContent = config[0].artist;
        const playlistSection = document.createElement('section');
        playlistSection.className = 'playlist';
        config.forEach((track, i) => {
            const button = document.createElement('button');
            if (i === 0) {
                button.className = 'active';
            }
            button.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`);
            const trackTitleP = document.createElement('p');
            trackTitleP.className = 'track-title';
            trackTitleP.textContent = track.title;
            const trackDurationSpan = document.createElement('span');
            trackDurationSpan.className = 'track-duration';
            trackDurationSpan.textContent = track.duration;
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
        shadow.appendChild(style);
        shadow.appendChild(containerDiv);
    }
})();
