const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const player = $('.player')
const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const btnTogglePlay = $('.btn-toggle-play');
const btnRepeat = $('.btn-repeat');
const btnPrev = $('.btn-prev');
const btnNext = $('.btn-next');
const btnRandom = $('.btn-random');
const progress = $('.progress');
const audio = $('.audio');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
    songs: [
        {
            name: 'Chỉ bằng cái gật đầu',
            singer: 'Yan Nguyễn',
            path: './audio/chi-bang-cai-gat-dau.mp3',
            image: './images/chi-bang-cai-gat-dau.jpg'
        },
        {
            name: 'Đôi bờ',
            singer: 'Trúc Nhân',
            path: './audio/doi-bo.mp3',
            image: './images/doi-bo.jpg'
        },
        {
            name: 'Đường về hai thôn',
            singer: 'Văn Mẫn',
            path: './audio/duong-ve-hai-thon.mp3',
            image: './images/duong-ve-hai-thon.jpg'
        },
        {
            name: 'I want it that way',
            singer: 'Music Travel Love',
            path: './audio/i-want-it-that-way.mp3',
            image: './images/i-want-it-that-way.jpg'
        },
        {
            name: 'Ít nhưng dài lâu',
            singer: 'Yan Nguyễn',
            path: './audio/it-nhung-dai-lau.mp3',
            image: './images/it-nhung-dai-lau.jpg'
        },
        {
            name: 'Khi cô đơn em nhớ ai',
            singer: 'Xuân Hạ Thu Đông',
            path: './audio/khi-co-don-em-nho-ai.mp3',
            image: './images/khi-co-don-em-nho-ai.jpg'
        },
        {
            name: 'Lớn rồi còn khóc nhè',
            singer: 'Trúc Nhân',
            path: './audio/lon-roi-con-khoc-nhe.mp3',
            image: './images/lon-roi-con-khoc-nhe.jpg'
        },
        {
            name: 'Trăng về thôn dã',
            singer: 'Văn Mẫn',
            path: './audio/trang-ve-thon-da.mp3',
            image: './images/trang-ve-thon-da.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;        
        
        // Xử lý khi click play song       
        btnTogglePlay.onclick = function() { 
            if (_this.isPlaying) {        
                audio.pause();
            } else {
                audio.play();
            }            
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');   
            cdAnimate.play();      
        };

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');  
            cdAnimate.pause();       
        };

        // Khi tiến trình song được chạy
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressTime = Math.floor((audio.currentTime / audio.duration)  * 100);
                progress.value = progressTime;       
            }
        }

        // Khi tua song
        progress.oninput = function(e) {
           const seekTime = (audio.duration / 100) * e.target.value;
           audio.currentTime = seekTime;
        }

        // Xử lý phóng to , thu nhỏ cd
        document.onscroll = function() {  
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;            
            cd.style.width = (newWidth > 0) ? newWidth + 'px' : 0;      
            cd.style.opacity = (newWidth > 0) ? newWidth / cdWidth : 0;   
        }

        // Xử lý khi cd xoay
        const cdAnimate = cd.animate([{transform: "rotate(360deg)"}], {
            duration: 10000,
            iterations: Infinity
        });
        cdAnimate.pause();

        //Xử lý khi click next song
        btnNext.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }

            _this.render();
            _this.scrollToActiveSong();
        }

        //Xử lý khi click previous song
        btnPrev.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }

            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý khi click random song
        btnRandom.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        }

        // Xử lý khi click repeat song
        btnRepeat.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý Khi song end 
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        }

        // Listen hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                if (e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    },

    randomSong: function() {
        let newIndex;         
        
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
        audio.play();
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        audio.play();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        audio.play();
    },

    render: function() {
       const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${this.currentIndex === index ? 'active': ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');">

                    </div>
                    <div class="body">
                        <h3>${song.name}</h3>
                        <p>${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
       });

       playlist.innerHTML = htmls.join('');
    },

    start: function() {
        // Gán cấu hình config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính của Object
        this.defineProperties();

        // Listen, handle events 
        this.handleEvents();

        // Load current song
        this.loadCurrentSong();

        // Render Playlist
        this.render();

        btnRandom.classList.toggle('active', this.isRandom);
        btnRepeat.classList.toggle('active', this.isRepeat);
    }
};

app.start();
