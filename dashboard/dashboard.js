// Smartphone Purchase Predictor Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    
    // Global variables for chart instances
    window.ageChart = null;
    window.brandChart = null;
    window.factorsChart = null;
    window.importanceChart = null;
    
    // Log initialization
    console.log('Dashboard UI initializing...');
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('main section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav item
            document.querySelectorAll('.main-nav li').forEach(item => {
                item.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                section.classList.add('hidden-section');
                section.classList.remove('active-section');
                
                if (section.id === targetId + '-section') {
                    section.classList.remove('hidden-section');
                    section.classList.add('active-section');
                }
            });
        });
    });
    
    // Range input value displays
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(input.id + '-value');
        if (valueDisplay) {
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value;
            });
        }
    });
    
    // Load and process data
    loadData();
});

// Data loading and processing
let csvData = [];
let filteredData = [];

function loadData() {
    console.log('Loading data...');
    fetch('../data/smartphone_purchase_data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            // Parse CSV data
            console.log('CSV data received, parsing...');
            csvData = parseCSV(text);
            console.log(`Parsed ${csvData.length} rows of data`);
            filteredData = csvData;
            
            // Initialize dashboard components
            initializeDashboard(csvData);
            
            // Hide loading overlay when data is loaded
            document.getElementById('loading-overlay').style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('loading-overlay').style.display = 'none';
            document.querySelector('.app-container').innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Data</h2>
                    <p>${error.message}</p>
                    <p>Please check the data file path and try again.</p>
                </div>
            `;
        });
}

function parseCSV(text) {
    // Skip comments and get headers
    const lines = text.split('\n').filter(line => !line.startsWith('#') && line.trim() !== '');
    
    if (lines.length === 0) {
        console.error('No valid data lines found in CSV');
        return [];
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    console.log('CSV Headers:', headers);
    
    // Make sure we have the required columns
    if (!headers.includes('Age') || !headers.includes('Purchased')) {
        console.error('CSV is missing required columns (Age or Purchased)');
        alert('The data file is missing required columns. Please check the CSV file format.');
        return [];
    }
    
    // Parse data rows
    const rows = lines.slice(1).map((line, lineIndex) => {
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            if (index < values.length) {
                row[header] = values[index].trim();
            } else {
                console.warn(`Missing value for ${header} in line ${lineIndex + 2}`);
                row[header] = '';
            }
        });
        
        return row;
    }).filter(row => row.Age && !isNaN(parseInt(row.Age))); // Filter out rows with invalid Age
    
    console.log(`Parsed ${rows.length} valid data rows`);
    console.log('First row sample:', rows.length > 0 ? rows[0] : 'No data');
    
    // Validate purchase data
    const purchaseValues = rows.map(row => row.Purchased).filter(Boolean);
    console.log(`Purchase values found: ${purchaseValues.length}, sample: ${purchaseValues.slice(0, 5).join(', ')}`);
    
    return rows;
}

function initializeDashboard(data) {
    // Initialize all dashboard components
    renderSummaryStats(data);
    renderAgeChart(data);
    renderBrandChart(data);
    renderFactorsChart(data);
    renderFeatureImportance(data);
    renderCustomerSegments(data);
    populateDropdowns(data);
    setupPredictionForm();
    renderDataTable(data);
    renderAutoProfile(data);
    renderWhatIf(data);
}

// Dashboard Summary Stats
function renderSummaryStats(data) {
    if (!data.length) {
        console.warn("No data available for summary stats");
        document.getElementById('purchase-rate').textContent = "N/A";
        document.getElementById('avg-age').textContent = "N/A";
        document.getElementById('avg-salary').textContent = "N/A";
        return;
    }
    
    console.log(`Calculating summary stats for ${data.length} rows`);
    
    // Calculate summary statistics with better error handling
    try {
        // Purchase Rate
        const purchaseCount = data.filter(row => row.Purchased === '1').length;
        const purchaseRate = (purchaseCount / data.length * 100).toFixed(1);
        
        // Average Age
        const ages = data.map(row => parseInt(row.Age)).filter(age => !isNaN(age));
        const avgAge = ages.length ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : 'N/A';
        
        // Average Salary - handle possible missing data
        const salaries = data.map(row => parseInt(row.Salary))
            .filter(salary => !isNaN(salary));
        const avgSalary = salaries.length ? (salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length).toFixed(0) : '0';
        
        console.log(`Summary stats calculated: Purchase rate: ${purchaseRate}%, Avg age: ${avgAge}, Avg salary: ${avgSalary}`);
        
        // Clear existing content
        document.getElementById('purchase-rate').innerHTML = '';
        document.getElementById('avg-age').innerHTML = '';
        document.getElementById('avg-salary').innerHTML = '';
        
        // Update DOM with the new structure
        // Purchase rate - find the number span and update it
        const purchaseRateNum = document.querySelector('#purchase-rate .stat-value-number');
        if (purchaseRateNum) {
            purchaseRateNum.textContent = purchaseRate;
        } else {
            // Fallback if the structure is not as expected
            document.getElementById('purchase-rate').innerHTML = `<span class="stat-value-number">${purchaseRate}</span><span class="stat-value-unit">%</span>`;
        }
        
        // Add percentage sign animation
        const purchaseRateUnit = document.querySelector('#purchase-rate .stat-value-unit');
        if (purchaseRateUnit) {
            purchaseRateUnit.classList.add('highlight-unit');
            setTimeout(() => purchaseRateUnit.classList.remove('highlight-unit'), 2000);
        }
        
        // Add animation to the stat boxes
        const statBoxes = document.querySelectorAll('.stat-box');
        statBoxes.forEach((box, index) => {
            setTimeout(() => {
                box.classList.add('animate-in');
            }, 200 * index);
        });
        
        // Also add the stat-value-number animation
        setTimeout(() => {
            document.querySelectorAll('.stat-value-number').forEach(num => {
                num.classList.add('highlight-number');
                setTimeout(() => num.classList.remove('highlight-number'), 2000);
            });
        }, 800);
        
        // Average age
        const avgAgeNum = document.querySelector('#avg-age .stat-value-number');
        if (avgAgeNum) {
            avgAgeNum.textContent = avgAge;
        } else {
            // Fallback if the structure is not as expected
            document.getElementById('avg-age').innerHTML = `<span class="stat-value-number">${avgAge}</span>`;
        }
        
        // Average salary - with formatted number (without dollar sign)
        const salaryValueElem = document.querySelector('#avg-salary .salary-value');
        if (salaryValueElem) {
            salaryValueElem.textContent = formatNumber(avgSalary);
        } else {
            // Fallback if the structure is not as expected
            document.getElementById('avg-salary').innerHTML = `<span class="salary-value">${formatNumber(avgSalary)}</span>`;
        }
        
        // Add animation class to make the values stand out
        document.querySelectorAll('.stat-value').forEach(el => {
            el.classList.add('highlight-stat');
            setTimeout(() => el.classList.remove('highlight-stat'), 2000);
        });
    } catch (error) {
        console.error("Error calculating summary stats:", error);
        // Update with proper error formatting for the new structure
        document.querySelector('#purchase-rate .stat-value-number').textContent = "N/A";
        document.querySelector('#avg-age .stat-value-number').textContent = "N/A";
        document.querySelector('#avg-salary .salary-value').textContent = "N/A";
    }
}

// Charts
function renderAgeChart(data) {
    const ageGroups = {
        '18-24': 0,
        '25-34': 0, 
        '35-44': 0,
        '45+': 0
    };
    
    const purchasedByAge = {
        '18-24': 0,
        '25-34': 0, 
        '35-44': 0,
        '45+': 0
    };
    
    console.log(`Rendering age chart with ${data.length} rows of data`);
    
    // Group data by age
    data.forEach(row => {
        if (!row.Age) {
            console.warn('Row missing Age:', row);
            return;
        }
        
        const age = parseInt(row.Age);
        if (isNaN(age)) {
            console.warn(`Invalid age value: ${row.Age}`);
            return;
        }
        
        let ageGroup;
        
        if (age < 25) ageGroup = '18-24';
        else if (age < 35) ageGroup = '25-34';
        else if (age < 45) ageGroup = '35-44';
        else ageGroup = '45+';
        
        ageGroups[ageGroup]++;
        if (row.Purchased === '1') {
            purchasedByAge[ageGroup]++;
        }
    });
    
    console.log('Age groups data:', ageGroups);
    console.log('Purchased by age data:', purchasedByAge);
    
    // Make sure we have real data to display
    const hasData = Object.values(ageGroups).some(value => value > 0);
    
    // Calculate purchase rates by age group and filter out empty age groups
    const purchaseRates = Object.keys(ageGroups)
        .filter(group => ageGroups[group] > 0) // Only include groups with data
        .map(group => {
            return {
                group,
                rate: ageGroups[group] ? (purchasedByAge[group] / ageGroups[group] * 100) : 0
            };
        });
    
    // Check if we have data
    if (!hasData) {
        console.warn("No age data available for chart");
        document.getElementById('age-chart').parentNode.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-chart-bar"></i>
                <p>No age data available</p>
            </div>
        `;
        return;
    }
    
    // Convert string values to numbers for proper calculation
    const purchaseRateData = purchaseRates.map(item => parseFloat(item.rate.toFixed(1)));
    console.log('Purchase rate data for chart:', purchaseRateData);
    
    // Create chart with enhanced visuals for dark theme
    const ctx = document.getElementById('age-chart').getContext('2d');
    
    // Clear any existing chart
    if (window.ageChart) {
        window.ageChart.destroy();
    }
    
    window.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: purchaseRates.map(item => item.group),
            datasets: [{
                label: 'Purchase Rate (%)',
                data: purchaseRateData,
                backgroundColor: [
                    'rgba(187, 134, 252, 0.7)', 
                    'rgba(98, 0, 238, 0.7)',
                    'rgba(3, 218, 198, 0.7)',
                    'rgba(1, 135, 134, 0.7)'
                ],
                borderColor: [
                    'rgba(187, 134, 252, 1)', 
                    'rgba(98, 0, 238, 1)',
                    'rgba(3, 218, 198, 1)',
                    'rgba(1, 135, 134, 1)'
                ],
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            animation: {
                duration: 1500
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.87)'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    titleColor: 'rgba(255, 255, 255, 0.87)',
                    bodyColor: 'rgba(255, 255, 255, 0.87)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...purchaseRateData) > 50 ? 100 : 50,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.87)'
                    },
                    title: {
                        display: true,
                        text: 'Percentage (%)',
                        color: 'rgba(255, 255, 255, 0.87)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.87)'
                    }
                }
            }
        }
    });
}

