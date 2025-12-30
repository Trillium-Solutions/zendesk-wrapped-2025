// Music Player Module - Handles YouTube IFrame API and track management
const MusicPlayer = {
    player: null,
    isReady: false,
    isPlaying: false,
    currentTrackIndex: 0,

    // Curated list of ambient/lo-fi tracks for coding/analytics
    tracks: [
        { id: 'jfKfPfyJRdk', title: 'Lofi Girl - Radio' },
        { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Radio' },
        { id: 'DWcUYEE4SDA', title: 'Ambient Rain & Piano' },
        { id: 'lP26UCnoH9s', title: 'Synthwave Radio' },
        { id: '7NOSDKb0HlU', title: 'Deep Focus Ambient' }
    ],

    init() {
        this.setupEventListeners();
        this.populateTrackSelector();
    },

    setupEventListeners() {
        const musicPlayer = document.getElementById('musicPlayer');
        const musicToggle = document.getElementById('musicToggle');
        const musicClose = document.getElementById('musicClose');
        const playPauseBtn = document.getElementById('playPauseMusic');
        const volumeSlider = document.getElementById('musicVolume');
        const trackSelector = document.getElementById('trackSelector');
        const loadCustomBtn = document.getElementById('loadCustomTrack');
        const customUrlInput = document.getElementById('customYoutubeUrl');
        const nextBtn = document.getElementById('nextTrack');
        const prevBtn = document.getElementById('prevTrack');

        // Toggle Expand/Collapse
        musicToggle.addEventListener('click', () => {
            musicPlayer.classList.add('expanded');
        });

        musicClose.addEventListener('click', () => {
            musicPlayer.classList.remove('expanded');
        });

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            this.togglePlay();
        });

        // Volume
        volumeSlider.addEventListener('input', (e) => {
            if (this.player && this.isReady) {
                this.player.setVolume(e.target.value);
            }
        });

        // Track Selection
        trackSelector.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadTrack(e.target.value);
            }
        });

        // Custom URL
        loadCustomBtn.addEventListener('click', () => {
            const url = customUrlInput.value.trim();
            if (url) {
                const videoId = this.extractVideoId(url);
                if (videoId) {
                    this.loadTrack(videoId);
                    customUrlInput.value = '';
                } else {
                    alert('Invalid YouTube URL or ID');
                }
            }
        });

        nextBtn.addEventListener('click', () => this.nextTrack());
        prevBtn.addEventListener('click', () => this.prevTrack());
    },

    populateTrackSelector() {
        const selector = document.getElementById('trackSelector');
        this.tracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track.id;
            option.textContent = track.title;
            selector.appendChild(option);
        });
    },

    togglePlay() {
        if (!this.player || !this.isReady) return;

        if (this.isPlaying) {
            this.player.pauseVideo();
        } else {
            this.player.playVideo();
        }
    },

    loadTrack(videoId) {
        if (!this.player || !this.isReady) {
            this.initPlayer(videoId);
            return;
        }

        this.player.loadVideoById(videoId);
        this.isPlaying = true;
        this.updatePlayBtnUI();
    },

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(this.tracks[this.currentTrackIndex].id);
        document.getElementById('trackSelector').value = this.tracks[this.currentTrackIndex].id;
    },

    prevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.tracks[this.currentTrackIndex].id);
        document.getElementById('trackSelector').value = this.tracks[this.currentTrackIndex].id;
    },

    updatePlayBtnUI() {
        const btn = document.getElementById('playPauseMusic');
        btn.textContent = this.isPlaying ? '⏸' : '▶';
    },

    extractVideoId(url) {
        // Handle full URLs
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        // Handle just IDs
        if (url.length === 11) {
            return url;
        }
        return null;
    },

    onPlayerReady(event) {
        this.isReady = true;
        event.target.setVolume(document.getElementById('musicVolume').value);
    },

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
        } else {
            this.isPlaying = false;
        }
        this.updatePlayBtnUI();
    }
};

// Global YouTube API callback
function onYouTubeIframeAPIReady() {
    MusicPlayer.init();

    // Wait for first track selection to init player
    window.MusicPlayer = MusicPlayer;
}

// Separate function to init the actual player instance
MusicPlayer.initPlayer = function (videoId) {
    this.player = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1
        },
        events: {
            'onReady': (e) => this.onPlayerReady(e),
            'onStateChange': (e) => this.onPlayerStateChange(e)
        }
    });
};
