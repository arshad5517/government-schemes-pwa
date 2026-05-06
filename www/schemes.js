class SchemesApp {
    static schemes = [];
    static filteredSchemes = [];
    static currentCategory = 'all';

    static async loadSchemes() {
        const grid = document.getElementById('schemes-grid');
        const loading = document.getElementById('loading-schemes');
        
        grid.innerHTML = '';
        loading.classList.remove('hidden');
        
        try {
            // Try Firebase first
            if (window.db) {
                this.schemes = await this.loadFromFirestore();
            } else {
                // Fallback to local data
                this.schemes = this.getDemoSchemes();
            }
            
            this.filteredSchemes = [...this.schemes];
            this.renderSchemes(grid);
        } catch (error) {
            console.error('Error loading schemes:', error);
            this.schemes = this.getDemoSchemes();
            this.renderSchemes(grid);
        } finally {
            loading.classList.add('hidden');
        }
    }

    static async loadFromFirestore() {
        // Implementation for Firestore
        const snapshot = await window.db.collection('schemes').limit(50).get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isFavorite: window.SchemesApp.favorites.includes(doc.id)
        }));
    }

    static getDemoSchemes() {
        return [
            {
                id: 'pmkisan',
                title: { hi: 'प्रधानमंत्री किसान सम्मान निधि', en: 'PM Kisan Samman Nidhi' },
                category: 'agriculture',
                eligibility: { hi: 'सभी छोटे किसान', en: 'All small farmers' },
                benefit: { hi: '₹6000/वर्ष', en: '₹6000/year' },
                department: { hi: 'कृषि मंत्रालय', en: 'Ministry of Agriculture' },
                image: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76e6?w=400&h=300&fit=crop',
                description: { 
                    hi: 'छोटे और सीमांत किसानों को प्रति वर्ष 6000 रुपये की सहायता।',
                    en: '₹6000 annual support to small and marginal farmers.'
                },
                link: 'https://pmkisan.gov.in',
                lastUpdated: '2024-01-15'
            },
            {
                id: 'pmay',
                title: { hi: 'प्रधानमंत्री आवास योजना', en: 'Pradhan Mantri Awas Yojana' },
                category: 'housing',
                eligibility: { hi: 'आय ₹3 लाख से कम', en: 'Income < ₹3 lakh' },
                benefit: { hi: 'सब्सिडी + लोन', en: 'Subsidy + Loan' },
                department: { hi: 'आवास मंत्रालय', en: 'Housing Ministry' },
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
                description: { 
                    hi: 'कम आय वालों को घर खरीदने/बनाने के लिए सब्सिडी।',
                    en: 'Housing subsidy for low income families.'
                },
                link: 'https://pmaymis.gov.in',
                lastUpdated: '2024-02-20'
            },
            {
                id: 'ayushman',
                title: { hi: 'आयुष्मान भारत', en: 'Ayushman Bharat' },
                category: 'health',
                eligibility: { hi: 'SECC 2011 डेटा', en: 'SECC 2011 data' },
                benefit: { hi: '₹5 लाख बीमा', en: '₹5 lakh insurance' },
                department: { hi: 'स्वास्थ्य मंत्रालय', en: 'Health Ministry' },
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
                description: { 
                    hi: 'गरीब परिवारों को 5 लाख तक का मुफ्त इलाज।',
                    en: 'Free healthcare up to ₹5 lakh for poor families.'
                },
                link: 'https://pmjay.gov.in',
                lastUpdated: '2024-03-10'
            }
            // Add more schemes...
        ];
    }

    static renderSchemes(container) {
        container.innerHTML = '';
        
        this.filteredSchemes.slice(0, 18).forEach(scheme => {
            const card = this.createSchemeCard(scheme);
            container.appendChild(card);
        });
    }

    static createSchemeCard(scheme) {
        const isHindi = window.SchemesApp.isHindi;
        const card = document.createElement('div');
        card.className = 'scheme-card bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group';
        card.dataset.schemeId = scheme.id;
        
        card.innerHTML = `
            <div class="relative overflow-hidden h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img src="${scheme.image}" alt="${scheme.title[isHindi ? 'hi' : 'en']}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 lazy">
                <div class="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg backdrop-blur-sm">
                    <span class="text-xs font-bold px-2 py-1 rounded-lg ${
                        scheme.category === 'education' ? 'bg-blue-100 text-blue-800' :
                        scheme.category === 'health' ? 'bg-green-100 text-green-800' :
                        scheme.category === 'agriculture' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                    }">${this.getCategoryName(scheme.category, isHindi)}</span>
                </div>
                ${scheme.isFavorite ? '<div class="absolute top-3 left-3 p-2 bg-red-500 text-white rounded-xl shadow-lg"><span>❤️</span></div>' : ''}
            </div>
            <div class="p-6">
                <h3 class="font-bold text-xl mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ${scheme.title[isHindi ? 'hi' : 'en']}
                </h3>
                <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm">
                        <span class="w-20 font-medium text-gray-500">पात्रता:</span>
                        <span class="text-gray-700 dark:text-gray-300">${scheme.eligibility[isHindi ? 'hi' : 'en']}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="w-20 font-medium text-gray-500">लाभ:</span>
                        <span class="font-bold text-green-600">${scheme.benefit[isHindi ? 'hi' : 'en']}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>${scheme.department[isHindi ? 'hi' : 'en']}</span>
                    <span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">${scheme.lastUpdated}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.showSchemeDetail(scheme));
        return card;
    }

    static showSchemeDetail(scheme) {
        // Add to recent
        const recent = window.SchemesApp.recent;
        const recentIndex = recent.indexOf(scheme.id);
        if (recentIndex > 0) recent.splice(recentIndex, 1);
        recent.unshift(scheme.id);
        window.SchemesApp.recent = recent.slice(0, 20);
        localStorage.setItem('recent', JSON.stringify(window.SchemesApp.recent));
        
        // Show detail page
        window.SchemesApp.navigateTo('home'); // Reset first
        const detailContainer = document.getElementById('scheme-detail');
        const isHindi = window.SchemesApp.isHindi;
        
        detailContainer.innerHTML = `
            <div class="relative">
                <img src="${scheme.image}" alt="${scheme.title[isHindi ? 'hi' : 'en']}" class="w-full h-96 object-cover rounded-t-3xl">
                <div class="absolute top-6 right-6 flex space-x-2">
                    <button onclick="SchemesApp.toggleFavorite('${scheme.id}')" 
                            class="p-3 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
                        <span id="favorite-btn-${scheme.id}">❤️</span>
                    </button>
                    <button onclick="SchemesApp.shareScheme('${scheme.id}')" 
                            class="p-3 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
                        <span>📤</span>
                    </button>
                </div>
            </div>
            <div class="p-8 space-y-6">
                <div>
                    <h1 class="text-3xl md:text-4xl font-bold mb-4">${scheme.title[isHindi ? 'hi' : 'en']}</h1>
                    <p class="prose dark:prose-invert max-w-none">${scheme.description[isHindi ? 'hi' : 'en']}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                        <h3 class="font-bold text-lg mb-4 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                            </svg>
                            पात्रता
                        </h3>
                        <ul class="space-y-2 text-sm">
                            <li>• ${scheme.eligibility[isHindi ? 'hi' : 'en']}</li>
                        </ul>
                    </div>
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl">
                        <h3 class="font-bold text-lg mb-4 flex items-center text-emerald-700 dark:text-emerald-400">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                            </svg>
                            लाभ
                        </h3>
                        <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                            ${scheme.benefit[isHindi ? 'hi' : 'en']}
                        </div>
                        <p class="text-sm text-emerald-700 dark:text-emerald-400">${scheme.department[isHindi ? 'hi' : 'en']}</p>
                    </div>
                </div>
                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <a href="${scheme.link}" target="_blank" 
                       class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full md:w-auto justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                        आधिकारिक वेबसाइट
                    </a>
                </div>
            </div>
        `;
        
        document.getElementById('scheme-detail-page').classList.remove('hidden');
        document.getElementById('home-page').classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    static toggleFavorite(schemeId) {
        const app = window.SchemesApp;
        const index = app.favorites.indexOf(schemeId);
        
        if (index > -1) {
            app.favorites.splice(index, 1);
            app.showToast('पसंदीदा से हटाया गया', 'info');
        } else {
            app.favorites.push(schemeId);
            app.showToast('पसंदीदा में जोड़ा गया', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(app.favorites));
        app.showInterstitialAd();
    }

    static shareScheme(schemeId) {
        const scheme = this.schemes.find(s => s.id === schemeId);
        if (!scheme) return;
        
        const isHindi = window.SchemesApp.isHindi;
        const shareData = {
            title: scheme.title[isHindi ? 'hi' : 'en'],
            text: `${scheme.title[isHindi ? 'hi' : 'en']} - ${scheme.benefit[isHindi ? 'hi' : 'en']}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareData.text + '\n' + shareData.url);
            window.SchemesApp.showToast('लिंक कॉपी हो गया!', 'success');
        }
    }

    static filterSchemes(query) {
        const normalizedQuery = query.toLowerCase();
        this.filteredSchemes = this.schemes.filter(scheme => {
            const isHindi = window.SchemesApp.isHindi;
            const title = scheme.title[isHindi ? 'hi' : 'en'].toLowerCase();
            return title.includes(normalizedQuery) || scheme.category.includes(normalizedQuery);
        });
        this.renderSchemes(document.getElementById('schemes-grid'));
        
        const noResults = document.getElementById('no-results');
        noResults.classList.toggle('hidden', this.filteredSchemes.length > 0);
    }

    static filterByCategory(category) {
        this.currentCategory = category;
        if (category === 'all') {
            this.filteredSchemes = [...this.schemes];
        } else {
            this.filteredSchemes = this.schemes.filter(scheme => scheme.category === category);
        }
        this.renderSchemes(document.getElementById('schemes-grid'));
    }

    static loadFavorites() {
        const favoritesGrid = document.getElementById('favorites-grid');
        const favorites = window.SchemesApp.favorites;
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="text-6xl mb-4">❤️</div>
                    <h3 class="text-2xl font-bold mb-2">कोई पसंदीदा योजना नहीं</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">योजनाओं को हृदय आइकन दबाकर पसंदीदा में जोड़ें</p>
                    <button onclick="window.SchemesApp.navigateTo('home')" 
                            class="px-8 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600">
                        सभी योजनाएं देखें
                    </button>
                </div>
            `;
            return;
        }
        
        const favoriteSchemes = this.schemes.filter(scheme => favorites.includes(scheme.id));
        favoritesGrid.innerHTML = '';
        favoriteSchemes.forEach(scheme => {
            const card = this.createSchemeCard(scheme);
            favoritesGrid.appendChild(card);
        });
    }

    static loadRecent() {
        const recentGrid = document.getElementById('recent-grid');
        const recent = window.SchemesApp.recent;
        
        if (recent.length === 0) {
            recentGrid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="text-6xl mb-4">📖</div>
                    <h3 class="text-2xl font-bold mb-2">कोई हालिया योजना नहीं</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">योजनाओं को देखने के बाद यहां दिखेंगी</p>
                    <button onclick="window.SchemesApp.navigateTo('home')" 
                            class="px-8 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600">
                        सभी योजनाएं देखें
                    </button>
                </div>
            `;
            return;
        }
        
        const recentSchemes = this.schemes.filter(scheme => recent.includes(scheme.id));
        recentGrid.innerHTML = '';
        recentSchemes.slice(0, 12).forEach(scheme => {
            const card = this.createSchemeCard(scheme);
            recentGrid.appendChild(card);
        });
    }

    static getCategoryName(category, isHindi) {
        const names = {
            education: isHindi ? 'शिक्षा' : 'Education',
            health: isHindi ? 'स्वास्थ्य' : 'Health',
            agriculture: isHindi ? 'कृषि' : 'Agriculture',
            women: isHindi ? 'महिला' : 'Women',
            employment: isHindi ? 'रोजगार' : 'Employment',
            housing: isHindi ? 'आवास' : 'Housing'
        };
        return names[category] || category;
    }
}