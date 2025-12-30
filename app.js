// Main Application
const App = {
    data: null,
    currentTab: 'tickets',

    // Initialize the application
    async init() {
        try {
            // Show loading overlay
            this.showLoading();

            // Load all data
            this.data = await DataLoader.loadAll();

            // Initialize background particles
            this.initParticles();

            // Initialize filters
            Filters.init();

            // Populate assignee filter
            if (this.data.assignee.activity.length > 0) {
                const assignees = DataLoader.getAssignees(this.data.assignee.activity);
                Filters.populateAssignees(assignees);
            }

            // Setup tab navigation
            this.setupTabs();

            // Initial dashboard update
            this.updateDashboard();

            // Setup Start Wrapped button
            const wrappedBtn = document.getElementById('startWrapped');
            if (wrappedBtn) {
                wrappedBtn.addEventListener('click', () => {
                    if (window.StoryMode) {
                        window.StoryMode.start(this.data);
                    }
                });
            }

            // Hide loading overlay
            this.hideLoading();

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        }
    },

    // Show loading overlay
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    },

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 500);
        }
    },
    // Show error message
    showError(message) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div style="text-align: center; color: #f5576c;">
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    // Initialize background particles
    initParticles() {
        const container = document.getElementById('bgParticles');
        if (!container) return;

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 5 + 2;
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * -40;
            const left = Math.random() * 100;
            const top = Math.random() * 100;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--delay', `${delay}s`);

            container.appendChild(particle);
        }
    },

    // Setup tab navigation
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // Update active states
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(tabName).classList.add('active');

                this.currentTab = tabName;
            });
        });
    },

    // Update entire dashboard
    updateDashboard() {
        this.updateTicketsSection();
        this.updateEfficiencySection();
        this.updateAssigneeSection();
    },

    // Update Tickets Section
    updateTicketsSection() {
        if (!this.data || !this.data.tickets || !this.data.assignee) return;

        const { tickets, assignee } = this.data;

        // Check if specific assignee is selected
        const isAllAssignees = Filters.state.assignees.includes('all');
        const selectedAssignee = !isAllAssignees && Filters.state.assignees.length > 0
            ? Filters.state.assignees[0]
            : null;

        // Filter data
        const filteredByDate = Filters.filterData(
            tickets.createdByDate,
            'Ticket created - Date'
        );

        // Calculate metrics based on assignee selection
        let totalTickets, solvedTickets;

        if (isAllAssignees) {
            // Use overall ticket counts
            totalTickets = parseFloat(tickets.created[0]?.Tickets) || 0;
            solvedTickets = parseFloat(assignee.solved[0]?.['Solved tickets']) || 0;
        } else if (selectedAssignee) {
            // Find assignee-specific data
            const assigneeData = assignee.activity.find(
                row => row['Assignee name'] === selectedAssignee
            );

            if (assigneeData) {
                solvedTickets = parseFloat(assigneeData['Solved tickets']) || 0;
                // For total tickets, use solved as proxy (we don't have per-assignee created tickets)
                totalTickets = solvedTickets;
            } else {
                totalTickets = 0;
                solvedTickets = 0;
            }
        }

        let avgDaily = 0;
        let peakDay = '-';

        if (filteredByDate.length > 0) {
            if (isAllAssignees) {
                const totalInRange = filteredByDate.reduce((sum, row) =>
                    sum + (parseFloat(row.Tickets) || 0), 0);
                avgDaily = totalInRange / filteredByDate.length;

                const maxRow = filteredByDate.reduce((max, row) =>
                    (parseFloat(row.Tickets) || 0) > (parseFloat(max.Tickets) || 0) ? row : max
                );
                peakDay = maxRow['Ticket created - Date'];
            } else {
                // For specific assignee, calculate based on their solved tickets
                avgDaily = solvedTickets / filteredByDate.length;
                peakDay = 'N/A';
            }
        }

        // Update metrics
        document.getElementById('totalTickets').textContent = DataLoader.formatNumber(totalTickets);
        document.getElementById('solvedTickets').textContent = DataLoader.formatNumber(solvedTickets);
        document.getElementById('avgDailyTickets').textContent = DataLoader.formatNumber(avgDaily);
        document.getElementById('peakDay').textContent = peakDay;

        // Create charts
        if (filteredByDate.length > 0) {
            Charts.createTicketsOverTime(filteredByDate);
        }

        if (tickets.createdByHour.length > 0) {
            Charts.createTicketsByHour(tickets.createdByHour);
        }

        if (tickets.createdByDayOfWeek.length > 0) {
            Charts.createTicketsByDay(tickets.createdByDayOfWeek);
        }

        if (tickets.byChannel.length > 0) {
            Charts.createTicketChannel(tickets.byChannel);
        }

        // Update assignee charts in this section
        this.updateAssigneeSection();
    },

    // Update Efficiency Section
    updateEfficiencySection() {
        if (!this.data || !this.data.efficiency) return;

        const { efficiency } = this.data;

        // Filter data
        const filteredTrends = Filters.filterData(
            efficiency.resolutionOverTime,
            'Ticket solved - Date'
        );

        // Calculate metrics
        const firstReply = parseFloat(efficiency.firstReplyMedian[0]?.['First reply time (min)']) || 0;
        const resolution = parseFloat(efficiency.fullResolutionMedian[0]?.['Full resolution time (hrs)']) || 0;

        let avgReplies = 0;
        if (filteredTrends.length > 0) {
            const totalReplies = filteredTrends.reduce((sum, row) =>
                sum + (parseFloat(row['Agent replies']) || 0), 0);
            avgReplies = totalReplies / filteredTrends.length;
        }

        const avgStations = efficiency.assigneeStations.length > 0
            ? efficiency.assigneeStations.reduce((sum, row) =>
                sum + (parseFloat(row['Assignee stations']) || 0), 0) / efficiency.assigneeStations.length
            : 0;

        // Update metrics
        document.getElementById('medianFirstReply').textContent = DataLoader.formatHours(firstReply / 60);
        document.getElementById('medianResolution').textContent = DataLoader.formatHours(resolution);
        document.getElementById('avgAgentReplies').textContent = avgReplies.toFixed(1);
        document.getElementById('avgStations').textContent = avgStations.toFixed(1);

        // Create charts
        if (filteredTrends.length > 0) {
            Charts.createEfficiencyTrends(filteredTrends);
        }

        if (efficiency.agentRepliesBrackets.length > 0) {
            Charts.createAgentReplies(efficiency.agentRepliesBrackets);
        }

        if (efficiency.resolutionBrackets.length > 0) {
            Charts.createResolutionBrackets(efficiency.resolutionBrackets);
        }
    },

    // Update Assignee Section
    updateAssigneeSection() {
        if (!this.data || !this.data.assignee) return;

        const { assignee } = this.data;

        // Filter data
        let filteredActivity = assignee.activity;
        if (!Filters.state.assignees.includes('all')) {
            filteredActivity = DataLoader.filterByAssignees(
                filteredActivity,
                'Assignee name',
                Filters.state.assignees
            );
        }

        // Create charts
        if (filteredActivity.length > 0) {
            Charts.createAssigneeTickets(filteredActivity);
            Charts.createWaitTime(filteredActivity);
            this.updateAssigneeTable(filteredActivity);
        }
    },

    // Update Assignee Table
    updateAssigneeTable(data) {
        const tbody = document.querySelector('#assigneeTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');

            const name = row['Assignee name'] || '-';
            const solved = DataLoader.formatNumber(row['Solved tickets']);
            const firstReply = DataLoader.formatHours(row['First reply time (hrs)']);
            const resolution = DataLoader.formatHours(row['Full resolution time (hrs)']);
            const satisfaction = DataLoader.formatPercent(row['% Satisfaction score']);
            const oneTouch = DataLoader.formatPercent(row['% One-touch tickets']);

            tr.innerHTML = `
                <td><strong>${name}</strong></td>
                <td>${solved}</td>
                <td>${firstReply}</td>
                <td>${resolution}</td>
                <td>${satisfaction}</td>
                <td>${oneTouch}</td>
            `;

            tbody.appendChild(tr);
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
window.App = App;
