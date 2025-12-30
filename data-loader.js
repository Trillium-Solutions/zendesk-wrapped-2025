// Data Loader - Handles CSV loading and parsing
const DataLoader = {
    baseDir: '',
    cache: {},

    // CSV file paths organized by category
    files: {
        tickets: {
            created: 'Zendesk-Support_Tickets_12302025_0037/Created tickets.csv',
            createdByDate: 'Zendesk-Support_Tickets_12302025_0037/Tickets created by date.csv',
            createdByHour: 'Zendesk-Support_Tickets_12302025_0037/Tickets created by hour.csv',
            createdByDayOfWeek: 'Zendesk-Support_Tickets_12302025_0037/Average tickets created by day of week.csv',
            solved: 'Zendesk-Support_Tickets_12302025_0037/Solved tickets.csv',
            unsolved: 'Zendesk-Support_Tickets_12302025_0037/Unsolved tickets.csv',
            reopened: 'Zendesk-Support_Tickets_12302025_0037/Reopened tickets.csv',
            oneTouch: 'Zendesk-Support_Tickets_12302025_0037/One-touch tickets.csv',
            byMonth: 'Zendesk-Support_Tickets_12302025_0037/Tickets created by monthyear.csv',
            byChannel: 'Zendesk-Support_Tickets_12302025_0037/Tickets by selected attribute (top 10).csv'
        },
        efficiency: {
            firstReplyMedian: 'Zendesk-Support_Efficiency_12302025_0927/First reply time median.csv',
            firstResolutionMedian: 'Zendesk-Support_Efficiency_12302025_0927/First resolution time median.csv',
            fullResolutionMedian: 'Zendesk-Support_Efficiency_12302025_0927/Full resolution time median.csv',
            agentRepliesOverTime: 'Zendesk-Support_Efficiency_12302025_0927/Agent replies average and resolutions over time.csv',
            firstReplyOverTime: 'Zendesk-Support_Efficiency_12302025_0927/First reply and assignment time median over time.csv',
            resolutionOverTime: 'Zendesk-Support_Efficiency_12302025_0927/Full resolution and requester wait time median over time.csv',
            agentRepliesBrackets: 'Zendesk-Support_Efficiency_12302025_0927/Tickets by agent replies brackets.csv',
            firstReplyBrackets: 'Zendesk-Support_Efficiency_12302025_0927/Tickets by first reply time brackets.csv',
            resolutionBrackets: 'Zendesk-Support_Efficiency_12302025_0927/Tickets by full resolution time brackets.csv',
            assigneeStations: 'Zendesk-Support_Efficiency_12302025_0927/Assignee stations average.csv',
            groupStations: 'Zendesk-Support_Efficiency_12302025_0927/Group stations average.csv'
        },
        assignee: {
            activity: 'Zendesk-Support_Assignee-activity_12302025_0926/Assignee activity.csv',
            solved: 'Zendesk-Support_Assignee-activity_12302025_0926/Solved tickets.csv',
            solvedByAssignee: 'Zendesk-Support_Assignee-activity_12302025_0926/Solved tickets.csv',
            oneTouch: 'Zendesk-Support_Assignee-activity_12302025_0926/One-touch tickets.csv',
            twoTouch: 'Zendesk-Support_Assignee-activity_12302025_0926/Two-touch tickets.csv',
            assignmentToResolution: 'Zendesk-Support_Assignee-activity_12302025_0926/Assignment to resolution.csv',
            requesterWaitTime: 'Zendesk-Support_Assignee-activity_12302025_0926/Requester wait time median.csv',
            waitTimeBrackets: 'Zendesk-Support_Assignee-activity_12302025_0926/Tickets by requester wait time brackets.csv',
            satisfactionOverTime: 'Zendesk-Support_Assignee-activity_12302025_0926/Satisfaction score and requester wait time median by date.csv'
        }
    },

    // Load a single CSV file
    async loadCSV(filePath) {
        if (this.cache[filePath]) {
            return this.cache[filePath];
        }

        try {
            const response = await fetch(this.baseDir + filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }

            const csvText = await response.text();
            const parsed = Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                delimiter: ';' // Zendesk exports use semicolon
            });

            this.cache[filePath] = parsed.data;
            return parsed.data;
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return [];
        }
    },

    // Load all files for a category
    async loadCategory(category) {
        const categoryFiles = this.files[category];
        const results = {};

        for (const [key, path] of Object.entries(categoryFiles)) {
            results[key] = await this.loadCSV(path);
        }

        return results;
    },

    // Load all data
    async loadAll() {
        const data = {
            tickets: await this.loadCategory('tickets'),
            efficiency: await this.loadCategory('efficiency'),
            assignee: await this.loadCategory('assignee')
        };

        return data;
    },

    // Parse date from Zendesk format (e.g., "2 Jan 25")
    parseDate(dateStr) {
        if (!dateStr) return null;

        try {
            // Handle formats like "2 Jan 25" or "02 Jan 25"
            const parts = dateStr.trim().split(' ');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parts[1];
                const year = '20' + parts[2];

                const monthMap = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };

                const monthNum = monthMap[month];
                if (monthNum) {
                    return new Date(`${year}-${monthNum}-${day.toString().padStart(2, '0')}`);
                }
            }
        } catch (error) {
            console.error('Error parsing date:', dateStr, error);
        }

        return null;
    },

    // Format number with commas
    formatNumber(num) {
        if (num === null || num === undefined) return '-';
        return Math.round(num).toLocaleString();
    },

    // Format time in hours
    formatHours(hours) {
        if (hours === null || hours === undefined) return '-';
        return `${Math.round(hours)}h`;
    },

    // Format percentage
    formatPercent(decimal) {
        if (decimal === null || decimal === undefined) return '-';
        return `${Math.round(decimal * 100)}%`;
    },

    // Get unique assignees from data
    getAssignees(assigneeData) {
        if (!assigneeData || assigneeData.length === 0) return [];

        const assignees = assigneeData.map(row => row['Assignee name']).filter(Boolean);
        return [...new Set(assignees)].sort();
    },

    // Filter data by date range
    filterByDateRange(data, dateField, startDate, endDate) {
        if (!startDate && !endDate) return data;

        return data.filter(row => {
            const date = this.parseDate(row[dateField]);
            if (!date) return false;

            if (startDate && date < new Date(startDate)) return false;
            if (endDate && date > new Date(endDate)) return false;

            return true;
        });
    },

    // Filter data by assignees
    filterByAssignees(data, assigneeField, selectedAssignees) {
        if (!selectedAssignees || selectedAssignees.length === 0 || selectedAssignees.includes('all')) {
            return data;
        }

        return data.filter(row => selectedAssignees.includes(row[assigneeField]));
    }
};

// Export for use in other modules
window.DataLoader = DataLoader;
