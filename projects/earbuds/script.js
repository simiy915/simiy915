(function () {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function showToast(message, duration = 2200) {
        const container = $('#toasts');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-6px)';
            setTimeout(() => toast.remove(), 260);
        }, duration);
    }

    function removeSkeletons() {
        $$('.skeleton').forEach(node => {
            node.classList.remove('skeleton');
        });
    }

    // Loader & skeleton
    window.addEventListener('load', () => {
        const loader = $('#loader');
        setTimeout(() => {
            loader.classList.add('hidden');
            removeSkeletons();
        }, 800);
    });

    // Reveal on scroll
    const revealEls = $$('.reveal-on-scroll');
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    revealEls.forEach(el => io.observe(el));

    // Tabs
    const tabs = $$('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('aria-controls');
            tabs.forEach(t => {
                t.classList.remove('is-active');
                t.setAttribute('aria-selected', 'false');
            });
            $$('.tab-panel').forEach(p => p.classList.remove('is-active'));

            tab.classList.add('is-active');
            tab.setAttribute('aria-selected', 'true');
            const panel = '#' + targetId;
            const targetPanel = $(panel);
            if (targetPanel) targetPanel.classList.add('is-active');
        });
    });

    // Accordion
    $$('.accordion-header').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            const content = btn.nextElementSibling;
            if (content) content.style.display = expanded ? 'none' : 'block';
        });
    });

    // Form validation & submit
    const form = $('#contact-form');
    const submitBtn = $('#submit-btn');
    function validateField(input) {
        const container = input.closest('.form-group');
        const hint = container ? $('.input-hint', container) : null;
        let valid = true;
        if (input.hasAttribute('required')) {
            if (!input.value || input.value.trim().length === 0) valid = false;
        }
        if (valid && input.type === 'email') {
            valid = /.+@.+\..+/.test(input.value);
        }
        if (valid && input.hasAttribute('minlength')) {
            const min = Number(input.getAttribute('minlength')) || 0;
            valid = input.value.trim().length >= min;
        }
        input.classList.toggle('valid', valid);
        input.classList.toggle('invalid', !valid);
        if (hint) {
            hint.textContent = valid ? '' : (hint.getAttribute('data-error') || '请检查输入');
        }
        return valid;
    }
    if (form) {
        $$('#contact-form input, #contact-form textarea').forEach(field => {
            field.addEventListener('input', () => validateField(field));
            field.addEventListener('blur', () => validateField(field));
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fields = $$('#contact-form input, #contact-form textarea');
            const allValid = fields.map(validateField).every(Boolean);
            if (!allValid) {
                showToast('请完善表单信息');
                return;
            }
            submitBtn.classList.add('loading');
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                showToast('提交成功，我们会尽快联系您');
                form.reset();
                fields.forEach(f => f.classList.remove('valid', 'invalid'));
            }, 1200);
        });
    }

    // Buy CTA
    $$('.btn-buy').forEach(btn => btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.textContent = '处理中…';
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = '立即购买';
            showToast('已加入购物车');
        }, 900);
    }));

    // Parallax background layer
    const parallax = $('.parallax .parallax-layer');
    if (parallax) {
        window.addEventListener('scroll', () => {
            const speed = Number(parallax.getAttribute('data-parallax')) || 0.2;
            const offset = window.scrollY * speed;
            parallax.style.transform = `translateY(${offset}px)`;
        }, { passive: true });
    }

    // Hero tilt interaction
    const heroImage = $('.hero-image');
    if (heroImage) {
        const maxTilt = 12;
        const resetTilt = () => {
            heroImage.style.setProperty('--tilt-x', '0deg');
            heroImage.style.setProperty('--tilt-y', '0deg');
            heroImage.classList.remove('is-active');
        };
        heroImage.addEventListener('pointerenter', () => {
            heroImage.classList.add('is-active');
        });
        heroImage.addEventListener('pointermove', (e) => {
            const rect = heroImage.getBoundingClientRect();
            const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
            const offsetY = (e.clientY - rect.top) / rect.height - 0.5;
            const tiltX = clamp(-offsetY * maxTilt, -maxTilt, maxTilt).toFixed(2);
            const tiltY = clamp(offsetX * maxTilt, -maxTilt, maxTilt).toFixed(2);
            heroImage.style.setProperty('--tilt-x', `${tiltX}deg`);
            heroImage.style.setProperty('--tilt-y', `${tiltY}deg`);
        });
        heroImage.addEventListener('pointerleave', resetTilt);
        resetTilt();
    }

    // Latency game mode toggle
    const toggleGame = $('#toggle-game-mode');
    const meterFill = $('.latency-meter .meter-fill');
    const latencyLabel = $('#latency-label');
    let gameMode = false;
    if (toggleGame && meterFill && latencyLabel) {
        toggleGame.addEventListener('click', () => {
            gameMode = !gameMode;
            if (gameMode) {
                meterFill.style.width = '35%';
                latencyLabel.textContent = '游戏模式：~70 ms';
                showToast('已开启游戏低延迟模式');
            } else {
                meterFill.style.width = '65%';
                latencyLabel.textContent = '典型延迟：~140 ms';
                showToast('已关闭游戏模式');
            }
        });
    }

    // Carousel
    const track = $('#carousel-track');
    const btnPrev = $('.carousel-btn.prev');
    const btnNext = $('.carousel-btn.next');
    const slides = $$('.slide', track);
    const dotsContainer = $('.carousel-dots');
    let index = 0;

    function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`;
        const dots = $$('.carousel-dots button');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    }

    function createDots() {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', `切换到第 ${i + 1} 张`);
            dot.addEventListener('click', () => { index = i; updateCarousel(); });
            dotsContainer.appendChild(dot);
        });
        updateCarousel();
    }
    if (track && slides.length) {
        createDots();
        btnPrev?.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; updateCarousel(); });
        btnNext?.addEventListener('click', () => { index = (index + 1) % slides.length; updateCarousel(); });
        // Swipe
        let startX = 0; let delta = 0; let dragging = false;
        track.addEventListener('pointerdown', e => { dragging = true; startX = e.clientX; delta = 0; track.setPointerCapture(e.pointerId); });
        track.addEventListener('pointermove', e => { if (!dragging) return; delta = e.clientX - startX; track.style.transform = `translateX(calc(${-index * 100}% + ${delta}px))`; });
        const end = () => {
            if (!dragging) return; dragging = false;
            if (delta > 60) index = (index - 1 + slides.length) % slides.length;
            if (delta < -60) index = (index + 1) % slides.length;
            updateCarousel();
        };
        track.addEventListener('pointerup', end);
        track.addEventListener('pointercancel', end);
        track.addEventListener('pointerleave', end);
    }

    // Sound lab
    const soundLab = $('#sound-lab');
    if (soundLab) {
        const bars = $$('.lab-bar', soundLab);
        const ranges = $$('input[type="range"][data-band]', soundLab);
        const presets = $$('.preset-chip', soundLab);
        const summary = $('.sound-summary', soundLab);
        const presetMap = {
            balanced: { sub: 70, bass: 82, mid: 78, treble: 74, air: 68 },
            bass: { sub: 96, bass: 100, mid: 72, treble: 66, air: 60 },
            vocal: { sub: 58, bass: 68, mid: 92, treble: 80, air: 72 },
            bright: { sub: 54, bass: 64, mid: 76, treble: 94, air: 88 }
        };
        const presetDescriptions = {
            balanced: '当前模式：均衡，适合大多数通勤与流行音乐。',
            bass: '当前模式：低频增强，鼓点澎湃，适合电子与嘻哈。',
            vocal: '当前模式：人声突出，口型更贴耳，适合播客、演唱。',
            bright: '当前模式：高频更亮，空气感强，适合古典与原声。'
        };
        const bandLabels = {
            sub: '超低频',
            bass: '低频',
            mid: '中频',
            treble: '高频',
            air: '超高频'
        };
        let state = { ...presetMap.balanced };

        function renderState() {
            let highestBand = 'bass';
            let highestValue = -Infinity;
            bars.forEach(bar => {
                const band = bar.dataset.band;
                const value = state[band];
                bar.style.setProperty('--level', value);
                bar.setAttribute('data-value', `${value}%`);
                bar.setAttribute('aria-valuenow', String(value));
                if (value > highestValue) {
                    highestValue = value;
                    highestBand = band;
                }
            });
            bars.forEach(bar => {
                bar.classList.toggle('is-active', bar.dataset.band === highestBand);
            });
            ranges.forEach(range => {
                const band = range.dataset.band;
                if (band in state) {
                    range.value = state[band];
                }
            });
        }

        function activatePreset(preset) {
            state = { ...presetMap[preset] };
            presets.forEach(btn => btn.classList.toggle('is-active', btn.dataset.preset === preset));
            summary.textContent = presetDescriptions[preset] || '';
            renderState();
        }

        function applyCustomSummary() {
            const details = Object.keys(state)
                .map(band => `${bandLabels[band]} ${state[band]}%`)
                .join('，');
            summary.textContent = `当前模式：自定义，${details}`;
        }

        presets.forEach(btn => {
            btn.addEventListener('click', () => {
                activatePreset(btn.dataset.preset);
                showToast(`已切换至 ${btn.textContent.trim()} 模式`);
            });
        });

        ranges.forEach(range => {
            range.addEventListener('input', () => {
                const band = range.dataset.band;
                state[band] = Number(range.value);
                presets.forEach(btn => btn.classList.remove('is-active'));
                renderState();
                applyCustomSummary();
            });
            range.addEventListener('change', () => {
                showToast('已保存自定义 EQ 设置');
            });
        });

        activatePreset('balanced');
    }

    // Noise lab
    const noiseLab = $('#noise-lab');
    if (noiseLab) {
        const slider = $('#noise-slider');
        const levelLabel = $('#noise-level');
        const afterLabel = $('#noise-after');
        const modeLabel = $('#noise-mode');
        const summary = $('#noise-summary');
        const ambientWave = $('.noise-wave.ambient', noiseLab);
        const focusedWave = $('.noise-wave.focused', noiseLab);
        const sceneButtons = $$('.scene-chip', noiseLab);
        const scenes = {
            metro: {
                name: '地铁',
                noise: 85,
                slider: 88,
                description: '强降噪模式下，地铁低频轰鸣显著削弱，保留地铁广播人声。'
            },
            office: {
                name: '办公室',
                noise: 58,
                slider: 62,
                description: '轻降噪过滤空调、键盘声，保留同事交流，专注又不失互动。'
            },
            cafe: {
                name: '咖啡店',
                noise: 68,
                slider: 72,
                description: '轻降噪模式下，背景喧闹柔和退去，音乐与人声更清晰。'
            },
            outdoor: {
                name: '户外骑行',
                noise: 75,
                slider: 55,
                description: '抗风噪模式削弱呼呼风声，保留车流提示声，出行更安全。'
            }
        };
        let currentScene = 'metro';

        function updateNoise(value) {
            const scene = scenes[currentScene];
            const reduction = Math.round(scene.noise * (value / 120));
            const after = Math.max(scene.noise - reduction, 18);
            levelLabel.textContent = `约 ${scene.noise} dB`;
            afterLabel.textContent = `约 ${after} dB`;
            let mode = '通透模式';
            if (value >= 75) mode = '强降噪';
            else if (value >= 45) mode = '轻降噪';
            else if (value >= 25) mode = '通透模式';
            else mode = '降噪关闭';
            modeLabel.textContent = mode;
            summary.textContent = `${scene.description} 当前剩余噪声约 ${after} dB，推荐保持 ${mode}。`;
            ambientWave.style.opacity = clamp(scene.noise / 100, 0.4, 0.85).toFixed(2);
            focusedWave.style.opacity = clamp(value / 100, 0.1, 0.9).toFixed(2);
            focusedWave.style.transform = `translateY(${40 - value * 0.4}%)`;
            slider.setAttribute('aria-valuenow', String(value));
        }

        function activateScene(key) {
            currentScene = key;
            sceneButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.scene === key));
            const scene = scenes[key];
            slider.value = scene.slider;
            updateNoise(scene.slider);
            showToast(`已切换至 ${scene.name} 环境`);
        }

        if (slider) {
            slider.addEventListener('input', () => {
                updateNoise(Number(slider.value));
            });
            slider.addEventListener('change', () => {
                showToast('已更新降噪强度');
            });
        }
        sceneButtons.forEach(btn => {
            btn.addEventListener('click', () => activateScene(btn.dataset.scene));
        });
        activateScene('metro');
    }

    // Gesture lab
    const gestureLab = $('#gesture-lab');
    if (gestureLab) {
        const chips = $$('.gesture-chip', gestureLab);
        const zones = $$('.drop-zone', gestureLab);
        const resetBtn = $('#gesture-reset');
        const trackButtons = $$('.music-track', gestureLab);
        const musicToggle = $('#music-toggle');
        const musicTitle = $('#music-title');
        const musicIndicator = $('#music-indicator');
        const musicProgress = $('#music-progress-bar');
        const musicAudio = $('#lab-audio');
        let musicReady = false;
        const actionLabels = {
            play: '播放 / 暂停',
            next: '下一曲',
            volume: '音量 + / -',
            anc: '降噪 / 通透切换',
            voice: '唤醒语音助手',
            music: '网络音乐播放'
        };
        const earLabels = {
            left: '左耳',
            right: '右耳'
        };
        const assignments = { left: null, right: null };
        let pickedAction = null;

        const clearPicked = () => {
            pickedAction = null;
            chips.forEach(chip => chip.classList.remove('is-picked'));
        };

        function assignAction(zone, action) {
            const ear = zone.dataset.ear;
            assignments[ear] = action;
            zone.classList.add('is-filled');
            const body = $('.zone-body', zone);
            if (body) body.textContent = actionLabels[action];
            showToast(`${earLabels[ear]} 已设置为 ${actionLabels[action]}`);
        }

        function ensureAudioInitialized() {
            if (musicReady || !musicAudio) return;
            const active = $('.music-track.is-active', gestureLab) || trackButtons[0];
            if (active) {
                musicAudio.src = active.dataset.src;
                musicTitle.textContent = `当前曲目：${active.dataset.title}`;
            }
            musicReady = true;
        }

        function setMusicIndicator(text) {
            if (musicIndicator) musicIndicator.textContent = text;
        }

        function updateProgress() {
            if (!musicAudio || !musicProgress) return;
            if (!musicAudio.duration || Number.isNaN(musicAudio.duration)) {
                musicProgress.style.width = '0%';
                return;
            }
            const percent = (musicAudio.currentTime / musicAudio.duration) * 100;
            musicProgress.style.width = `${percent}%`;
        }

        function toggleMusic() {
            ensureAudioInitialized();
            if (!musicAudio) return;
            if (!musicAudio.src) {
                showToast('请选择一个网络音乐曲目');
                return;
            }
            if (musicAudio.paused) {
                musicAudio.play().catch(() => {
                    setMusicIndicator('请点击允许播放');
                    showToast('浏览器阻止了自动播放，请再次点击播放');
                });
            } else {
                musicAudio.pause();
            }
        }

        chips.forEach(chip => {
            chip.addEventListener('dragstart', (e) => {
                pickedAction = chip.dataset.action;
                e.dataTransfer.setData('text/plain', pickedAction);
                e.dataTransfer.effectAllowed = 'move';
                chips.forEach(btn => btn.classList.toggle('is-picked', btn === chip));
            });
            chip.addEventListener('dragend', clearPicked);
            chip.addEventListener('click', () => {
                const isActive = !chip.classList.contains('is-picked');
                chips.forEach(btn => btn.classList.remove('is-picked'));
                if (isActive) {
                    chip.classList.add('is-picked');
                    pickedAction = chip.dataset.action;
                } else {
                    pickedAction = null;
                }
            });
            chip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    chip.click();
                }
            });
        });

        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('is-hover');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('is-hover');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('is-hover');
                const action = e.dataTransfer.getData('text/plain') || pickedAction;
                if (!action) return;
                assignAction(zone, action);
                clearPicked();
            });
            zone.addEventListener('click', () => {
                if (pickedAction) {
                    assignAction(zone, pickedAction);
                    clearPicked();
                } else if (assignments[zone.dataset.ear]) {
                    const currentAction = assignments[zone.dataset.ear];
                    if (currentAction === 'music') {
                        toggleMusic();
                    } else if (currentAction === 'play') {
                        toggleMusic();
                    } else if (currentAction === 'next') {
                        if (trackButtons.length) {
                            const currentIndex = trackButtons.findIndex(btn => btn.classList.contains('is-active'));
                            const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % trackButtons.length : 0;
                            trackButtons[nextIndex]?.click();
                        }
                    } else {
                        showToast(`${earLabels[zone.dataset.ear]} 当前操作：${actionLabels[currentAction]}`);
                    }
                }
            });
            zone.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && pickedAction) {
                    e.preventDefault();
                    assignAction(zone, pickedAction);
                    clearPicked();
                } else if ((e.key === 'Enter' || e.key === ' ') && assignments[zone.dataset.ear] === 'music') {
                    e.preventDefault();
                    toggleMusic();
                }
            });
        });

        resetBtn?.addEventListener('click', () => {
            Object.keys(assignments).forEach(key => { assignments[key] = null; });
            zones.forEach(zone => {
                zone.classList.remove('is-filled');
                const body = $('.zone-body', zone);
                if (body) body.textContent = '拖拽操作到此';
            });
            clearPicked();
            showToast('已恢复默认触控设置');
        });

        function activateTrack(btn) {
            if (!btn || !musicAudio) return;
            ensureAudioInitialized();
            trackButtons.forEach(track => track.classList.toggle('is-active', track === btn));
            musicAudio.src = btn.dataset.src;
            if (musicTitle) musicTitle.textContent = `当前曲目：${btn.dataset.title}`;
            setMusicIndicator('加载中…');
            musicAudio.play().catch(() => {
                setMusicIndicator('等待播放');
            });
        }

        trackButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activateTrack(btn);
            });
        });

        musicToggle?.addEventListener('click', () => {
            toggleMusic();
        });

        if (musicAudio) {
            musicAudio.addEventListener('play', () => {
                if (musicToggle) {
                    musicToggle.textContent = '暂停';
                    musicToggle.setAttribute('aria-label', '暂停当前曲目');
                    musicToggle.setAttribute('aria-pressed', 'true');
                }
                setMusicIndicator('播放中');
            });
            musicAudio.addEventListener('pause', () => {
                if (musicToggle) {
                    musicToggle.textContent = '播放';
                    musicToggle.setAttribute('aria-label', '播放当前曲目');
                    musicToggle.setAttribute('aria-pressed', 'false');
                }
                setMusicIndicator('已暂停');
            });
            musicAudio.addEventListener('ended', () => {
                setMusicIndicator('播放完成');
                if (musicProgress) musicProgress.style.width = '100%';
                setTimeout(() => {
                    if (!musicAudio.paused) return;
                    if (musicProgress) musicProgress.style.width = '0%';
                    setMusicIndicator('等待播放');
                }, 700);
            });
            musicAudio.addEventListener('timeupdate', updateProgress);
            musicAudio.addEventListener('loadedmetadata', () => {
                updateProgress();
                setMusicIndicator('准备播放');
            });
        }

        // 初始化默认曲目但不自动播放
        if (trackButtons.length && musicTitle) {
            const active = trackButtons.find(btn => btn.classList.contains('is-active')) || trackButtons[0];
            if (active) {
                musicTitle.textContent = `当前曲目：${active.dataset.title}`;
                if (musicAudio) musicAudio.src = active.dataset.src;
            }
        }
        setMusicIndicator('等待播放');
    }
})();


