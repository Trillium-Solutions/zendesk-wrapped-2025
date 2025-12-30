// Story Mode Module - Handles the fullscreen "Wrapped" experience
const StoryMode = {
    data: null,
    currentCardIndex: 0,
    cards: [],
    isActive: false,

    // Start the story
    start(data) {
        this.data = data;
        this.isActive = true;
        this.currentCardIndex = 0;
        this.prepareCards();
        this.renderOverlay();
        this.showCard(0);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    },

    // Close the story
    close() {
        const overlay = document.getElementById('storyOverlay');
        if (overlay) {
            overlay.classList.add('closing');
            setTimeout(() => {
                overlay.remove();
                this.isActive = false;
                document.body.style.overflow = '';
            }, 500);
        }
    },

    // Prepare data for each card
    prepareCards() {
        const { tickets, efficiency, assignee } = this.data;

        // Welcome Card
        this.cards = [
            {
                title: "2025: A Year in Support",
                content: "It's been an incredible year. Let's look at the numbers that defined our 2025.",
                highlight: "2025",
                type: "welcome"
            }
        ];

        // Total Tickets Card
        const totalCreated = parseFloat(tickets.created[0]?.Tickets) || 0;
        this.cards.push({
            title: "The Big Picture",
            content: "We handled a massive amount of support requests this year.",
            highlight: DataLoader.formatNumber(totalCreated),
            label: "Total Tickets Created",
            type: "metric"
        });

        // Power Hour
        if (tickets.createdByHour.length > 0) {
            const maxHourRow = tickets.createdByHour.reduce((max, row) =>
                (parseFloat(row.Tickets) || 0) > (parseFloat(max.Tickets) || 0) ? row : max
            );
            this.cards.push({
                title: "Maximum Productivity",
                content: `Our peak activity happened during the ${maxHourRow['Ticket created - Hour']} hour.`,
                highlight: maxHourRow['Ticket created - Hour'],
                label: "The Daily Power Hour",
                type: "metric"
            });
        }

        // Peak Day Card
        if (tickets.createdByDate.length > 0) {
            const maxRow = tickets.createdByDate.reduce((max, row) =>
                (parseFloat(row.Tickets) || 0) > (parseFloat(max.Tickets) || 0) ? row : max
            );
            this.cards.push({
                title: "Our Busiest Moment",
                content: `Everything happened at once on ${maxRow['Ticket created - Date']}.`,
                highlight: DataLoader.formatNumber(maxRow.Tickets),
                label: "Tickets in a Single Day",
                type: "metric"
            });
        }

        // Support Streak (Simulated/Calculated from createdByDate for now)
        if (tickets.createdByDate.length > 1) {
            let maxStreak = 0;
            let currentStreak = 0;
            tickets.createdByDate.forEach(row => {
                const count = parseFloat(row.Tickets) || 0;
                if (count > 0) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            });

            this.cards.push({
                title: "Reliability",
                content: "We were there for our users when they needed us most.",
                highlight: `${maxStreak} Days`,
                label: "Longest Support Streak",
                type: "metric"
            });
        }

        // Efficiency Card
        const resolution = parseFloat(efficiency.fullResolutionMedian[0]?.['Full resolution time (hrs)']) || 0;
        this.cards.push({
            title: "Lightning Fast Support",
            content: "We kept our customers happy with speedy resolutions.",
            highlight: DataLoader.formatHours(resolution),
            label: "Median Resolution Time",
            type: "metric"
        });

        // Top Assignee Card
        const topAssignee = assignee.activity[0];
        if (topAssignee) {
            this.cards.push({
                title: "Support Superstar",
                content: `${topAssignee['Assignee name']} led the way this year.`,
                highlight: DataLoader.formatNumber(topAssignee['Solved tickets']),
                label: "Tickets Solved",
                type: "metric"
            });
        }

        // Closing Card
        this.cards.push({
            title: "Ready for 2026?",
            content: "Great work this year, team. Let's make the next one even better.",
            highlight: "Thank You",
            type: "closing"
        });
    },

    // Render the fullscreen overlay
    renderOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'storyOverlay';
        overlay.className = 'story-overlay';

        overlay.innerHTML = `
            <div class="story-progress">
                ${this.cards.map((_, i) => `<div class="progress-bar-segment" data-index="${i}"><div class="progress-fill"></div></div>`).join('')}
            </div>
            <button class="story-close" id="closeStory">&times;</button>
            <div class="story-card-container" id="storyCardContainer"></div>
            <div class="story-nav">
                <div class="nav-area prev" id="prevCard"></div>
                <div class="nav-area next" id="nextCard"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('closeStory').addEventListener('click', () => this.close());
        document.getElementById('prevCard').addEventListener('click', () => this.prev());
        document.getElementById('nextCard').addEventListener('click', () => this.next());

        // Keyboard navigation
        const keyHandler = (e) => {
            if (!this.isActive) return;
            if (e.key === 'ArrowRight' || e.key === ' ') this.next();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'Escape') this.close();
        };
        window.addEventListener('keydown', keyHandler);
    },

    // Show a specific card
    showCard(index) {
        const container = document.getElementById('storyCardContainer');
        if (!container) return;

        const cardData = this.cards[index];
        const card = document.createElement('div');
        card.className = `story-card ${cardData.type}`;

        card.innerHTML = `
            <div class="card-content">
                <h2 class="card-title fade-in">${cardData.title}</h2>
                <div class="card-highlight scale-up">${cardData.highlight}</div>
                ${cardData.label ? `<div class="card-label fade-in">${cardData.label}</div>` : ''}
                <p class="card-text fade-in-up">${cardData.content}</p>
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(card);

        // Update progress bars
        const segments = document.querySelectorAll('.progress-bar-segment');
        segments.forEach((seg, i) => {
            seg.classList.remove('active', 'completed');
            if (i < index) seg.classList.add('completed');
            if (i === index) seg.classList.add('active');
        });

        this.currentCardIndex = index;
    },

    next() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.showCard(this.currentCardIndex + 1);
        } else {
            this.close();
        }
    },

    prev() {
        if (this.currentCardIndex > 0) {
            this.showCard(this.currentCardIndex - 1);
        }
    }
};

window.StoryMode = StoryMode;
