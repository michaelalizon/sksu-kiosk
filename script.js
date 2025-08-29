// SKSU Campus Kiosk JavaScript
// Configuration
const CONFIG = {
    SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1f74bbovZFgzWKTJnha4XEESEu6qWfBVLmMVu0XZvdYw/gviz/tq?tqx=out:csv&gid=1509811981',
    REFRESH_INTERVAL: 30000, // 30 seconds
    SLIDE_DURATION: 8000, // 8 seconds per slide
    FALLBACK_IMAGE: 'https://sksu.edu.ph/wp-content/uploads/2021/04/sksu1.png'
};

class SlideshowManager {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.slideInterval = null;
        this.lastUpdateTime = 0;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing SKSU Campus Kiosk...');
        
        // Load initial data
        await this.loadSlides();
        
        // Start slideshow if we have slides
        if (this.slides.length > 0) {
            this.renderSlides();
            this.startAutoSlide();
        } else {
            this.showFallbackContent();
        }
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        console.log('✅ Kiosk initialized successfully!');
    }
    
    async loadSlides() {
        try {
            console.log('📊 Loading slideshow data from Google Sheets...');
            console.log('📋 Spreadsheet URL:', CONFIG.SPREADSHEET_URL);
            
            // Fetch data from Google Sheets CSV export
            const response = await fetch(CONFIG.SPREADSHEET_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('📄 Raw CSV data:', csvText.substring(0, 200) + '...');
            
            // Parse CSV data
            const rows = this.parseCSV(csvText);
            console.log('📊 Parsed rows:', rows.length);
            
            if (rows.length <= 1) {
                console.log('⚠️ No data found in spreadsheet');
                this.slides = [];
                return;
            }
            
            // Process the data (skip header row)
            const dataRows = rows.slice(1);
            this.slides = dataRows
                .filter(row => row[2] && row[2].trim() !== '') // Filter rows with titles
                .map((row, index) => {
                    console.log(`🔍 Processing slide ${index + 1}:`, {
                        imageUrl: row[0],
                        description: row[1],
                        title: row[2],
                        campusId: row[3]
                    });
                    return {
                        imageUrl: this.processImageUrl(row[0] || ''),
                        description: row[1] || 'No description available',
                        title: row[2] || 'Untitled',
                        campusId: row[3] || 'Main Campus'
                    };
                });
            
            console.log(`✅ Loaded ${this.slides.length} slides successfully`);
            this.lastUpdateTime = Date.now();
            
        } catch (error) {
            console.error('❌ Error loading slideshow data:', error);
            console.error('❌ Full error details:', error.message);
            this.slides = [];
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        return lines.map(line => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            result.push(current.trim());
            return result;
        }).filter(row => row.length > 1);
    }
    
    processImageUrl(url) {
        if (!url || url.trim() === '') {
            console.log('⚠️ Empty image URL, using fallback');
            return CONFIG.FALLBACK_IMAGE;
        }
        
        // Clean the URL (remove quotes if any)
        url = url.replace(/['"]/g, '').trim();
        console.log('🔗 Processing image URL:', url);
        
        // Handle Google Drive URLs
        if (url.includes('drive.google.com')) {
            let fileId = '';
            
            // Extract file ID from various Google Drive URL formats
            if (url.includes('/file/d/')) {
                const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
                fileId = match ? match[1] : '';
            } else if (url.includes('id=')) {
                const match = url.match(/id=([a-zA-Z0-9-_]+)/);
                fileId = match ? match[1] : '';
            } else if (url.includes('/open?id=')) {
                const match = url.match(/\/open\?id=([a-zA-Z0-9-_]+)/);
                fileId = match ? match[1] : '';
            }
            
            if (fileId) {
                // Convert to direct image URL that works with CORS
                const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                console.log('✅ Converted Google Drive URL:', directUrl);
                return directUrl;
            } else {
                console.log('⚠️ Could not extract file ID from Google Drive URL, using fallback');
                return CONFIG.FALLBACK_IMAGE;
            }
        }
        
        // For other URLs, return as is
        console.log('✅ Using direct URL:', url);
        return url;
    }
    
    renderSlides() {
        const slidesWrapper = document.getElementById('slidesWrapper');
        const dotsContainer = document.getElementById('slideshowDots');
        const slideCounter = document.getElementById('slideCounter');
        const noDataMessage = document.getElementById('noDataMessage');
        
        if (!slidesWrapper) return;
        
        // Hide no data message
        if (noDataMessage) {
            noDataMessage.style.display = 'none';
        }
        
        // Clear existing content
        slidesWrapper.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        if (this.slides.length === 0) {
            this.showFallbackContent();
            return;
        }
        
        // Create slides
        this.slides.forEach((slide, index) => {
            // Create slide element
            const slideElement = document.createElement('div');
            slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
            
            slideElement.innerHTML = `
                <div class="slide-content">
                    <div class="slide-image-container">
                        <img src="${slide.imageUrl}" 
                             alt="${slide.title}" 
                             class="slide-image"
                             onerror="this.src='${CONFIG.FALLBACK_IMAGE}'; this.onerror=null;"
                             loading="lazy">
                    </div>
                    <div class="slide-text">
                        <h2 class="slide-title">${this.escapeHtml(slide.title)}</h2>
                        <p class="slide-description">${this.escapeHtml(slide.description)}</p>
                        <div class="slide-campus">📍 ${this.escapeHtml(slide.campusId)}</div>
                    </div>
                </div>
            `;
            
            slidesWrapper.appendChild(slideElement);
            
            // Create navigation dot
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);
        });
        
        // Update counter
        if (slideCounter) {
            slideCounter.textContent = `1 / ${this.slides.length}`;
        }
        
        // Update last updated time
        this.updateLastUpdatedDisplay();
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        // Remove active class from current slide and dot
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to new slide and dot
        if (slides[index]) slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        
        this.currentSlideIndex = index;
        
        // Update counter
        const slideCounter = document.getElementById('slideCounter');
        if (slideCounter) {
            slideCounter.textContent = `${index + 1} / ${this.slides.length}`;
        }
    }
    
    nextSlide() {
        if (this.slides.length === 0) return;
        const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        if (this.slides.length === 0) return;
        const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        // Clear existing interval
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        // Only start auto-slide if we have multiple slides
        if (this.slides.length > 1) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, CONFIG.SLIDE_DURATION);
            
            console.log('🔄 Auto-slideshow started');
        }
    }
    
    startAutoRefresh() {
        setInterval(async () => {
            console.log('🔄 Checking for updates...');
            
            const previousSlideCount = this.slides.length;
            await this.loadSlides();
            
            // If data changed, re-render
            if (this.slides.length !== previousSlideCount) {
                console.log('🆕 New data detected, updating slideshow...');
                this.renderSlides();
                this.startAutoSlide();
            }
            
        }, CONFIG.REFRESH_INTERVAL);
    }
    
    showFallbackContent() {
        const noDataMessage = document.getElementById('noDataMessage');
        if (noDataMessage) {
            noDataMessage.style.display = 'flex';
        }
        
        console.log('📋 Showing fallback content - no slides available');
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }
    
    updateLastUpdatedDisplay() {
        const updateTime = document.getElementById('updateTime');
        if (updateTime) {
            const now = new Date();
            updateTime.textContent = now.toLocaleString('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utility Functions
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    
    numbers.forEach(number => {
        const target = parseInt(number.textContent.replace(/\D/g, ''));
        const isPlus = number.textContent.includes('+');
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            number.textContent = Math.floor(current) + (isPlus ? '+' : '');
        }, 30);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow manager
    window.slideshowManager = new SlideshowManager();
    
    // Animate statistics numbers
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!window.slideshowManager) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                window.slideshowManager.previousSlide();
                break;
            case 'ArrowRight':
                window.slideshowManager.nextSlide();
                break;
            case ' ': // Spacebar
                e.preventDefault();
                window.slideshowManager.nextSlide();
                break;
        }
    });
    
    // Add touch support for mobile devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Simple swipe detection
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', function(e) {
            if (!window.slideshowManager) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only handle horizontal swipes that are longer than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    window.slideshowManager.nextSlide();
                } else {
                    // Swipe right - previous slide
                    window.slideshowManager.previousSlide();
                }
            }
        });
    }
    
    console.log('🎉 SKSU Campus Kiosk loaded successfully!');
});
