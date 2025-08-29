document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const screenshots = document.querySelectorAll('.screenshot-fullscreen');
    
    // Simple hotspot coordinates - viewport pixels at 1440x900 reference
    const hotspots = {
        'startscherm': [
            {
                x: 123,   // viewport pixels
                y: 340,
                tooltip: 'Klik hierop om bij de pagina te komen waar je GPT\'s kunt selecteren of maken',
                action: 'store',
                icon: '●'
            }
        ],
        'store': [
            {
                x: 1420,
                y: 73,
                tooltip: 'Als je hierop klikt, kom je op de pagina waar je je eigen GPT kunt bouwen',
                action: 'bouwen-deel1',
                icon: '●'
            }
        ],
        'bouwen-deel1': [
            {
                x: 160,
                y: 197,
                tooltip: 'Gebruik dit als je in dialoog je instructies voor je GPT wilt maken. Niet aan te raden.',
                action: null,
                icon: 'i'
            },
            {
                x: 355,
                y: 197,
                tooltip: 'Gebruik dit als je je instructies rechtstreeks wilt intypen. Dit heeft de voorkeur.',
                action: null,
                icon: 'i'
            },
            {
                x: 249,
                y: 320,
                tooltip: 'Je kunt hier eventueel een plaatje voor je GPT inzetten.',
                action: null,
                icon: 'i'
            },
            {
                x: 117,
                y: 441,
                tooltip: 'Hiermee geef je je GPT een naam. Handig om de GPT te kunnen terugvinden later, voor jezelf en/of voor anderen.',
                action: null,
                icon: 'i'
            },
            {
                x: 423,
                y: 578,
                tooltip: 'Hiermee kun je aangeven voor de gebruiker waar de GPT voor dient. Het is de tekst die onder de naam verschijnt. Het heeft inhoudelijk geen consequenties voor je GPT.',
                action: null,
                icon: 'i'
            },
            {
                x: 209,
                y: 813,
                tooltip: 'Dit is het belangrijkste aspect van het bouwen van een GPT. Hier ga je de GPT instructies geven over hoe het zich dient te gedragen. Dit kan op vele manieren. Een handig format is om deze structuur hier aan te houden:\\n1) Beschrijf de rol die de GPT heeft\\n2) Beschrijf het doel en de context van de GPT\\n3) Geef expliciete instructie wat de GPT moet doen in het gesprek met de gebruiker\\n4) Als je GPT een bepaalde output moet leveren in een bepaald format, beschrijf dat hier of geef concrete voorbeelden van de gewenste output.',
                action: null,
                icon: 'i'
            },
            {
                x: 1585,
                y: 82,
                tooltip: 'Als je hierop klikt, heb je de GPT voldoende getest en ga je hem daadwerkelijk maken. Je kunt de GPT voor jezelf houden, delen via een linkje, of openbaar delen in de store.',
                action: 'maken',
                icon: '●'
            }
        ],
        'bouwen-deel2': [
            {
                x: 123,
                y: 95,
                tooltip: 'Je kunt hier een eerste prompt voor de gebruiker formuleren. Deze verschijnt in een tekstvakje waar de gebruiker op kan klikken. Handig als je de start van het gesprek met de GPT wilt regisseren.',
                action: null,
                icon: 'i'
            },
            {
                x: 150,
                y: 291,
                tooltip: 'Naast het instructieveld kun je hier nog meer context toevoegen. Let op, de GPT gaat dit niet altijd helemaal meenemen in het gesprek. Zorg ervoor dat je in je instructies expliciet verwijst naar de bestanden die je toevoegt met instructie wanneer de GPT dit moet lezen en verwerken.',
                action: null,
                icon: 'i'
            },
            {
                x: 732,
                y: 455,
                tooltip: 'Nieuw in GPT5. Je kunt hier aangeven welk model de gebruiker standaard gaat gebruiken voor je GPT. Advies GPT-5 selecteren hier.',
                action: null,
                icon: 'i'
            },
            {
                x: -140,
                y: 637,
                tooltip: 'De tools die de GPT mag gebruiken. Als de vinkjes aanstaan, kan de GPT zoeken op internet, plaatjes maken, werken in een edit-scherm (een zogenaamd canvas) en code in een sandbox aanmaken om bijvoorbeeld een analyse op data te maken.',
                action: null,
                icon: 'i'
            },
            {
                x: 200,
                y: 836,
                tooltip: 'Hiermee kun je externe applicaties koppelen aan je GPT. Dit is vrij technisch en niet nodig in bijna alle use cases.',
                action: null,
                icon: 'i'
            }
        ],
        'maken': [
            {
                x: 746,
                y: 367,
                tooltip: 'Je kunt hier bepalen of je je GPT voor jezelf houd of beperkt deelt met anderen via een linkje of met iedereen in de store. Als je een ChatGPT teams account hebt, kun je hier ook nog aangeven of je het binnen je teams-omgeving wilt delen.',
                action: null,
                icon: 'i'
            }
        ]
    };

    function switchTab(tabName) {
        // Update buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });
        
        // Update screenshots
        screenshots.forEach(screenshot => {
            screenshot.classList.remove('active');
            if (screenshot.id === tabName) {
                screenshot.classList.add('active');
            }
        });
        
        renderHotspots();
    }

    function createHotspot(hotspot) {
        const hotspotElement = document.createElement('div');
        hotspotElement.className = 'hotspot';
        
        // Scale coordinates based on viewport size
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scaleX = vw / 1440; // reference width
        const scaleY = vh / 900;  // reference height
        const scale = Math.min(scaleX, scaleY); // maintain aspect ratio
        
        const x = hotspot.x * scale;
        const y = hotspot.y * scale;
        
        // Center the image in viewport if there's extra space
        const imageAspect = 1440 / 900;
        const viewportAspect = vw / vh;
        
        let offsetX = 0;
        let offsetY = 0;
        
        if (viewportAspect > imageAspect) {
            // Viewport is wider - center horizontally
            const scaledWidth = vh * imageAspect;
            offsetX = (vw - scaledWidth) / 2;
        } else {
            // Viewport is taller - center vertically  
            const scaledHeight = vw / imageAspect;
            offsetY = (vh - scaledHeight) / 2;
        }
        
        hotspotElement.style.left = (x + offsetX) + 'px';
        hotspotElement.style.top = (y + offsetY) + 'px';
        
        hotspotElement.innerHTML = `
            <div class=\"hotspot-inner\">
                <div class=\"hotspot-circle\">
                    <span class=\"hotspot-icon\">${hotspot.icon}</span>
                </div>
            </div>
        `;
        
        // Click handler
        if (hotspot.action) {
            hotspotElement.addEventListener('click', function(e) {
                e.stopPropagation();
                switchTab(hotspot.action);
            });
        }
        
        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'hotspot-tooltip';
        tooltip.textContent = hotspot.tooltip;
        document.body.appendChild(tooltip);
        
        hotspotElement.addEventListener('mouseenter', function(e) {
            showTooltip(tooltip, hotspotElement);
        });
        
        hotspotElement.addEventListener('mouseleave', function() {
            hideTooltip(tooltip);
        });
        
        return hotspotElement;
    }

    function showTooltip(tooltip, hotspotElement) {
        const rect = hotspotElement.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        tooltip.className = 'hotspot-tooltip';
        
        const tooltipWidth = 350;
        const tooltipHeight = 120;
        const margin = 15;
        
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        let top = rect.top - tooltipHeight - margin;
        let position = 'top';
        
        // Boundary checks
        if (top < margin) {
            top = rect.bottom + margin;
            position = 'bottom';
        }
        
        if (left < margin) {
            left = rect.right + margin;
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            position = 'right';
        } else if (left + tooltipWidth > vw - margin) {
            left = rect.left - tooltipWidth - margin;
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            position = 'left';
        }
        
        if (top + tooltipHeight > vh - margin) {
            top = rect.top - tooltipHeight - margin;
            position = 'top';
        }
        
        // Final boundary constraints
        left = Math.max(margin, Math.min(left, vw - tooltipWidth - margin));
        top = Math.max(margin, Math.min(top, vh - tooltipHeight - margin));
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add(`tooltip-${position}`);
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }

    function hideTooltip(tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        tooltip.className = 'hotspot-tooltip';
    }

    function renderHotspots() {
        // Clear existing hotspots and tooltips
        document.querySelectorAll('.hotspot').forEach(h => h.remove());
        document.querySelectorAll('.hotspot-tooltip').forEach(t => t.remove());
        
        const activeTab = document.querySelector('.tab-button.active');
        if (!activeTab) return;
        
        const tabName = activeTab.dataset.tab;
        const tabHotspots = hotspots[tabName] || [];
        
        tabHotspots.forEach(hotspot => {
            const hotspotElement = createHotspot(hotspot);
            document.body.appendChild(hotspotElement);
        });
    }

    // Event listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(renderHotspots, 100);
    });

    // Global function for external access
    window.switchToTab = function(tabName) {
        switchTab(tabName);
    };

    // Initialize
    setTimeout(() => {
        renderHotspots();
    }, 100);

    console.log('GPT Click-kaart app loaded (Radical Plan B)');
});