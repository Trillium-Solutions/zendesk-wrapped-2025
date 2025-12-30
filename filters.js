// Filters Module - Handles filtering logic
const Filters = {
    state: {
        dateStart: null,
        dateEnd: null,
        assignees: ['all']
    },

    // Initialize filters
    init() {
        this.setupEventListeners();
        this.setDefaultDates();
    },

    // Set default date range (full year)
    setDefaultDates() {
        const startInput = document.getElementById('dateRangeStart');
        const endInput = document.getElementById('dateRangeEnd');

        if (startInput && endInput) {
            startInput.value = '2025-01-01';
            endInput.value = '2025-12-31';
            this.state.dateStart = '2025-01-01';
            this.state.dateEnd = '2025-12-31';
        }
    },

    // Setup event listeners
    setupEventListeners() {
        const startInput = document.getElementById('dateRangeStart');
        const endInput = document.getElementById('dateRangeEnd');
        const assigneeSelect = document.getElementById('assigneeFilter');
        const resetBtn = document.getElementById('resetFilters');

        if (startInput) {
            startInput.addEventListener('change', (e) => {
                this.state.dateStart = e.target.value;
                this.applyFilters();
            });
        }

        if (endInput) {
            endInput.addEventListener('change', (e) => {
                this.state.dateEnd = e.target.value;
                this.applyFilters();
            });
        }

        if (assigneeSelect) {
            assigneeSelect.addEventListener('change', (e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                this.state.assignees = selected.length > 0 ? selected : ['all'];
                this.applyFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    },

    // Populate assignee filter
    populateAssignees(assignees) {
        const select = document.getElementById('assigneeFilter');
        if (!select) return;

        // Clear existing options except "All"
        select.innerHTML = '<option value="all" selected>All Assignees</option>';

        // Add assignees
        assignees.forEach(assignee => {
            const option = document.createElement('option');
            option.value = assignee;
            option.textContent = assignee;
            select.appendChild(option);
        });
    },

    // Apply filters
    applyFilters() {
        if (window.App && window.App.updateDashboard) {
            window.App.updateDashboard();
        }
    },

    // Reset filters
    reset() {
        this.setDefaultDates();

        const assigneeSelect = document.getElementById('assigneeFilter');
        if (assigneeSelect) {
            assigneeSelect.value = 'all';
            this.state.assignees = ['all'];
        }

        this.applyFilters();
    },

    // Get filtered data
    filterData(data, dateField, assigneeField = null) {
        let filtered = [...data];

        // Filter by date range
        if (this.state.dateStart || this.state.dateEnd) {
            filtered = DataLoader.filterByDateRange(
                filtered,
                dateField,
                this.state.dateStart,
                this.state.dateEnd
            );
        }

        // Filter by assignees
        if (assigneeField && !this.state.assignees.includes('all')) {
            filtered = DataLoader.filterByAssignees(
                filtered,
                assigneeField,
                this.state.assignees
            );
        }

        return filtered;
    }
};

window.Filters = Filters;
