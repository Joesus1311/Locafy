/**
 * Locafy (basecode) - Central Design System JS
 * 
 * Auto-injects standard brand variables into the Tailwind CSS CDN config.
 * Re-maps all old theme colors (Teal/Green) to the new Royal Blue & Emerald Green brand colors
 * to achieve consistency with the Locafy design system without breaking existing classes.
 * 
 * Include this script AFTER loading:
 *   1. design-system.css (Link stylesheet)
 *   2. tailwind-cdn (https://cdn.tailwindcss.com)
 */

if (window.tailwind) {
    window.tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    // ==========================================
                    // 1. New Brand Tokens (matching Locafy)
                    // ==========================================
                    brand: {
                        50: 'hsl(var(--color-primary-50-hsl))',
                        100: 'hsl(var(--color-primary-100-hsl))',
                        200: 'hsl(var(--color-primary-200-hsl))',
                        500: 'hsl(var(--color-primary-500-hsl))',
                        600: 'hsl(var(--color-primary-600-hsl))',
                        700: 'hsl(var(--color-primary-700-hsl))',
                        800: 'hsl(var(--color-primary-800-hsl))',
                        900: 'hsl(var(--color-primary-900-hsl))',
                        950: 'hsl(var(--color-primary-950-hsl))',
                    },
                    seller: {
                        50: 'hsl(var(--color-secondary-50-hsl))',
                        100: 'hsl(var(--color-secondary-100-hsl))',
                        500: 'hsl(var(--color-secondary-500-hsl))',
                        600: 'hsl(var(--color-secondary-600-hsl))',
                        700: 'hsl(var(--color-secondary-700-hsl))',
                    },
                    accent: {
                        50: 'hsl(var(--color-accent-50-hsl))',
                        100: 'hsl(var(--color-accent-100-hsl))',
                        500: 'hsl(var(--color-accent-500-hsl))',
                        600: 'hsl(var(--color-accent-600-hsl))',
                        700: 'hsl(var(--color-accent-700-hsl))',
                    },
                    danger: {
                        50: 'hsl(var(--color-danger-50-hsl))',
                        100: 'hsl(var(--color-danger-100-hsl))',
                        500: 'hsl(var(--color-danger-500-hsl))',
                        600: 'hsl(var(--color-danger-600-hsl))',
                        700: 'hsl(var(--color-danger-700-hsl))',
                    },
                    neutral: {
                        50: 'hsl(var(--color-neutral-50-hsl))',
                        100: 'hsl(var(--color-neutral-100-hsl))',
                        200: 'hsl(var(--color-neutral-200-hsl))',
                        300: 'hsl(var(--color-neutral-300-hsl))',
                        400: 'hsl(var(--color-neutral-400-hsl))',
                        500: 'hsl(var(--color-neutral-500-hsl))',
                        600: 'hsl(var(--color-neutral-600-hsl))',
                        700: 'hsl(var(--color-neutral-700-hsl))',
                        800: 'hsl(var(--color-neutral-800-hsl))',
                        900: 'hsl(var(--color-neutral-900-hsl))',
                    },

                    // ==========================================
                    // 2. Compatibility Mapping (maps old teal names to new royal blue colors)
                    // ==========================================
                    "primary": 'hsl(var(--color-primary-900-hsl))', // was "#002627" (Deep Teal) -> now Royal Blue 900
                    "teal-deep": 'hsl(var(--color-primary-900-hsl))', // was "#0F3D3E" -> now Royal Blue 900
                    "teal-vibrant": 'hsl(var(--color-primary-600-hsl))', // was "#14B8A6" -> now Royal Blue 600
                    "forest-dark": 'hsl(var(--color-secondary-700-hsl))', // was "#14532D" -> now Emerald Green 700
                    "gold-accent": 'hsl(var(--color-accent-500-hsl))', // was "#F5B301" -> now Gold Accent 500
                    "success": 'hsl(var(--color-secondary-500-hsl))', // was "#22C55E" -> now Emerald Green 500
                    "error": 'hsl(var(--color-danger-500-hsl))',

                    // Other Material 3 semantic mappings
                    "surface": 'hsl(var(--color-neutral-50-hsl))',
                    "surface-dim": 'hsl(var(--color-neutral-200-hsl))',
                    "surface-bright": 'hsl(var(--color-neutral-50-hsl))',
                    "surface-container-lowest": 'hsl(var(--color-neutral-50-hsl))',
                    "surface-container-low": 'hsl(var(--color-neutral-100-hsl))',
                    "surface-container": 'hsl(var(--color-neutral-100-hsl))',
                    "surface-container-high": 'hsl(var(--color-neutral-200-hsl))',
                    "surface-container-highest": 'hsl(var(--color-neutral-300-hsl))',
                    "surface-variant": 'hsl(var(--color-neutral-100-hsl))',
                    "on-surface": 'hsl(var(--color-neutral-900-hsl))',
                    "on-surface-variant": 'hsl(var(--color-neutral-600-hsl))',
                    "inverse-surface": 'hsl(var(--color-neutral-800-hsl))',
                    "inverse-on-surface": 'hsl(var(--color-neutral-50-hsl))',
                    "outline": 'hsl(var(--color-neutral-400-hsl))',
                    "outline-variant": 'hsl(var(--color-neutral-200-hsl))',
                    "background": 'hsl(var(--color-neutral-50-hsl))',
                    "on-background": 'hsl(var(--color-neutral-900-hsl))',
                    
                    "primary-container": 'hsl(var(--color-primary-100-hsl))',
                    "on-primary-container": 'hsl(var(--color-primary-900-hsl))',
                    "on-primary": '#ffffff',
                    "inverse-primary": 'hsl(var(--color-primary-200-hsl))',
                    "primary-fixed": 'hsl(var(--color-primary-100-hsl))',
                    "primary-fixed-dim": 'hsl(var(--color-primary-200-hsl))',
                    "on-primary-fixed": 'hsl(var(--color-primary-950-hsl))',
                    "on-primary-fixed-variant": 'hsl(var(--color-primary-800-hsl))',
                    
                    "secondary": 'hsl(var(--color-secondary-600-hsl))',
                    "secondary-container": 'hsl(var(--color-accent-100-hsl))',
                    "on-secondary": '#ffffff',
                    "on-secondary-container": 'hsl(var(--color-accent-700-hsl))',
                    "secondary-fixed": 'hsl(var(--color-secondary-100-hsl))',
                    "secondary-fixed-dim": 'hsl(var(--color-secondary-500-hsl))',
                    "on-secondary-fixed": 'hsl(var(--color-secondary-700-hsl))',
                    "on-secondary-fixed-variant": 'hsl(var(--color-secondary-600-hsl))',

                    "tertiary": 'hsl(var(--color-secondary-700-hsl))',
                    "tertiary-container": 'hsl(var(--color-secondary-100-hsl))',
                    "on-tertiary": '#ffffff',
                    "on-tertiary-container": 'hsl(var(--color-secondary-700-hsl))',
                    "tertiary-fixed": 'hsl(var(--color-secondary-100-hsl))',
                    "tertiary-fixed-dim": 'hsl(var(--color-secondary-500-hsl))',
                    "on-tertiary-fixed": 'hsl(var(--color-secondary-700-hsl))',
                    "on-tertiary-fixed-variant": 'hsl(var(--color-secondary-600-hsl))',

                    "error-container": 'hsl(var(--color-danger-100-hsl))',
                    "on-error-container": 'hsl(var(--color-danger-700-hsl))',

                    "stone-200": 'hsl(var(--color-neutral-200-hsl))',
                    "stone-500": 'hsl(var(--color-neutral-500-hsl))',
                    "stone-900": 'hsl(var(--color-neutral-900-hsl))',
                },
                boxShadow: {
                    /* Custom realistic layered shadows */
                    'premium-sm': 'var(--shadow-premium-sm)',
                    'premium-md': 'var(--shadow-premium-md)',
                    'premium-lg': 'var(--shadow-premium-lg)',
                    'premium-xl': 'var(--shadow-premium-xl)',
                },
                borderRadius: {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px",
                    /* Brand radius scale */
                    'premium-xs': 'var(--radius-xs)',
                    'premium-sm': 'var(--radius-sm)',
                    'premium-md': 'var(--radius-md)',
                    'premium-lg': 'var(--radius-lg)',
                    'premium-xl': 'var(--radius-xl)',
                    'premium-2xl': 'var(--radius-2xl)',
                    'premium-3xl': 'var(--radius-3xl)',
                },
                spacing: {
                    "gutter": "16px",
                    "section-gap-desktop": "80px",
                    "container-margin": "24px",
                    "base": "4px",
                    "section-gap-mobile": "32px"
                },
                fontFamily: {
                    "label-md": ["Be Vietnam Pro"],
                    "body-sm": ["Be Vietnam Pro"],
                    "body-lg": ["Be Vietnam Pro"],
                    "headline-sm": ["Be Vietnam Pro"],
                    "headline-md": ["Be Vietnam Pro"],
                    "headline-lg-mobile": ["Be Vietnam Pro"],
                    "body-md": ["Be Vietnam Pro"],
                    "label-sm": ["Be Vietnam Pro"],
                    "headline-xl-mobile": ["Be Vietnam Pro"],
                    "headline-xl": ["Be Vietnam Pro"],
                    "headline-lg": ["Be Vietnam Pro"]
                },
                fontSize: {
                    "label-md": ["14px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                    "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                    "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                    "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                    "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                    "headline-lg-mobile": ["24px", { "lineHeight": "30px", "fontWeight": "700" }],
                    "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                    "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
                    "headline-xl-mobile": ["30px", { "lineHeight": "36px", "fontWeight": "700" }],
                    "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                    "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }]
                }
            }
        }
    };
    console.log("Locafy design system (Royal Blue & Emerald Green HSL) injected successfully.");
}

