import { program, speakers } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    populateProgram();
    populateSpeakers();
    setupScrollAnimations();
    setupHeaderBehavior();
    setupNavHighlighter();
    setupMobileMenu();
    initializePopup();
    setupPrizePopup();
});

function setupHeaderBehavior() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function setupMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = mobileMenu.querySelectorAll('a');

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

function populateProgram() {
    const timelineContainer = document.getElementById('program-timeline');
    if (!timelineContainer) return;

    const speakerSlugMap = new Map();
    if (typeof speakers !== 'undefined' && Array.isArray(speakers)) {
        speakers.forEach(s => speakerSlugMap.set(s.name, s.slug));
    }

    let delay = 0;
    program.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item scroll-animate';
        itemDiv.style.transitionDelay = `${delay}ms`;

        const speakerSlug = speakerSlugMap.get(item.speaker);
        const isLecture = !!speakerSlug;

        const isBreak = item.speaker === '';
        const topicClass = isBreak ? 'text-blue-400 font-semibold' : 'font-bold text-white';
        const speakerHtml = item.speaker ? `<p class=\"text-md text-gray-400 mt-1\">${item.speaker}</p>` : '';
        const descriptionHtml = item.description ? `<p class=\"text-sm text-gray-500 mt-2\">${item.description}</p>` : '';

        const contentHtml = `
            <h3 class=\"text-xl ${topicClass}\">${item.topic}</h3>
            ${speakerHtml}
            ${descriptionHtml}
        `;

        if (isLecture) {
            itemDiv.innerHTML = `
                <div class=\"timeline-dot\"></div>
                <div class=\"timeline-time\">${item.time}</div>
                <a href=\"speaker_${speakerSlug}.html\" class=\"block bg-gray-900 p-6 rounded-lg shadow-lg hover:bg-blue-900/30 hover:shadow-blue-500/10 transition-all duration-300\">\n                    ${contentHtml}\n                </a>
            `;
        } else {
            itemDiv.innerHTML = `
                <div class=\"timeline-dot\"></div>
                <div class=\"timeline-time\">${item.time}</div>
                <div class=\"bg-gray-900 p-6 rounded-lg shadow-lg\">\n                    ${contentHtml}\n                </div>
            `;
        }
        
        timelineContainer.appendChild(itemDiv);
        delay += 100;
    });
}


function populateSpeakers() {
    const gridContainer = document.getElementById('speakers-grid');
    if (!gridContainer) return;

    let delay = 0;
    speakers.forEach(speaker => {
        const speakerLink = document.createElement('a');
        speakerLink.href = `speaker_${speaker.slug}.html`;
        speakerLink.className = 'scroll-animate text-center p-4 block hover:bg-gray-800/50 rounded-lg transition-colors duration-300';
        speakerLink.style.transitionDelay = `${delay}ms`;

        speakerLink.innerHTML = `
            <img src=\"${speaker.image}\" alt=\"${speaker.name}\" class=\"rounded-full w-32 h-32 mx-auto object-cover border-4 border-gray-700 hover:border-blue-500 transition-all duration-300\">\n            <h3 class=\"font-bold text-lg text-white mt-4\">${speaker.name}</h3>\n            <p class=\"text-sm text-blue-400\">${speaker.affiliation}</p>\n        `;
        gridContainer.appendChild(speakerLink);
        delay += 100;
    });
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function setupNavHighlighter() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: "-50% 0px -50% 0px" });

    sections.forEach(section => {
        observer.observe(section);
    });
}

function initializePopup() {
    const popupModal = document.getElementById('popup-modal');
    const popupContent = document.getElementById('popup-content');
    if (!popupModal || !popupContent) return;

    const closeButton = document.getElementById('popup-close-button');
    const actionCloseButton = document.getElementById('popup-action-close-button');
    const dontShowTodayCheckbox = document.getElementById('dont-show-today');
    const eventTriggers = document.querySelectorAll('.event-trigger');

    const showThePopup = () => {
        popupModal.classList.remove('hidden');
        lucide.createIcons();

        setTimeout(() => {
            popupContent.classList.add('popup-animate');
            popupContent.classList.remove('opacity-0');
        }, 50);
    };

    const closeThePopup = () => {
        if (dontShowTodayCheckbox.checked) {
            const now = new Date();
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            localStorage.setItem('dass2025_popup_hide_until', endOfDay.getTime().toString());
        }
        popupModal.classList.add('hidden');
        popupContent.classList.remove('popup-animate');
        popupContent.classList.add('opacity-0');
    };

    closeButton.addEventListener('click', closeThePopup);
    actionCloseButton.addEventListener('click', closeThePopup);

    popupModal.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            closeThePopup();
        }
    });

    eventTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            dontShowTodayCheckbox.checked = false;
            showThePopup();
        });
    });

    const hideUntil = localStorage.getItem('dass2025_popup_hide_until');
    if (!hideUntil || new Date().getTime() > Number(hideUntil)) {
        showThePopup();
    }
}

function setupPrizePopup() {
    const prizeTriggers = document.querySelectorAll('.prize-trigger');
    const imagePopupModal = document.getElementById('image-popup-modal');
    const popupImage = document.getElementById('popup-image');
    const closeButton = document.getElementById('image-popup-close-button');

    if (!imagePopupModal || !popupImage || !closeButton || prizeTriggers.length === 0) return;

    prizeTriggers.forEach(trigger => {
        const imgSrc = trigger.dataset.prizeImg;
        if (imgSrc) {
            trigger.addEventListener('click', () => {
                popupImage.src = imgSrc;
                imagePopupModal.classList.remove('hidden');
                lucide.createIcons();
            });
        }
    });

    const closeThePopup = () => {
        imagePopupModal.classList.add('hidden');
        popupImage.src = '';
    };

    closeButton.addEventListener('click', closeThePopup);
    imagePopupModal.addEventListener('click', (e) => {
        if (e.target === imagePopupModal) {
            closeThePopup();
        }
    });
}
