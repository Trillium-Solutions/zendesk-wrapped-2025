# Zendesk Wrapped 2025 - Interactive Analytics Dashboard

A stunning, interactive analytics dashboard that visualizes Zendesk support data across three main categories: Tickets, Efficiency, and Assignee Activity.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-success)
![Built with](https://img.shields.io/badge/Built%20with-Vanilla%20JS-yellow)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-ff6384)

## ✨ Features

### 📊 Three Interactive Sections

1. **Tickets Section**
   - Total tickets and solved tickets metrics
   - Tickets created over time (line chart)
   - Tickets by hour of day (bar chart)
   - Tickets by day of week (bar chart)
   - Peak day identification

2. **Efficiency Section**
   - Median first reply and resolution times
   - Response & resolution time trends
   - Agent replies distribution
   - Resolution time brackets
   - Average stations metrics

3. **Assignee Activity Section**
   - Solved tickets by assignee (horizontal bar chart)
   - Detailed performance metrics table
   - Satisfaction vs response time scatter plot
   - Wait time by assignee

### 🎨 Premium Design

- **Dark Mode**: Sleek dark theme with vibrant gradients
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Animations**: Micro-interactions and transitions
- **Responsive**: Works on mobile, tablet, and desktop
- **Custom Typography**: Inter font for modern aesthetics

### 🔍 Interactive Filters

- **Date Range Filter**: Filter data by start and end dates
- **Assignee Filter**: Multi-select dropdown for specific assignees
- **Real-time Updates**: All charts update dynamically based on filters

## 🚀 Deployment to GitHub Pages

### Option 1: Using GitHub Web Interface

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Zendesk dashboard"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Select **/ (root)** as the folder
   - Click **Save**

3. **Access your dashboard**:
   - Your dashboard will be available at: `https://[username].github.io/zendesk_wrapped_2025/`
   - It may take a few minutes to deploy

### Option 2: Using GitHub CLI

```bash
# Install GitHub CLI if you haven't
brew install gh

# Authenticate
gh auth login

# Create repository and push
gh repo create zendesk_wrapped_2025 --public --source=. --push

# Enable GitHub Pages
gh api repos/:owner/:repo/pages -X POST -f source[branch]=main -f source[path]=/
```

## 🛠️ Local Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for loading CSV files)

### Running Locally

You can use any of these methods to run a local server:

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

## 📁 Project Structure

```
zendesk_wrapped_2025/
├── index.html              # Main HTML structure
├── styles.css              # Premium CSS design system
├── app.js                  # Main application logic
├── charts.js               # Chart creation and management
├── data-loader.js          # CSV loading and parsing
├── filters.js              # Filter implementation
├── README.md               # This file
├── Zendesk-Support_Tickets_12302025_0037/
│   └── *.csv              # Tickets data
├── Zendesk-Support_Efficiency_12302025_0927/
│   └── *.csv              # Efficiency data
└── Zendesk-Support_Assignee-activity_12302025_0926/
    └── *.csv              # Assignee activity data
```

## 🔧 Technology Stack

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Chart.js**: Interactive charts and visualizations
- **PapaParse**: CSV parsing library
- **Google Fonts**: Inter font family

## 📊 Data Sources

The dashboard automatically loads and parses CSV files from three Zendesk export categories:

1. **Tickets** (11 CSV files): Ticket creation, resolution, and status data
2. **Efficiency** (13 CSV files): Response times, resolution times, and agent metrics
3. **Assignee Activity** (8 CSV files): Individual assignee performance and satisfaction scores

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This is a personal analytics dashboard, but feel free to fork and customize for your own Zendesk data!

## 📝 License

MIT License - feel free to use this dashboard for your own projects.

## 🐛 Troubleshooting

### Charts not loading?
- Make sure you're running a local web server (not opening the HTML file directly)
- Check the browser console for errors
- Verify all CSV files are in the correct directories

### Filters not working?
- Ensure date format is YYYY-MM-DD
- Check that assignee names match exactly with CSV data

### Blank dashboard?
- Open browser DevTools (F12) and check the Console tab for errors
- Verify CSV files are accessible and properly formatted

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for better support analytics**