function renderBrandChart(data) {
    // Count brands
    const brands = {};
    data.forEach(row => {
        const brand = row.Brand_Preference;
        if (!brand) return;
        if (!brands[brand]) brands[brand] = 0;
        brands[brand]++;
    });
    
    console.log('Brand distribution:', brands);
    
    // Check if we have data
    if (Object.keys(brands).length === 0) {
        console.warn("No brand data available for chart");
        document.getElementById('brand-chart').parentNode.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-chart-pie"></i>
                <p>No brand preference data available</p>
            </div>
        `;
        return;
    }
    
    // Sort by popularity
    const sortedBrands = Object.keys(brands).sort((a, b) => brands[b] - brands[a]);
    
    // Clear any existing chart
    if (window.brandChart) {
        window.brandChart.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('brand-chart').getContext('2d');
    window.brandChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedBrands,
            datasets: [{
                data: sortedBrands.map(brand => brands[brand]),
                backgroundColor: [
                    'rgba(187, 134, 252, 0.7)',
                    'rgba(3, 218, 198, 0.7)',
                    'rgba(98, 0, 238, 0.7)',
                    'rgba(1, 135, 134, 0.7)',
                    'rgba(55, 0, 179, 0.7)'
                ],
                borderColor: [
                    'rgba(187, 134, 252, 1)',
                    'rgba(3, 218, 198, 1)',
                    'rgba(98, 0, 238, 1)',
                    'rgba(1, 135, 134, 1)',
                    'rgba(55, 0, 179, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.87)',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    titleColor: 'rgba(255, 255, 255, 0.87)',
                    bodyColor: 'rgba(255, 255, 255, 0.87)'
                }
            }
        }
    });
}

function renderFactorsChart(data) {
    // Calculate purchase rates for different factors
    const factors = {
        'Tech Savvy': calculateRateForFactor(data, 'Tech_Savvy', '1'),
        'High Online Activity': calculateRateForFactor(data, 'Online_Activity_Score', row => parseInt(row) > 75),
        'High Loyalty': calculateRateForFactor(data, 'Loyalty_Score', row => parseInt(row) >= 8),
        'Warranty Interest': calculateRateForFactor(data, 'Warranty_Interest', '1'),
        'Previous Purchases': calculateRateForFactor(data, 'Previous_Purchases', row => parseInt(row) >= 3),
    };
    
    // Create chart
    const ctx = document.getElementById('factors-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(factors),
            datasets: [{
                label: 'Purchase Rate (%)',
                data: Object.values(factors).map(rate => rate.toFixed(1)),
                backgroundColor: 'rgba(3, 218, 198, 0.7)',
                borderColor: 'rgba(1, 135, 134, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function calculateRateForFactor(data, field, condition) {
    const filtered = data.filter(row => {
        if (typeof condition === 'function') {
            return condition(row[field]);
        } else {
            return row[field] === condition;
        }
    });
    
    if (filtered.length === 0) return 0;
    
    const purchased = filtered.filter(row => row.Purchased === '1').length;
    return (purchased / filtered.length) * 100;
}

function renderFeatureImportance(data) {
    // Calculate feature importance (simplified version)
    const features = [
        { name: 'Tech Savvy', field: 'Tech_Savvy', importance: calculateFeatureImportance(data, 'Tech_Savvy') },
        { name: 'Age', field: 'Age', importance: calculateFeatureImportance(data, 'Age') },
        { name: 'Online Activity', field: 'Online_Activity_Score', importance: calculateFeatureImportance(data, 'Online_Activity_Score') },
        { name: 'Salary', field: 'Salary', importance: calculateFeatureImportance(data, 'Salary') },
        { name: 'Loyalty Score', field: 'Loyalty_Score', importance: calculateFeatureImportance(data, 'Loyalty_Score') },
        { name: 'Previous Purchases', field: 'Previous_Purchases', importance: calculateFeatureImportance(data, 'Previous_Purchases') }
        // Removed Social Media Influence to make the list more compact
    ];
    
    // Sort by importance
    features.sort((a, b) => b.importance - a.importance);
    
    // Take only top 5 features for better visibility
    const topFeatures = features.slice(0, 5);
    
    // Normalize importance to percentages
    const maxImportance = Math.max(...topFeatures.map(f => f.importance));
    topFeatures.forEach(feature => {
        feature.percentage = (feature.importance / maxImportance) * 100;
    });
    
    // Render feature importance bars
    const container = document.querySelector('.feature-importance-container');
    container.innerHTML = '';
    
    topFeatures.forEach(feature => {
        const item = document.createElement('div');
        item.className = 'feature-importance-item';
        item.innerHTML = `
            <div class="feature-name">
                ${feature.name}
                <div class="feature-percentage">${feature.percentage.toFixed(0)}%</div>
            </div>
            <div class="feature-bar">
                <div class="feature-value" style="width: 0%"></div>
            </div>
        `;
        container.appendChild(item);
        
        // Animate the bars after a brief delay for visual effect
        setTimeout(() => {
            item.querySelector('.feature-value').style.width = `${feature.percentage}%`;
        }, 100);
    });
}

function calculateFeatureImportance(data, field) {
    // Simple importance calculation based on purchase rate difference
    const values = Array.from(new Set(data.map(row => row[field])));
    
    // If too many unique values, bin them
    if (values.length > 5 && !['Tech_Savvy', 'Preferred_OS', 'Brand_Preference', 'Warranty_Interest'].includes(field)) {
        return calculateNumericalFeatureImportance(data, field);
    }
    
    let maxDiff = 0;
    for (let value of values) {
        const withValue = data.filter(row => row[field] === value);
        const withoutValue = data.filter(row => row[field] !== value);
        
        if (withValue.length === 0 || withoutValue.length === 0) continue;
        
        const purchaseRateWith = withValue.filter(row => row.Purchased === '1').length / withValue.length;
        const purchaseRateWithout = withoutValue.filter(row => row.Purchased === '1').length / withoutValue.length;
        
        const diff = Math.abs(purchaseRateWith - purchaseRateWithout);
        if (diff > maxDiff) maxDiff = diff;
    }
    
    return maxDiff;
}

function calculateNumericalFeatureImportance(data, field) {
    // For numerical fields, calculate correlation with purchase
    const values = data.map(row => parseFloat(row[field]));
    const purchases = data.map(row => row.Purchased === '1' ? 1 : 0);
    
    // Calculate correlation coefficient
    return Math.abs(calculateCorrelation(values, purchases));
}

function calculateCorrelation(x, y) {
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate correlation
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;
        
        numerator += xDiff * yDiff;
        xDenominator += xDiff * xDiff;
        yDenominator += yDiff * yDiff;
    }
    
    if (xDenominator === 0 || yDenominator === 0) return 0;
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
}

function renderCustomerSegments(data) {
    // Define customer segments
    const segments = [
        { 
            name: 'Tech Enthusiast',
            filter: row => row.Tech_Savvy === '1' && parseInt(row.Online_Activity_Score) >= 80,
            icon: '💻'
        },
        {
            name: 'Brand Loyalist',
            filter: row => parseInt(row.Loyalty_Score) >= 8,
            icon: '🏆'
        },
        {
            name: 'Bargain Hunter',
            filter: row => parseInt(row.Salary) < 50000 && parseInt(row.Previous_Purchases) >= 2,
            icon: '🔍'
        },
        {
            name: 'Premium Buyer',
            filter: row => parseInt(row.Salary) >= 65000 && row.Warranty_Interest === '1',
            icon: '💎'
        }
    ];
    
    // Calculate segment statistics
    const segmentData = segments.map(segment => {
        const customers = data.filter(segment.filter);
        const purchased = customers.filter(row => row.Purchased === '1').length;
        
        return {
            ...segment,
            count: customers.length,
            purchaseRate: customers.length ? (purchased / customers.length * 100) : 0
        };
    }).filter(segment => segment.count > 0);
    
    // Render segment cards
    const container = document.getElementById('personas');
    container.innerHTML = '';
    
    segmentData.forEach(segment => {
        const card = document.createElement('div');
        card.className = 'persona-card';
        card.innerHTML = `
            <div class="persona-icon">${segment.icon}</div>
            <div class="persona-info">
                <h3>${segment.name}</h3>
                <p><strong>Count:</strong> ${segment.count} users</p>
                <p><strong>Purchase Rate:</strong> ${segment.purchaseRate.toFixed(1)}%</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Prediction functionality
function populateDropdowns(data) {
    // Extract unique values for dropdowns
    const brands = [...new Set(data.map(row => row.Brand_Preference))];
    const oSystems = [...new Set(data.map(row => row.Preferred_OS))];
    
    // Populate brand dropdown
    const brandDropdown = document.getElementById('brand-preference');
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandDropdown.appendChild(option);
    });
    
    // Populate OS dropdown
    const osDropdown = document.getElementById('os-preference');
    oSystems.forEach(os => {
        const option = document.createElement('option');
        option.value = os;
        option.textContent = os;
        osDropdown.appendChild(option);
    });
}

