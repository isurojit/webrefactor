// Exchange rates (update these periodically or use an API)
const exchangeRates = {
    USD: 1,
    INR: 83.12,
    EUR: 0.92,
    GBP: 0.79
};

// Currency symbols
const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParallax();
    initScrollReveal();
    initPriceCalculator();
    initPricingPlans();
    initGeolocation();
    initHamburger();
});

// Navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effect
function initParallax() {
    const parallaxBg = document.getElementById('parallax-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        
        if (parallaxBg) {
            parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
    });
    
    // Mouse movement parallax for hero section
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        if (parallaxBg && window.pageYOffset < window.innerHeight) {
            const moveX = (mouseX - 0.5) * 50;
            const moveY = (mouseY - 0.5) * 50;
            parallaxBg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }
    });
}

// Scroll reveal animation
function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// Price Calculator
function initPriceCalculator() {
    const projectType = document.getElementById('projectType');
    const pagesSlider = document.getElementById('pages');
    const pagesValue = document.getElementById('pagesValue');
    const currencySelect = document.getElementById('currency');
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox');
    
    const totalPriceEl = document.getElementById('totalPrice');
    const basePriceEl = document.getElementById('basePrice');
    const pagesCostEl = document.getElementById('pagesCost');
    const featuresCostEl = document.getElementById('featuresCost');
    
    // Update pages value display
    pagesSlider.addEventListener('input', () => {
        pagesValue.textContent = pagesSlider.value;
        calculatePrice();
    });
    
    // Calculate price on change
    projectType.addEventListener('change', calculatePrice);
    currencySelect.addEventListener('change', calculatePrice);
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculatePrice);
    });
    
    function calculatePrice() {
        const baseProjectCost = parseFloat(projectType.value) || 0;
        const numPages = parseInt(pagesSlider.value);
        const currency = currencySelect.value;
        
        // Calculate pages cost (base project includes 5 pages, $50 per additional page)
        const includedPages = 5;
        const additionalPages = Math.max(0, numPages - includedPages);
        const pagesCost = additionalPages * 50;
        
        // Calculate features cost
        let featuresCost = 0;
        featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                featuresCost += parseFloat(checkbox.value);
            }
        });
        
        // Total in USD
        const totalUSD = baseProjectCost + pagesCost + featuresCost;
        
        // Convert to selected currency
        const rate = exchangeRates[currency];
        const symbol = currencySymbols[currency];
        
        const baseConverted = (baseProjectCost * rate).toFixed(0);
        const pagesConverted = (pagesCost * rate).toFixed(0);
        const featuresConverted = (featuresCost * rate).toFixed(0);
        const totalConverted = (totalUSD * rate).toFixed(0);
        
        // Update display
        basePriceEl.textContent = `${symbol}${formatNumber(baseConverted)}`;
        pagesCostEl.textContent = `${symbol}${formatNumber(pagesConverted)}`;
        featuresCostEl.textContent = `${symbol}${formatNumber(featuresConverted)}`;
        totalPriceEl.textContent = `${symbol}${formatNumber(totalConverted)}`;
    }
    
    // Initial calculation
    calculatePrice();
}

// Pricing Plans Currency Switcher
function initPricingPlans() {
    const currencyButtons = document.querySelectorAll('.currency-btn');
    const priceAmounts = document.querySelectorAll('.price-amount');
    
    currencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCurrency = button.dataset.currency;
            
            // Update active button
            currencyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update currency symbols and amounts
            const symbol = currencySymbols[selectedCurrency];
            document.querySelectorAll('.currency-symbol').forEach(el => {
                el.textContent = symbol;
            });
            
            // Update prices
            priceAmounts.forEach(priceEl => {
                const currency = selectedCurrency.toLowerCase();
                const amount = priceEl.dataset[currency];
                priceEl.textContent = formatNumber(amount);
            });
        });
    });
}

// Geolocation and Auto-translate
function initGeolocation() {
    // Try to get user's location
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Use reverse geocoding to get country (you'd normally use an API here)
                // For now, we'll detect based on browser language as fallback
                detectLanguage();
            },
            error => {
                // If geolocation fails, fall back to browser language
                detectLanguage();
            }
        );
    } else {
        detectLanguage();
    }
}

function detectLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0]; // Get base language code
    
    // Language mapping for Google Translate
    const languageMap = {
        'hi': 'hi', // Hindi
        'bn': 'bn', // Bengali
        'es': 'es', // Spanish
        'fr': 'fr', // French
        'de': 'de', // German
        'it': 'it', // Italian
        'pt': 'pt', // Portuguese
        'ru': 'ru', // Russian
        'ja': 'ja', // Japanese
        'ko': 'ko', // Korean
        'zh': 'zh-CN', // Chinese
        'ar': 'ar'  // Arabic
    };
    
    // Auto-set currency based on location/language
    if (langCode === 'hi' || langCode === 'bn') {
        // Indian languages - set to INR
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.value = 'INR';
            currencySelect.dispatchEvent(new Event('change'));
        }
        
        // Set INR in pricing plans
        const inrButton = document.querySelector('.currency-btn[data-currency="INR"]');
        if (inrButton) {
            inrButton.click();
        }
    }
    
    // Note: Google Translate widget handles language switching automatically
    // based on user selection. We don't force auto-translate as it can be jarring.
    // Users can use the widget to translate if needed.
}

// Hamburger menu
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Utility function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// GSAP Animations (if you want more advanced parallax)
if (typeof gsap !== 'undefined') {
    // Hero section animation
    gsap.from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    });
    
    gsap.from('.hero-line', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.2
    });
    
    gsap.from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8
    });
    
    gsap.from('.hero-buttons', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1
    });
    
    // Scroll-triggered animations
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Process cards
        gsap.utils.toArray('.process-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.1
            });
        });
        
        // Service cards
        gsap.utils.toArray('.service-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.1
            });
        });
        
        // Portfolio items
        gsap.utils.toArray('.portfolio-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.1
            });
        });
        
        // Parallax background effect
        gsap.to('.parallax-bg', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 300,
            ease: 'none'
        });
    }
}

// Update exchange rates periodically (optional - would need an API)
async function updateExchangeRates() {
    try {
        // Example: Using a free API like exchangerate-api.com
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // exchangeRates.INR = data.rates.INR;
        // exchangeRates.EUR = data.rates.EUR;
        // exchangeRates.GBP = data.rates.GBP;
        
        // For now, we use static rates
        console.log('Using static exchange rates');
    } catch (error) {
        console.error('Failed to update exchange rates:', error);
    }
}

// Call this on page load if you want live rates
// updateExchangeRates();
