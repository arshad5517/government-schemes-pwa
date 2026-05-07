class GovernmentSchemesApp {
    constructor() {
        this.currentPage = 'home';
        this.isDarkMode = false;
        this.isHindi = true;
        this.user = null;
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.recent = JSON.parse(localStorage.getItem('recent') || '[]');
        this.init();
    }

    async init() {
        // Hide splash screen
        setTimeout(() => {
            document.getElementById('splash-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('splash-screen').style.display = 'none';
                document.getElementById('app-container').style.opacity = '1';
            }, 500);
        }, 2000);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW registration failed'));
        }

        // Load preferences
        this.loadPreferences();
        
        // Initialize Firebase
        await this.initFirebase();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // PWA install prompt
        this.setupPWAInstall();
        
        // Network status
        this.setupNetworkStatus();
        
        // Load schemes
        SchemesApp.loadSchemes();
        
        // Show banner ad
        this.showBannerAd();
    }

    loadPreferences() {
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedLang = localStorage.getItem('language');
        
        this.isDarkMode = savedDarkMode === 'true';
        this.isHindi = savedLang !== 'en';
        
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
            document.getElementById('moon-icon').classList.remove('hidden');
            document.getElementById('sun-icon').classList.add('hidden');
        }
        
        this.updateLanguage();
    }

    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());
        
        // Language toggle
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        
        // Navigation
        document.querySelectorAll('.nav-btn, .menu-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                this.navigateTo(page);
                this.showInterstitialAd();
            });
        });
        
        // Mobile menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.remove('hidden');
        });
        
        document.getElementById('close-menu').addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.add('hidden');
        });
        
        // Search
        document.getElementById('scheme-search').addEventListener('input', (e) => {
            SchemesApp.filterSchemes(e.target.value);
        });
        
        // Category filter
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
                e.target.classList.add('active', 'bg-blue-500', 'text-white');
                SchemesApp.filterByCategory(e.target.dataset.category);
            });
        });
        
        // Back button
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.navigateTo('home');
        });
        
        // Clear search
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('scheme-search').value = '';
            SchemesApp.filterSchemes('');
            document.querySelector('.category-filter[data-category="all"]').click();
        });
        
        // Interstitial ad close
        document.getElementById('close-interstitial').addEventListener('click', () => {
            document.getElementById('interstitial-ad').classList.add('hidden');
        });
    }

    async initFirebase() {
        try {
            // Analytics
            if (window.analytics) {
                window.analytics.logEvent('app_open');
            }
            
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showToast('नोटिफिकेशन सक्षम!', 'success');
                        document.getElementById('notification-banner').classList.remove('hidden');
                    }
                });
            }
            
            // Get FCM token
            if (window.messaging && Notification.permission === 'granted') {
                try {
                    const token = await firebaseModules.getToken(window.messaging, {
                        vapidKey: 'YOUR_VAPID_KEY'
                    });
                    console.log('FCM Token:', token);
                } catch (error) {
                    console.log('FCM Token error:', error);
                }
            }
        } catch (error) {
            console.log('Firebase init error:', error);
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        
        document.getElementById('moon-icon').classList.toggle('hidden', !this.isDarkMode);
        document.getElementById('sun-icon').classList.toggle('hidden', this.isDarkMode);
        
        localStorage.setItem('darkMode', this.isDarkMode);
        this.showToast(this.isDarkMode ? 'डार्क मोड चालू' : 'लाइट मोड चालू', 'info');
    }

    toggleLanguage() {
        this.isHindi = !this.isHindi;
        document.getElementById('lang-toggle').textContent = this.isHindi ? 'EN' : 'हिं';
        localStorage.setItem('language', this.isHindi ? 'hi' : 'en');
        this.updateLanguage();
        SchemesApp.loadSchemes();
        this.showToast(this.isHindi ? 'हिंदी चयनित' : 'English selected', 'info');
    }

    updateLanguage() {
        document.documentElement.lang = this.isHindi ? 'hi' : 'en';
        document.documentElement.dir = this.isHindi ? 'ltr' : 'ltr';
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-active'));
        
        // Show target page
        document.getElementById(`${page}-page`).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('nav-active');
        
        this.currentPage = page;
        
        // Load page content
        switch(page) {
            case 'favorites':
                SchemesApp.loadFavorites();
                break;
            case 'recent':
                SchemesApp.loadRecent();
                break;
            case 'home':
                SchemesApp.loadSchemes();
                break;
        }
        
        // Track analytics
        if (window.analytics) {
            window.analytics.logEvent('page_view', { page_title: page });
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button after 5 seconds
            setTimeout(() => {
                this.showInstallPrompt();
            }, 5000);
        });
        
        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
        });
    }

    showInstallPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt animate-slide-up';
        prompt.innerHTML = `
            <span>📱 ऐप को होमस्क्रीन पर जोड़ें!</span>
            <button onclick="GovernmentSchemesApp.installPWA()">स्थापित करें</button>
            <button onclick="this.parentElement.remove()">छिपाएं</button>
        `;
        document.body.appendChild(prompt);
        
        window.GovernmentSchemesApp = this;
    }

    static installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
            });
        }
    }

    setupNetworkStatus() {
        window.addEventListener('online', () => {
            document.querySelector('.offline-indicator')?.remove();
            this.showToast('इंटरनेट कनेक्शन बहाल', 'success');
        });
        
        window.addEventListener('offline', () => {
            const indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.textContent = '❌ ऑफलाइन';
            document.body.appendChild(indicator);
        });
    }

    showInterstitialAd() {
        setTimeout(() => {
            document.getElementById('interstitial-ad').classList.remove('hidden');
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }, 1000);
    }

    showBannerAd() {
        setTimeout(() => {
            document.getElementById('banner-ad').classList.remove('hidden');
        }, 2000);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.className = `p-4 rounded-2xl shadow-xl backdrop-blur-sm border animate-slide-up ${
            type === 'success' ? 'bg-green-500/90 text-white' :
            type === 'error' ? 'bg-red-500/90 text-white' :
            type === 'warning' ? 'bg-yellow-500/90 text-white' :
            'bg-blue-500/90 text-white'
        }`;
        
        toast.innerHTML = `${icons[type] || 'ℹ️'} ${message}`;
        document.getElementById('toast-container').appendChild(toast);
        document.getElementById('toast-container').classList.remove('hidden');
        
        setTimeout(() => {
            toast.remove();
            if (!document.getElementById('toast-container').children.length) {
                document.getElementById('toast-container').classList.add('hidden');
            }
        }, 4000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SchemesApp = new GovernmentSchemesApp();
});