function setupPredictionForm() {
    const predictBtn = document.getElementById('predict-btn');
    const predictionResult = document.querySelector('.prediction-result');
    
    predictBtn.addEventListener('click', function() {
        // Get form values
        const age = parseInt(document.getElementById('age').value);
        const salary = parseInt(document.getElementById('salary').value);
        const brand = document.getElementById('brand-preference').value;
        const os = document.getElementById('os-preference').value;
        const onlineActivity = parseInt(document.getElementById('online-activity').value);
        const techSavvy = document.getElementById('tech-savvy').checked ? 1 : 0;
        const prevPurchases = parseInt(document.getElementById('previous-purchases').value);
        const loyaltyScore = parseInt(document.getElementById('loyalty-score').value);
        const sessionTime = parseFloat(document.getElementById('session-time').value);
        const socialInfluence = parseInt(document.getElementById('social-influence').value);
        const warrantyInterest = document.getElementById('warranty-interest').checked ? 1 : 0;
        
        // Make prediction (simplified model)
        const probability = predictPurchaseLikelihood({
            age, salary, brand, os, onlineActivity, techSavvy,
            prevPurchases, loyaltyScore, sessionTime, socialInfluence, warrantyInterest
        });
        
        // Generate key factors
        const keyFactors = generateKeyFactors({
            age, salary, brand, os, onlineActivity, techSavvy,
            prevPurchases, loyaltyScore, sessionTime, socialInfluence, warrantyInterest
        }, probability);
        
        // Update UI
        document.querySelector('.meter-fill').style.width = `${probability}%`;
        document.querySelector('.meter-value').textContent = `${probability.toFixed(0)}%`;
        
        // Update key factors
        const keyFactorsList = document.getElementById('key-factors-list');
        keyFactorsList.innerHTML = '';
        keyFactors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            keyFactorsList.appendChild(li);
        });
        
        // Generate similar customers
        findSimilarCustomers({
            age, salary, brand, os, onlineActivity, techSavvy,
            prevPurchases, loyaltyScore, sessionTime, socialInfluence, warrantyInterest
        });
        
        // Show result
        predictionResult.classList.remove('hidden');
    });
}

