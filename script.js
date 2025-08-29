document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const tabMapping = {
        'startscherm': 'startscherm',
        'store': 'store',
        'bouwen-deel1': 'bouwen-deel1',
        'bouwen-deel2': 'bouwen-deel2',
        'maken': 'maken'
    };
    
    let debugMode = false;
    let coordinateDisplay = null;
    let gridOverlay = null;
    let clickPositions = [];
    
    const hotspots = {
        'startscherm': [
            {
                x: 7.6,
                y: 65.8,
                tooltip: 'Klik hierop om bij de pagina te komen waar je GPT\'s kunt selecteren of maken',
                action: 'store',
                icon: '●'
            }
        ],
        'store': [
            {
                x: 95.8,
                y: 10.7,
                tooltip: 'Als je hierop klikt, kom je op de pagina waar je je eigen GPT kunt bouwen',
                action: 'bouwen-deel1',
                icon: '●'
            }
        ],
        'bouwen-deel1': [
            {
                x: 26.1,
                y: 21.9,
                tooltip: 'Gebruik dit als je in dialoog je instructies voor je GPT wilt maken. Niet aan te raden.',
                action: null,
                icon: 'i'
            },
            {
                x: 35.3,
                y: 22.3,
                tooltip: 'Gebruik dit als je je instructies rechtstreeks wilt intypen. Dit heeft de voorkeur.',
                action: null,
                icon: 'i'
            },
            {
                x: 30.7,
                y: 35.6,
                tooltip: 'Je kunt hier eventueel een plaatje voor je GPT inzetten.',
                action: null,
                icon: 'i'
            },
            {
                x: 29.0,
                y: 49.0,
                tooltip: 'Hiermee geef je je GPT een naam. Handig om de GPT te kunnen terugvinden later, voor jezelf en/of voor anderen.',
                action: null,
                icon: 'i'
            },
            {
                x: 39.1,
                y: 64.2,
                tooltip: 'Hiermee kun je aangeven voor de gebruiker waar de GPT voor dient. Het is de tekst die onder de naam verschijnt. Het heeft inhoudelijk geen consequenties voor je GPT.',
                action: null,
                icon: 'i'
            },
            {
                x: 28.4,
                y: 90.3,
                tooltip: 'Dit is het belangrijkste aspect van het bouwen van een GPT. Hier ga je de GPT instructies geven over hoe het zich dient te gedragen. Dit kan op vele manieren. Een handig format is om deze structuur hier aan te houden:\n1) Beschrijf de rol die de GPT heeft\n2) Beschrijf het doel en de context van de GPT\n3) Geef expliciete instructie wat de GPT moet doen in het gesprek met de gebruiker\n4) Als je GPT een bepaalde output moet leveren in een bepaald format, beschrijf dat hier of geef concrete voorbeelden van de gewenste output.',
                action: null,
                icon: 'i'
            },
            {
                x: 85.0,
                y: 9.1,
                tooltip: 'Als je hierop klikt, heb je de GPT voldoende getest en ga je hem daadwerkelijk maken. Je kunt de GPT voor jezelf houden, delen via een linkje, of openbaar delen in de store.',
                action: 'maken',
                icon: '●'
            }
        ],
        'bouwen-deel2': [
            {
                x: 29.4,
                y: 10.5,
                tooltip: 'Je kunt hier een eerste prompt voor de gebruiker formuleren. Deze verschijnt in een tekstvakje waar de gebruiker op kan klikken. Handig als je de start van het gesprek met de GPT wilt regisseren.',
                action: null,
                icon: 'i'
            },
            {
                x: 26.5,
                y: 32.2,
                tooltip: 'Naast het instructieveld kun je hier nog meer context toevoegen. Let op, de GPT gaat dit niet altijd helemaal meenemen in het gesprek. Zorg ervoor dat je in je instructies expliciet verwijst naar de bestanden die je toevoegt met instructie wanneer de GPT dit moet lezen en verwerken.',
                action: null,
                icon: 'i'
            },
            {
                x: 13.9,
                y: 70.8,
                tooltip: 'De tools die de GPT mag gebruiken. Als de vinkjes aanstaan, kan de GPT zoeken op internet, plaatjes maken, werken in een edit-scherm (een zogenaamd canvas) en code in een sandbox aanmaken om bijvoorbeeld een analyse op data te maken.',
                action: null,
                icon: 'i'
            },
            {
                x: 28.8,
                y: 92.9,
                tooltip: 'Hiermee kun je externe applicaties koppelen aan je GPT. Dit is vrij technisch en niet nodig in bijna alle use cases.',
                action: null,
                icon: 'i'
            }
        ],
        'maken': [
            {
                x: 52.4,
                y: 40.6,
                tooltip: 'Je kunt hier bepalen of je je GPT voor jezelf houd of beperkt deelt met anderen via een linkje of met iedereen in de store. Als je een ChatGPT teams account hebt, kun je hier ook nog aangeven of je het binnen je teams-omgeving wilt delen.',
                action: null,
                icon: 'i'
            }
        ]
    };
    
    function switchTab(tabName) {
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabMapping[tabName]) {
                content.classList.add('active');
            }
        });
        
        if (debugMode) {
            updateDebugDisplay();
        }
        
        renderHotspots();
    }
    
    function createHotspot(hotspot) {
        const hotspotElement = document.createElement('div');
        hotspotElement.className = 'hotspot';
        hotspotElement.style.left = `${hotspot.x}%`;
        hotspotElement.style.top = `${hotspot.y}%`;
        hotspotElement.style.position = 'absolute';
        hotspotElement.style.zIndex = '100';
        
        hotspotElement.innerHTML = `
            <div class="hotspot-inner">
                <div class="hotspot-pulse"></div>
                <div class="hotspot-circle">
                    <span class="hotspot-icon">${hotspot.icon}</span>
                </div>
            </div>
        `;
        
        
        hotspotElement.addEventListener('click', function(e) {
            e.stopPropagation();
            if (hotspot.action) {
                switchTab(hotspot.action);
            }
        });
        
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
    
    function createSvgHotspot(hotspot) {
        const svgNS = 'http://www.w3.org/2000/svg';
        
        // Create SVG group for the hotspot
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('class', 'svg-hotspot');
        group.setAttribute('transform', `translate(${hotspot.x}, ${hotspot.y})`);
        group.style.cursor = 'pointer';
        
        // Create pulse circle
        const pulse = document.createElementNS(svgNS, 'circle');
        pulse.setAttribute('r', '15');
        pulse.setAttribute('fill', 'rgba(102, 126, 234, 0.4)');
        pulse.setAttribute('class', 'svg-pulse');
        
        // Create main circle
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('r', '15');
        circle.setAttribute('fill', 'url(#hotspotGradient)');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('class', 'svg-hotspot-circle');
        
        // Create icon text
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', '0');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = hotspot.icon;
        
        // Add gradient definition to SVG if not exists
        const svg = document.querySelector('.screenshot-svg');
        if (!svg.querySelector('#hotspotGradient')) {
            const defs = document.createElementNS(svgNS, 'defs');
            const gradient = document.createElementNS(svgNS, 'linearGradient');
            gradient.setAttribute('id', 'hotspotGradient');
            gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS(svgNS, 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#667eea');
            
            const stop2 = document.createElementNS(svgNS, 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#764ba2');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.insertBefore(defs, svg.firstChild);
        }
        
        group.appendChild(pulse);
        group.appendChild(circle);
        group.appendChild(text);
        
        // Add event listeners
        group.addEventListener('click', function(e) {
            e.stopPropagation();
            if (hotspot.action) {
                switchTab(hotspot.action);
            }
        });
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'hotspot-tooltip';
        tooltip.textContent = hotspot.tooltip;
        document.body.appendChild(tooltip);
        
        group.addEventListener('mouseenter', function(e) {
            showSvgTooltip(tooltip, group, svg);
        });
        
        group.addEventListener('mouseleave', function() {
            hideTooltip(tooltip);
        });
        
        return group;
    }
    
    function showSvgTooltip(tooltip, hotspotElement, svg) {
        const svgRect = svg.getBoundingClientRect();
        const transform = hotspotElement.getAttribute('transform');
        const coords = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        
        if (!coords) return;
        
        const svgX = parseFloat(coords[1]);
        const svgY = parseFloat(coords[2]);
        
        // Convert SVG coordinates to screen coordinates
        const scaleX = svgRect.width / 1440;
        const scaleY = svgRect.height / 2400;
        
        const screenX = svgRect.left + (svgX * scaleX);
        const screenY = svgRect.top + (svgY * scaleY);
        
        const appFrame = document.querySelector('.app-frame');
        const frameRect = appFrame.getBoundingClientRect();
        
        tooltip.className = 'hotspot-tooltip';
        
        const tooltipWidth = 350;
        const tooltipHeight = 120;
        const margin = 15;
        
        let left = screenX - (tooltipWidth / 2);
        let top = screenY - tooltipHeight - margin;
        let position = 'top';
        
        if (top < frameRect.top + 60) {
            top = screenY + margin;
            position = 'bottom';
        }
        
        if (left < frameRect.left + margin) {
            left = screenX + margin;
            top = screenY - (tooltipHeight / 2);
            position = 'right';
        } else if (left + tooltipWidth > frameRect.right - margin) {
            left = screenX - tooltipWidth - margin;
            top = screenY - (tooltipHeight / 2);
            position = 'left';
        }
        
        if (top + tooltipHeight > frameRect.bottom - margin) {
            top = screenY - tooltipHeight - margin;
            position = 'top';
        }
        
        left = Math.max(frameRect.left + margin, Math.min(left, frameRect.right - tooltipWidth - margin));
        top = Math.max(frameRect.top + 60, Math.min(top, frameRect.bottom - tooltipHeight - margin));
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add(`tooltip-${position}`);
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }
    
    function showTooltip(tooltip, hotspotElement) {
        const appFrame = document.querySelector('.app-frame');
        const frameRect = appFrame.getBoundingClientRect();
        const hotspotRect = hotspotElement.getBoundingClientRect();
        
        tooltip.className = 'hotspot-tooltip';
        
        const tooltipWidth = 350;
        const tooltipHeight = 120;
        const margin = 15;
        
        let left = hotspotRect.left + (hotspotRect.width / 2) - (tooltipWidth / 2);
        let top = hotspotRect.top - tooltipHeight - margin;
        let position = 'top';
        
        if (top < frameRect.top + 60) {
            top = hotspotRect.bottom + margin;
            position = 'bottom';
        }
        
        if (left < frameRect.left + margin) {
            left = hotspotRect.right + margin;
            top = hotspotRect.top + (hotspotRect.height / 2) - (tooltipHeight / 2);
            position = 'right';
        } else if (left + tooltipWidth > frameRect.right - margin) {
            left = hotspotRect.left - tooltipWidth - margin;
            top = hotspotRect.top + (hotspotRect.height / 2) - (tooltipHeight / 2);
            position = 'left';
        }
        
        if (top + tooltipHeight > frameRect.bottom - margin) {
            top = hotspotRect.top - tooltipHeight - margin;
            position = 'top';
        }
        
        left = Math.max(frameRect.left + margin, Math.min(left, frameRect.right - tooltipWidth - margin));
        top = Math.max(frameRect.top + 60, Math.min(top, frameRect.bottom - tooltipHeight - margin));
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add(`tooltip-${position}`);
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }
    
    function hideTooltip(tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }
    
    function renderHotspots() {
        const existingHotspots = document.querySelectorAll('.hotspot');
        existingHotspots.forEach(h => h.remove());
        
        const existingTooltips = document.querySelectorAll('.hotspot-tooltip');
        existingTooltips.forEach(t => t.remove());
        
        const activeTab = document.querySelector('.tab-button.active');
        if (!activeTab) return;
        
        const tabName = activeTab.dataset.tab;
        const tabHotspots = hotspots[tabName] || [];
        
        const activeContent = document.querySelector('.tab-content.active');
        const screenshot = activeContent?.querySelector('.screenshot');
        
        if (!activeContent || !screenshot) return;
        
        screenshot.style.position = 'relative';
        screenshot.parentElement.style.position = 'relative';
        
        tabHotspots.forEach(hotspot => {
            const hotspotElement = createHotspot(hotspot);
            screenshot.parentElement.appendChild(hotspotElement);
        });
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    window.switchToTab = function(tabName) {
        if (tabMapping[tabName]) {
            switchTab(tabName);
        }
    };
    
    function initDebugMode() {
        coordinateDisplay = document.createElement('div');
        coordinateDisplay.id = 'coordinate-display';
        coordinateDisplay.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 8px; z-index: 10002; font-family: monospace; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: bold; margin-bottom: 10px;">🔧 Debug Mode</div>
                <div>Position: <span id="coord-text" style="color: #00ff00;">X: 0%, Y: 0%</span></div>
                <div>Current Tab: <span id="current-tab" style="color: #ffa500;"></span></div>
                <div style="margin: 15px 0;">
                    <button onclick="toggleGrid()" style="margin-right: 5px; padding: 5px 10px; background: #4a5568; color: white; border: none; border-radius: 4px; cursor: pointer;">Toggle Grid</button>
                    <button onclick="clearPositions()" style="padding: 5px 10px; background: #e53e3e; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear All</button>
                </div>
                <div style="font-size: 11px; color: #ccc; margin-bottom: 10px;">💡 Klik op screenshots voor posities</div>
                <div id="click-log" style="max-height: 150px; overflow-y: auto; font-size: 11px; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px;"></div>
            </div>
        `;
        document.body.appendChild(coordinateDisplay);
        
        const activeTabContents = document.querySelectorAll('.tab-content');
        activeTabContents.forEach(content => {
            content.addEventListener('mousemove', handleMouseMove);
            content.addEventListener('click', handleClick);
        });
    }
    
    function createGridOverlay() {
        const activeContent = document.querySelector('.tab-content.active');
        if (!activeContent) return;
        
        const existingGrid = activeContent.querySelector('.grid-overlay');
        if (existingGrid) {
            existingGrid.remove();
            return;
        }
        
        gridOverlay = document.createElement('div');
        gridOverlay.className = 'grid-overlay';
        gridOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        const canvas = document.createElement('canvas');
        const rect = activeContent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.lineWidth = 1;
        
        const gridSize = 5;
        for (let i = 0; i <= 100; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo((i * canvas.width) / 100, 0);
            ctx.lineTo((i * canvas.width) / 100, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, (i * canvas.height) / 100);
            ctx.lineTo(canvas.width, (i * canvas.height) / 100);
            ctx.stroke();
        }
        
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
        for (let x = 0; x <= 100; x += 10) {
            for (let y = 0; y <= 100; y += 10) {
                ctx.fillText(`${x},${y}`, (x * canvas.width) / 100 + 2, (y * canvas.height) / 100 + 12);
            }
        }
        
        gridOverlay.appendChild(canvas);
        activeContent.appendChild(gridOverlay);
    }
    
    function getScreenshotCoordinates(e, activeContent) {
        const screenshot = activeContent.querySelector('.screenshot');
        if (!screenshot) return null;
        
        // Get screenshot's bounding rectangle
        const screenshotRect = screenshot.getBoundingClientRect();
        
        // Calculate click position relative to screenshot (accounting for current scroll)
        const relativeX = e.clientX - screenshotRect.left;
        const relativeY = e.clientY - screenshotRect.top;
        
        // Convert to percentages of the actual screenshot dimensions
        const x = (relativeX / screenshotRect.width * 100).toFixed(1);
        const y = (relativeY / screenshotRect.height * 100).toFixed(1);
        
        return { x: parseFloat(x), y: parseFloat(y) };
    }
    
    function handleMouseMove(e) {
        if (!debugMode) return;
        
        const activeContent = e.currentTarget;
        const coords = getScreenshotCoordinates(e, activeContent);
        
        if (!coords) return;
        
        const coordText = document.getElementById('coord-text');
        if (coordText) {
            coordText.textContent = `X: ${coords.x}%, Y: ${coords.y}%`;
        }
    }
    
    function handleClick(e) {
        if (!debugMode) return;
        
        const activeContent = e.currentTarget;
        const coords = getScreenshotCoordinates(e, activeContent);
        
        if (!coords) return;
        
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        const position = {
            tab: activeTab,
            x: coords.x,
            y: coords.y,
            timestamp: new Date().toLocaleTimeString()
        };
        
        clickPositions.push(position);
        
        const screenshot = activeContent.querySelector('.screenshot');
        if (screenshot) {
            // Create HTML debug marker
            const marker = document.createElement('div');
            marker.className = 'debug-marker';
            marker.style.cssText = `
                position: absolute;
                left: ${coords.x}%;
                top: ${coords.y}%;
                width: 20px;
                height: 20px;
                background: rgba(255, 0, 0, 0.8);
                border: 2px solid red;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                z-index: 9998;
                cursor: pointer;
            `;
            marker.title = `${coords.x}%, ${coords.y}%`;
            
            screenshot.style.position = 'relative';
            screenshot.appendChild(marker);
        }
        
        const clickLog = document.getElementById('click-log');
        if (clickLog) {
            const logEntry = document.createElement('div');
            logEntry.style.color = '#00ff00';
            logEntry.textContent = `[${position.timestamp}] ${activeTab} | X: ${coords.x}% Y: ${coords.y}%`;
            clickLog.insertBefore(logEntry, clickLog.firstChild);
        }
        
        console.log('Click position:', position);
        console.log('All positions:', clickPositions);
    }
    
    function updateDebugDisplay() {
        const currentTabSpan = document.getElementById('current-tab');
        if (currentTabSpan) {
            const activeTab = document.querySelector('.tab-button.active');
            currentTabSpan.textContent = activeTab ? activeTab.textContent : '';
        }
    }
    
    window.toggleGrid = function() {
        createGridOverlay();
    };
    
    window.clearPositions = function() {
        clickPositions = [];
        const markers = document.querySelectorAll('.debug-marker');
        markers.forEach(marker => marker.remove());
        const clickLog = document.getElementById('click-log');
        if (clickLog) clickLog.innerHTML = '';
        console.log('Positions cleared');
    };
    
    window.addHotspotFromDebug = function(x, y, tooltip, action = null, icon = 'i') {
        const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
        if (!activeTab) {
            console.error('No active tab found');
            return;
        }
        
        const newHotspot = {
            x: x,
            y: y,
            tooltip: tooltip,
            action: action,
            icon: icon
        };
        
        hotspots[activeTab].push(newHotspot);
        renderHotspots();
        
        console.log(`Added hotspot to ${activeTab}:`, newHotspot);
        return newHotspot;
    };
    
    window.toggleDebugMode = function() {
        debugMode = !debugMode;
        if (debugMode) {
            initDebugMode();
            console.log('Debug mode ON - Click on screenshots to get coordinates');
        } else {
            if (coordinateDisplay) {
                coordinateDisplay.remove();
                coordinateDisplay = null;
            }
            const grid = document.querySelector('.grid-overlay');
            if (grid) grid.remove();
            console.log('Debug mode OFF');
        }
        return debugMode;
    };
    
    console.log('Click-kaart GPT app loaded. Type toggleDebugMode() in console to start positioning mode.');
    
    setTimeout(() => {
        renderHotspots();
    }, 100);
});