// Load env.js and supabase-client.js dynamically with correct prefix path
(function loadEnvAndSupabase() {
    let prefix = '/';
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('design-system.js')) {
            const index = src.indexOf('design-system.js');
            prefix = src.substring(0, index);
            break;
        }
    }
    
    // 1. Load env.js if window.env is not already defined
    if (typeof window.env === 'undefined') {
        const envScript = document.createElement('script');
        envScript.src = prefix + "env.js";
        document.head.appendChild(envScript);
    }
    
    // 2. Load supabase-client.js
    const supabaseScript = document.createElement('script');
    supabaseScript.src = prefix + "supabase-client.js";
    document.head.appendChild(supabaseScript);

    // 3. Check for maintenance mode
    try {
        const isMaintenancePage = window.location.pathname.endsWith('maintenance.html');
        let isAdmin = false;
        const user = JSON.parse(localStorage.getItem('locafyCurrentUser'));
        if (user && user.role === 'admin') {
            isAdmin = true;
        }
        
        if (!isAdmin && !isMaintenancePage) {
            const settings = JSON.parse(localStorage.getItem('locafySystemSettings') || '{}');
            if (settings.maintenance === true) {
                window.location.href = prefix + 'maintenance.html';
            }
        }
    } catch(e) {
        console.error("Maintenance interceptor error:", e);
    }
})();