function predictPurchaseLikelihood(customer) {
    // Simple rule-based prediction model
    let score = 0;
    
    // Age factor (younger more likely)
    if (customer.age < 30) score += 15;
    else if (customer.age < 40) score += 10;
    else score += 5;
    
    // Brand preference
    if (customer.brand === 'Samsung' || customer.brand === 'Apple') score += 10;
    else if (customer.brand === 'Xiaomi') score += 15;
    else score += 8;
    
    // OS preference
    if (customer.os === 'Android') score += 12;
    else score += 8;
    
    // Tech savvy
    if (customer.techSavvy) score += 15;
    
    // Online activity
    score += Math.min(15, Math.floor(customer.onlineActivity / 7));
    
    // Previous purchases
    score += Math.min(10, customer.prevPurchases * 3);
    
    // Loyalty score
    score += customer.loyaltyScore;
    
    // Social influence
    score += Math.min(10, Math.floor(customer.socialInfluence / 10));
    
    // Warranty interest
    if (customer.warrantyInterest) score += 8;
    
    // Cap at 0-100
    return Math.min(100, Math.max(0, score));
}

function generateKeyFactors(customer, probability) {
    const factors = [];
    
    if (customer.techSavvy) {
        factors.push('Tech-savvy users are more likely to purchase smartphones');
    }
    
    if (customer.age < 30) {
        factors.push('Younger users (under 30) show higher purchase rates');
    }
    
    if (customer.onlineActivity > 70) {
        factors.push('High online activity correlates with smartphone purchases');
    }
    
    if (customer.brand === 'Samsung' || customer.brand === 'Xiaomi') {
        factors.push(`${customer.brand} has strong purchase conversion in this demographic`);
    }
    
    if (customer.prevPurchases >= 3) {
        factors.push('Users with 3+ previous purchases are likely repeat buyers');
    }
    
    if (customer.loyaltyScore >= 7) {
        factors.push('High brand loyalty (7+) is a positive purchase indicator');
    }
    
    if (customer.warrantyInterest) {
        factors.push('Interest in warranty options indicates purchase intent');
    }
    
    if (customer.socialInfluence > 80) {
        factors.push('High social media influence suggests purchase receptiveness');
    }
    
    // If we don't have enough factors, add generic ones
    if (factors.length < 3) {
        if (probability > 70) {
            factors.push('Overall profile matches high-likelihood purchaser patterns');
        } else if (probability < 40) {
            factors.push('Profile characteristics suggest lower purchase probability');
        }
    }
    
    // Return top 4 factors at most
    return factors.slice(0, 4);
}

