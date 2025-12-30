// Charts Module - Creates and manages all charts
const Charts = {
    instances: {},

    // Chart.js default configuration
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#a0a0b0',
                    font: {
                        family: 'Inter',
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(25, 25, 35, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#a0a0b0',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {}
            }
        },
        scales: {}
    },

    // Color schemes
    colors: {
        primary: ['rgba(102, 126, 234, 0.8)', 'rgba(240, 147, 251, 0.8)', 'rgba(79, 172, 254, 0.8)', 'rgba(67, 233, 123, 0.8)', 'rgba(250, 112, 154, 0.8)', 'rgba(0, 242, 254, 0.8)'],
        gradient: [
            { start: '#667eea', end: '#764ba2' },
            { start: '#f093fb', end: '#f5576c' },
            { start: '#4facfe', end: '#00f2fe' },
            { start: '#43e97b', end: '#38f9d7' },
            { start: '#fa709a', end: '#fee140' }
        ]
    },

    // Create gradient
    createGradient(ctx, color1, color2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    },

    // Destroy existing chart
    destroy(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    // Create Tickets Over Time Chart
    createTicketsOverTime(data) {
        this.destroy('ticketsOverTimeChart');

        const ctx = document.getElementById('ticketsOverTimeChart');
        if (!ctx) return;

        const dates = data.map(row => row['Ticket created - Date']);
        const tickets = data.map(row => parseFloat(row['Tickets']) || 0);
        const solved = data.map(row => parseFloat(row['Solved tickets']) || 0);

        const ctx_raw = ctx.getContext('2d');
        const gradient1 = this.createGradient(ctx_raw, 'rgba(102, 126, 234, 0.3)', 'rgba(102, 126, 234, 0.0)');
        const gradient2 = this.createGradient(ctx_raw, 'rgba(67, 233, 123, 0.3)', 'rgba(67, 233, 123, 0.0)');

        this.instances['ticketsOverTimeChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Created',
                        data: tickets,
                        borderColor: '#667eea',
                        backgroundColor: gradient1,
                        borderWidth: 3,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: 'rgba(255, 255, 255, 0.2)',
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Solved',
                        data: solved,
                        borderColor: '#43e97b',
                        backgroundColor: gradient2,
                        borderWidth: 3,
                        pointBackgroundColor: '#43e97b',
                        pointBorderColor: 'rgba(255, 255, 255, 0.2)',
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0b0',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Tickets by Hour Chart
    createTicketsByHour(data) {
        this.destroy('ticketsByHourChart');

        const ctx = document.getElementById('ticketsByHourChart');
        if (!ctx) return;

        const hours = data.map(row => row['Ticket created - Hour']);
        const tickets = data.map(row => parseFloat(row['Tickets']) || 0);

        this.instances['ticketsByHourChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Tickets',
                    data: tickets,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#a0a0b0' },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Tickets by Day of Week Chart
    createTicketsByDay(data) {
        this.destroy('ticketsByDayChart');

        const ctx = document.getElementById('ticketsByDayChart');
        if (!ctx) return;

        const days = data.map(row => row['Ticket created - Day of week']);
        const tickets = data.map(row => parseFloat(row['Tickets created - Daily average']) || 0);

        this.instances['ticketsByDayChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Avg Tickets',
                    data: tickets,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#a0a0b0' },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Ticket Channel Chart
    createTicketChannel(data) {
        this.destroy('ticketChannelChart');

        const ctx = document.getElementById('ticketChannelChart');
        if (!ctx) return;

        const channels = data.map(row => row['Ticket channel']);
        const percentages = data.map(row => parseFloat(row['COUNT(Tickets)']) || 0);

        this.instances['ticketChannelChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: channels,
                datasets: [{
                    data: percentages,
                    backgroundColor: this.colors.primary,
                    borderColor: 'rgba(25, 25, 35, 1)',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                ...this.defaultOptions,
                cutout: '60%',
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${Math.round(value)}%`;
                            }
                        }
                    },
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        });
    },


    // Create Efficiency Trends Chart
    createEfficiencyTrends(data) {
        this.destroy('efficiencyTrendsChart');

        const ctx = document.getElementById('efficiencyTrendsChart');
        if (!ctx) return;

        const dates = data.map(row => row['Ticket solved - Date']);
        const firstReply = data.map(row => parseFloat(row['MED(Full resolution time (hrs))']) || 0);
        const resolution = data.map(row => parseFloat(row['MED(Requester wait time (hrs))']) || 0);

        const ctx_raw = ctx.getContext('2d');
        const gradient1 = this.createGradient(ctx_raw, 'rgba(79, 172, 254, 0.3)', 'rgba(79, 172, 254, 0.0)');
        const gradient2 = this.createGradient(ctx_raw, 'rgba(240, 147, 251, 0.3)', 'rgba(240, 147, 251, 0.0)');

        this.instances['efficiencyTrendsChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'First Reply Time (hrs)',
                        data: firstReply,
                        borderColor: '#4facfe',
                        backgroundColor: gradient1,
                        borderWidth: 3,
                        pointBackgroundColor: '#4facfe',
                        pointBorderColor: 'rgba(255, 255, 255, 0.2)',
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Resolution Time (hrs)',
                        data: resolution,
                        borderColor: '#f093fb',
                        backgroundColor: gradient2,
                        borderWidth: 3,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: 'rgba(255, 255, 255, 0.2)',
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0b0',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Agent Replies Chart
    createAgentReplies(data) {
        this.destroy('agentRepliesChart');

        const ctx = document.getElementById('agentRepliesChart');
        if (!ctx) return;

        const brackets = data.map(row => row['Agent replies brackets']);
        const tickets = data.map(row => parseFloat(row['COUNT(Solved tickets)']) || 0);
        const uniqueTickets = data.map(row => parseFloat(row['D_COUNT(Solved tickets)']) || 0);

        this.instances['agentRepliesChart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: brackets,
                datasets: [{
                    data: tickets,
                    backgroundColor: this.colors.primary,
                    borderWidth: 0
                }]
            },
            options: {
                ...this.defaultOptions,
                cutout: '60%',
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const bracket = brackets[index];
                                const dCount = uniqueTickets[index];
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);

                                return [
                                    `${percentage}% of solved tickets`,
                                    `${dCount} tickets solved after ${bracket} agent replies`
                                ];
                            }
                        }
                    }
                }
            }
        });
    },

    // Create Resolution Brackets Chart
    createResolutionBrackets(data) {
        this.destroy('resolutionBracketsChart');

        const ctx = document.getElementById('resolutionBracketsChart');
        if (!ctx) return;

        const brackets = data.map(row => row['Full resolution time brackets']);
        const tickets = data.map(row => parseFloat(row['COUNT(Solved tickets)']) || 0);

        this.instances['resolutionBracketsChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: brackets,
                datasets: [{
                    label: 'Tickets',
                    data: tickets,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#a0a0b0' },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Assignee Tickets Chart
    createAssigneeTickets(data) {
        this.destroy('assigneeTicketsChart');

        const ctx = document.getElementById('assigneeTicketsChart');
        if (!ctx) return;

        const assignees = data.map(row => row['Assignee name']);
        const solved = data.map(row => parseFloat(row['Solved tickets']) || 0);

        this.instances['assigneeTicketsChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: assignees,
                datasets: [{
                    label: 'Solved Tickets',
                    data: solved,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#a0a0b0' },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    // Create Satisfaction Scatter Chart
    createSatisfactionScatter(data) {
        this.destroy('satisfactionScatterChart');

        const ctx = document.getElementById('satisfactionScatterChart');
        if (!ctx) return;

        const scatterData = data.map(row => ({
            x: parseFloat(row['First reply time (hrs)']) || 0,
            y: parseFloat(row['% Satisfaction score']) || 0,
            label: row['Assignee name']
        }));

        this.instances['satisfactionScatterChart'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Assignees',
                    data: scatterData,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 12
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'First Reply Time (hrs)',
                            color: '#a0a0b0'
                        },
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Satisfaction Score',
                            color: '#a0a0b0'
                        },
                        ticks: {
                            color: '#a0a0b0',
                            callback: function (value) {
                                return Math.round(value * 100) + '%';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                },
                plugins: {
                    ...this.defaultOptions.plugins,
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function (context) {
                                const point = context.raw;
                                return [
                                    `Assignee: ${point.label}`,
                                    `Reply Time: ${point.x.toFixed(1)}h`,
                                    `Satisfaction: ${Math.round(point.y * 100)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    },

    // Create Wait Time Chart
    createWaitTime(data) {
        this.destroy('waitTimeChart');

        const ctx = document.getElementById('waitTimeChart');
        if (!ctx) return;

        const assignees = data.map(row => row['Assignee name']);
        const waitTime = data.map(row => parseFloat(row['Requester wait time (hrs)']) || 0);

        this.instances['waitTimeChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: assignees,
                datasets: [{
                    label: 'Wait Time (hrs)',
                    data: waitTime,
                    backgroundColor: this.colors.primary,
                    borderRadius: 8
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0b0',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
};

window.Charts = Charts;