// ==========================================
// 4. Central System Font & Mobile Sidebar Responsiveness Handler
// ==========================================

// A. Enforce system font "Be Vietnam Pro" on all elements for design uniformity
(function enforceSystemFont() {
    // Inject link tag for Be Vietnam Pro if not already present
    if (!document.querySelector('link[href*="Be+Vietnam+Pro"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap';
        document.head.appendChild(link);
    }
    
    // Inject global stylesheet overrides
    const style = document.createElement('style');
    style.innerHTML = `
        body, button, input, select, textarea, p, h1, h2, h3, h4, h5, h6,
        span:not(.material-symbols-outlined):not(.material-symbols-sharp):not(.material-symbols-rounded):not(.material-icons):not(.fa):not(.fas):not(.far):not(.fab):not([class*="fa-"]),
        a:not(.material-symbols-outlined):not(.material-symbols-sharp):not(.material-symbols-rounded):not(.material-icons):not(.fa):not(.fas):not(.far):not(.fab):not([class*="fa-"]),
        i:not(.material-symbols-outlined):not(.material-symbols-sharp):not(.material-symbols-rounded):not(.material-icons):not(.fa):not(.fas):not(.far):not(.fab):not([class*="fa-"]) {
            font-family: 'Be Vietnam Pro', sans-serif !important;
        }
    `;
    document.head.appendChild(style);
})();

// B. Initialize responsive mobile sidebar toggle logic
document.addEventListener('DOMContentLoaded', () => {
    const aside = document.querySelector('aside');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    
    if (aside && main) {
        // Enforce transition and relative layout positioning on mobile
        aside.classList.add('transition-transform', 'duration-300', '-translate-x-full', 'md:translate-x-0');
        aside.id = 'sidebar-menu';
        
        main.classList.remove('ml-64');
        main.classList.add('ml-0', 'md:ml-64');
        
        if (header) {
            header.classList.remove('left-64', 'z-50');
            header.classList.add('left-0', 'md:left-64', 'z-30');
            
            // Avoid duplicate toggle insertion
            if (!document.getElementById('mobile-sidebar-toggle')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.id = 'mobile-sidebar-toggle';
                toggleBtn.className = 'md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg mr-2 flex items-center justify-center shrink-0';
                toggleBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
                
                const firstChild = header.firstElementChild;
                if (firstChild) {
                    firstChild.style.display = 'flex';
                    firstChild.style.alignItems = 'center';
                    firstChild.insertBefore(toggleBtn, firstChild.firstChild);
                } else {
                    header.insertBefore(toggleBtn, header.firstChild);
                }
                
                const backdrop = document.createElement('div');
                backdrop.id = 'sidebar-backdrop';
                backdrop.className = 'fixed inset-0 bg-black/40 z-40 hidden transition-opacity duration-300 opacity-0 md:hidden';
                document.body.appendChild(backdrop);
                
                const toggleMenu = () => {
                    const isOpen = !aside.classList.contains('-translate-x-full');
                    if (isOpen) {
                        aside.classList.add('-translate-x-full');
                        backdrop.classList.add('opacity-0');
                        setTimeout(() => backdrop.classList.add('hidden'), 300);
                    } else {
                        aside.classList.remove('-translate-x-full');
                        backdrop.classList.remove('hidden');
                        setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
                    }
                };
                
                toggleBtn.addEventListener('click', toggleMenu);
                backdrop.addEventListener('click', toggleMenu);
            }
        } else {
            // Floating hamburger button for pages without standard header
            if (!document.getElementById('mobile-sidebar-toggle')) {
                const floatToggleBtn = document.createElement('button');
                floatToggleBtn.id = 'mobile-sidebar-toggle';
                floatToggleBtn.className = 'md:hidden fixed top-4 left-4 z-40 bg-white/95 border border-stone-200 shadow-md p-2.5 rounded-full flex items-center justify-center text-stone-700 active:scale-95 transition-all';
                floatToggleBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">menu</span>';
                document.body.appendChild(floatToggleBtn);
                
                const backdrop = document.createElement('div');
                backdrop.id = 'sidebar-backdrop';
                backdrop.className = 'fixed inset-0 bg-black/40 z-40 hidden transition-opacity duration-300 opacity-0 md:hidden';
                document.body.appendChild(backdrop);
                
                const toggleMenu = () => {
                    const isOpen = !aside.classList.contains('-translate-x-full');
                    if (isOpen) {
                        aside.classList.add('-translate-x-full');
                        backdrop.classList.add('opacity-0');
                        setTimeout(() => backdrop.classList.add('hidden'), 300);
                    } else {
                        aside.classList.remove('-translate-x-full');
                        backdrop.classList.remove('hidden');
                        setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
                    }
                };
                
                floatToggleBtn.addEventListener('click', toggleMenu);
                backdrop.addEventListener('click', toggleMenu);
            }
        }
    }
});