function findSimilarCustomers(customer) {
    // Find similar customers in the dataset
    const similarCustomers = csvData.map(row => {
        // Calculate similarity score
        let similarity = 0;
        
        // Age similarity (within 5 years)
        if (Math.abs(parseInt(row.Age) - customer.age) <= 5) similarity += 1;
        
        // Same brand preference
        if (row.Brand_Preference === customer.brand) similarity += 2;
        
        // Same OS preference
        if (row.Preferred_OS === customer.os) similarity += 2;
        
        // Tech savvy match
        if ((row.Tech_Savvy === '1') === (customer.techSavvy === 1)) similarity += 1;
        
        // Loyalty score (within 2 points)
        if (Math.abs(parseInt(row.Loyalty_Score) - customer.loyaltyScore) <= 2) similarity += 1;
        
        // Online activity (within 20 points)
        if (Math.abs(parseInt(row.Online_Activity_Score) - customer.onlineActivity) <= 20) similarity += 1;
        
        // Previous purchases (within 2)
        if (Math.abs(parseInt(row.Previous_Purchases) - customer.prevPurchases) <= 2) similarity += 1;
        
        // Warranty interest match
        if ((row.Warranty_Interest === '1') === (customer.warrantyInterest === 1)) similarity += 1;
        
        return {
            id: row.User_ID,
            similarity,
            purchased: row.Purchased === '1',
            age: row.Age,
            brand: row.Brand_Preference,
            salary: row.Salary
        };
    });
    
    // Sort by similarity and take top 3
    const topSimilar = similarCustomers
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
    
    // Render similar customers
    const container = document.querySelector('.similar-customers-list');
    container.innerHTML = '';
    
    topSimilar.forEach(cust => {
        const item = document.createElement('div');
        item.className = 'similar-customer';
        item.innerHTML = `
            <div class="customer-card ${cust.purchased ? 'purchased' : 'not-purchased'}">
                <div class="customer-icon"><i class="fas fa-user"></i></div>
                <div class="customer-details">
                    <p><strong>User ID:</strong> ${cust.id}</p>
                    <p><strong>Age:</strong> ${cust.age} | <strong>Brand:</strong> ${cust.brand}</p>
                    <p><strong>Outcome:</strong> <span class="purchase-status">${cust.purchased ? 'Purchased ✓' : 'Did Not Purchase ✗'}</span></p>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Auto-Profiling
function renderAutoProfile(data) {
    const container = document.getElementById('autoprofile');
    
    // Create user selector
    const userSelector = document.createElement('div');
    userSelector.className = 'user-selector';
    userSelector.innerHTML = `
        <label for="user-profile-selector">Select User: </label>
        <select id="user-profile-selector">
            ${data.map(user => `<option value="${user.User_ID}">User ${user.User_ID}</option>`).join('')}
        </select>
    `;
    
    // Create profile display area
    const profileDisplay = document.createElement('div');
    profileDisplay.id = 'profile-display';
    
    // Add elements to container
    container.innerHTML = '';
    container.appendChild(userSelector);
    container.appendChild(profileDisplay);
    
    // Add event listener
    document.getElementById('user-profile-selector').addEventListener('change', function() {
        displayUserProfile(this.value, data);
    });
    
    // Display first user initially
    displayUserProfile(data[0].User_ID, data);
}

function displayUserProfile(userId, data) {
    const user = data.find(u => u.User_ID === userId);
    if (!user) return;
    
    // Determine user persona
    let persona = 'General Consumer';
    if (parseInt(user.Loyalty_Score) >= 8) persona = 'Brand Loyalist';
    else if (parseInt(user.Online_Activity_Score) >= 80 && user.Tech_Savvy === '1') persona = 'Tech Enthusiast';
    else if (parseInt(user.Salary) <= 50000 && parseInt(user.Previous_Purchases) >= 2) persona = 'Bargain Hunter';
    else if (user.Warranty_Interest === '1' && parseFloat(user.Avg_Session_Time) > 2) persona = 'Warranty Focused';
    
    // Calculate purchase probability
    const purchaseProbability = predictPurchaseLikelihood({
        age: parseInt(user.Age),
        salary: parseInt(user.Salary),
        brand: user.Brand_Preference,
        os: user.Preferred_OS,
        onlineActivity: parseInt(user.Online_Activity_Score),
        techSavvy: user.Tech_Savvy === '1' ? 1 : 0,
        prevPurchases: parseInt(user.Previous_Purchases),
        loyaltyScore: parseInt(user.Loyalty_Score),
        sessionTime: parseFloat(user.Avg_Session_Time),
        socialInfluence: parseInt(user.Social_Media_Influence),
        warrantyInterest: user.Warranty_Interest === '1' ? 1 : 0
    });
    
    // Generate recommendations
    const recommendations = generateRecommendations(user, persona);
    
    // Create profile display
    document.getElementById('profile-display').innerHTML = `
        <div class="user-profile">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-title">
                    <h3>User ${user.User_ID}</h3>
                    <span class="persona-badge">${persona}</span>
                </div>
            </div>
            
            <div class="profile-details">
                <div class="detail-group">
                    <div class="detail-item">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${user.Age}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Salary:</span>
                        <span class="detail-value">$${formatNumber(user.Salary)}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <div class="detail-item">
                        <span class="detail-label">Brand:</span>
                        <span class="detail-value">${user.Brand_Preference}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">OS:</span>
                        <span class="detail-value">${user.Preferred_OS}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <div class="detail-item">
                        <span class="detail-label">Tech Savvy:</span>
                        <span class="detail-value">${user.Tech_Savvy === '1' ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Previous Purchases:</span>
                        <span class="detail-value">${user.Previous_Purchases}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <div class="detail-item">
                        <span class="detail-label">Loyalty Score:</span>
                        <span class="detail-value">${user.Loyalty_Score}/10</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Online Activity:</span>
                        <span class="detail-value">${user.Online_Activity_Score}/100</span>
                    </div>
                </div>
            </div>
            
            <div class="purchase-probability">
                <h4>Purchase Probability</h4>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${purchaseProbability}%"></div>
                </div>
                <div class="probability-value">${purchaseProbability.toFixed(0)}%</div>
                <div class="actual-purchase ${user.Purchased === '1' ? 'purchased' : 'not-purchased'}">
                    Actual: ${user.Purchased === '1' ? 'Purchased ✓' : 'Did Not Purchase ✗'}
                </div>
            </div>
            
            <div class="recommendations">
                <h4>Recommendations</h4>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateRecommendations(user, persona) {
    const recommendations = [];
    
    // Persona-based recommendations
    if (persona === 'Brand Loyalist') {
        recommendations.push('Offer exclusive brand loyalty rewards and early access to new models');
        recommendations.push('Highlight brand-specific features and ecosystem benefits');
    } else if (persona === 'Tech Enthusiast') {
        recommendations.push('Focus on technical specifications and cutting-edge features');
        recommendations.push('Provide opportunities for beta testing and advanced user programs');
    } else if (persona === 'Bargain Hunter') {
        recommendations.push('Emphasize value proposition and cost-effective options');
        recommendations.push('Create bundle offers with accessories or services');
    } else if (persona === 'Warranty Focused') {
        recommendations.push('Highlight extended warranty options and protection plans');
        recommendations.push('Emphasize durability and customer support benefits');
    }
    
    // Feature-based recommendations
    if (parseInt(user.Social_Media_Influence) > 70) {
        recommendations.push('Target with social media campaigns and influencer partnerships');
    }
    
    if (parseInt(user.Salary) > 65000) {
        recommendations.push('Present premium model options with advanced features');
    } else {
        recommendations.push('Highlight affordable models with good value-to-feature ratio');
    }
    
    if (parseFloat(user.Avg_Session_Time) > 2.5) {
        recommendations.push('Emphasize battery life and display quality for heavy users');
    }
    
    // Return top 3 recommendations
    return recommendations.slice(0, 3);
}

// What-If Analysis
function renderWhatIf(data) {
    const container = document.getElementById('what-if');
    
    // Create the What-If form
    container.innerHTML = `
        <form id="what-if-form">
            <div class="what-if-controls">
                <div class="control-group">
                    <label for="wi-age">Age: <span id="wi-age-value">30</span></label>
                    <input type="range" id="wi-age" min="18" max="60" value="30">
                </div>
                
                <div class="control-group">
                    <label for="wi-salary">Salary: $<span id="wi-salary-value">55000</span></label>
                    <input type="range" id="wi-salary" min="30000" max="100000" value="55000" step="1000">
                </div>
                
                <div class="control-group">
                    <label for="wi-online-activity">Online Activity: <span id="wi-online-activity-value">70</span></label>
                    <input type="range" id="wi-online-activity" min="0" max="100" value="70">
                </div>
                
                <div class="control-group">
                    <label for="wi-tech-savvy">Tech Savvy:</label>
                    <select id="wi-tech-savvy">
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label for="wi-loyalty">Loyalty Score: <span id="wi-loyalty-value">6</span></label>
                    <input type="range" id="wi-loyalty" min="1" max="10" value="6">
                </div>
            </div>
            
            <div id="what-if-result" class="what-if-result">
                <h4>Purchase Probability</h4>
                <div class="wi-probability-meter">
                    <div class="wi-meter-fill"></div>
                    <div class="wi-meter-value">0%</div>
                </div>
            </div>
        </form>
    `;
    
    // Add event listeners
    const rangeInputs = container.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(`${input.id}-value`);
        
        input.addEventListener('input', () => {
            if (input.id === 'wi-salary') {
                valueDisplay.textContent = formatNumber(input.value);
            } else {
                valueDisplay.textContent = input.value;
            }
            updateWhatIfPrediction();
        });
    });
    
    // Add listener for tech savvy dropdown
    document.getElementById('wi-tech-savvy').addEventListener('change', updateWhatIfPrediction);
    
    // Initial prediction
    updateWhatIfPrediction();
}

function updateWhatIfPrediction() {
    const age = parseInt(document.getElementById('wi-age').value);
    const salary = parseInt(document.getElementById('wi-salary').value);
    const onlineActivity = parseInt(document.getElementById('wi-online-activity').value);
    const techSavvy = document.getElementById('wi-tech-savvy').value === '1' ? 1 : 0;
    const loyaltyScore = parseInt(document.getElementById('wi-loyalty').value);
    
    // Make prediction with sample values for other fields
    const probability = predictPurchaseLikelihood({
        age,
        salary,
        brand: 'Samsung', // default
        os: 'Android', // default
        onlineActivity,
        techSavvy,
        prevPurchases: 2, // default
        loyaltyScore,
        sessionTime: 2.0, // default
        socialInfluence: 60, // default
        warrantyInterest: 0 // default
    });
    
    // Update UI
    document.querySelector('.wi-meter-fill').style.width = `${probability}%`;
    document.querySelector('.wi-meter-value').textContent = `${probability.toFixed(0)}%`;
}

// Data Table
function renderDataTable(data) {
    // Get table elements
    const tableHead = document.querySelector('#data-table thead');
    const tableBody = document.querySelector('#data-table tbody');
    
    // Setup filter
    document.getElementById('data-filter').addEventListener('change', function() {
        filterDataTable(this.value);
    });
    
    // Setup search
    document.getElementById('data-search').addEventListener('input', function() {
        searchDataTable(this.value);
    });
    
    // Render headers
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        tableHead.innerHTML = `
            <tr>
                ${headers.map(header => `<th>${header.replace(/_/g, ' ')}</th>`).join('')}
            </tr>
        `;
    }
    
    // Store original data for filtering
    window.originalTableData = data;
    
    // Render first page
    renderTablePage(data, 1);
    
    // Setup pagination
    setupPagination(data);
}

function renderTablePage(data, page, pageSize = 10) {
    const tableBody = document.querySelector('#data-table tbody');
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);
    
    tableBody.innerHTML = '';
    
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Update page info
    const totalPages = Math.ceil(data.length / pageSize);
    document.getElementById('page-info').textContent = `Page ${page} of ${totalPages}`;
    
    // Update current page
    window.currentPage = page;
    window.filteredData = data;
    
    // Update pagination buttons
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages;
}

function setupPagination(data) {
    const pageSize = 10;
    const totalPages = Math.ceil(data.length / pageSize);
    
    // Initial page
    window.currentPage = 1;
    
    // Setup pagination buttons
    document.getElementById('prev-page').addEventListener('click', function() {
        if (window.currentPage > 1) {
            renderTablePage(window.filteredData, window.currentPage - 1, pageSize);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        if (window.currentPage < totalPages) {
            renderTablePage(window.filteredData, window.currentPage + 1, pageSize);
        }
    });
}

function filterDataTable(filter) {
    const data = window.originalTableData;
    let filtered;
    
    switch (filter) {
        case 'purchased':
            filtered = data.filter(row => row.Purchased === '1');
            break;
        case 'not-purchased':
            filtered = data.filter(row => row.Purchased === '0');
            break;
        default:
            filtered = data;
    }
    
    // Apply any existing search
    const searchTerm = document.getElementById('data-search').value;
    if (searchTerm) {
        filtered = searchInData(filtered, searchTerm);
    }
    
    renderTablePage(filtered, 1);
    setupPagination(filtered);
}

function searchDataTable(term) {
    const data = window.originalTableData;
    const filter = document.getElementById('data-filter').value;
    
    // First apply filter
    let filtered;
    switch (filter) {
        case 'purchased':
            filtered = data.filter(row => row.Purchased === '1');
            break;
        case 'not-purchased':
            filtered = data.filter(row => row.Purchased === '0');
            break;
        default:
            filtered = data;
    }
    
    // Then apply search
    if (term) {
        filtered = searchInData(filtered, term);
    }
    
    renderTablePage(filtered, 1);
    setupPagination(filtered);
}

function searchInData(data, term) {
    term = term.toLowerCase();
    
    return data.filter(row => {
        for (let key in row) {
            if (String(row[key]).toLowerCase().includes(term)) {
                return true;
            }
        }
        return false;
    });
}

// Helper Functions
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}
