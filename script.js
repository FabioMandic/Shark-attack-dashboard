let allData = [];
let charts = {};
let isAnimating = false;
let animationDecades = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];
let currentDecadeIndex = 0;
let isAnimationUpdate = false;


const invalidLocations = [
    "AFRICA", "ASIA", "EUROPE", "OCEANIA", "COAST OF AFRICA", 
    "PACIFIC OCEAN", "ATLANTIC OCEAN", "NORTH ATLANTIC OCEAN", 
    "SOUTH ATLANTIC OCEAN", "INDIAN OCEAN", "MEDITERRANEAN SEA"
];


function getDecadeLabel(year) {
    if (year >= 1900 && year <= 1909) return '1900-1909';
    if (year >= 1910 && year <= 1919) return '1910-1919';
    if (year >= 1920 && year <= 1929) return '1920-1929';
    if (year >= 1930 && year <= 1939) return '1930-1939';
    if (year >= 1940 && year <= 1949) return '1940-1949';
    if (year >= 1950 && year <= 1959) return '1950-1959';
    if (year >= 1960 && year <= 1969) return '1960-1969';
    if (year >= 1970 && year <= 1979) return '1970-1979';
    if (year >= 1980 && year <= 1989) return '1980-1989';
    if (year >= 1990 && year <= 1999) return '1990-1999';
    if (year >= 2000 && year <= 2009) return '2000-2009';
    if (year >= 2010 && year <= 2018) return '2010-2018';
    return null;
}


Papa.parse("attacks.csv", {
    download: true,
    header: true,
    skipEmptyLines: 'greedy', 
    encoding: "latin1",
    complete: function(results) {
        
        allData = results.data.map(row => {
            let cleanRow = {};
            Object.keys(row).forEach(key => {
                if (key) cleanRow[key.trim()] = row[key];
            });
            return cleanRow;
        }).map(d => {
            if (!d.Country) return d;
            
            let c = d.Country.toUpperCase().replace(/\?/g, '').trim();
            c = c.replace(/\(.*\)/g, '').trim(); 
            c = c.split(',')[0].split('/')[0].trim(); 
            
            if (c === "USA" || c === "UNITED STATES OF AMERICA") c = "UNITED STATES";
            if (c === "ENGLAND" || c === "SCOTLAND" || c === "BRITISH ISLES" || c === "WALES") c = "UNITED KINGDOM";
            if (c === "CEYLON") c = "SRI LANKA";
            if (c === "COLUMBIA") c = "COLOMBIA";
            if (c === "UAE") c = "UNITED ARAB EMIRATES";
            
            d.Country = c;
            return d;
        }).filter(d => {
            let year = parseInt(d.Year);
            let validYear = !isNaN(year) && year >= 1900 && year <= 2018;

            let countryClean = d.Country ? d.Country.toUpperCase().trim() : "";
            let isSouthAfrica = countryClean === "SOUTH AFRICA";
            let containsBlockWord = invalidLocations.some(word => countryClean.includes(word)) || countryClean.includes("OCEAN");
            let isValidCountry = countryClean !== "" && (isSouthAfrica || !containsBlockWord);

            let sex = d.Sex ? d.Sex.trim().toUpperCase() : "";
            let validSex = sex === 'M' || sex === 'F';

            let fatal = d['Fatal (Y/N)'] ? d['Fatal (Y/N)'].trim().toUpperCase() : "";
            let validFatal = fatal === 'Y' || fatal === 'N';

            return validYear && isValidCountry && validSex && validFatal;
        });

        buildCountryCheckboxList();
        document.getElementById('loader').style.display = 'none';
        initEvents();
        updateDashboard();
    }
});

function buildCountryCheckboxList() {
    const countries = [...new Set(allData.map(d => d.Country ? d.Country.trim() : ''))]
        .filter(c => c && c.length > 0)
        .sort();
        
    const container = document.getElementById('countryCheckboxContainer');
    container.innerHTML = ''; 
    
    let allOpt = document.createElement('label');
    allOpt.className = 'country-option global-option';
    allOpt.innerHTML = `<input type="checkbox" value="All" id="checkAll" checked> <strong>🌍 CIJELI SVIJET</strong>`;
    container.appendChild(allOpt);

    countries.forEach(c => {
        let label = document.createElement('label');
        label.className = 'country-option';
        label.innerHTML = `<input type="checkbox" value="${c}" class="country-checkbox"> ${c}`;
        container.appendChild(label);
    });

    document.getElementById('checkAll').addEventListener('change', function(e) {
        const cbs = document.querySelectorAll('.country-checkbox');
        if(e.target.checked) {
            cbs.forEach(cb => cb.checked = false); 
        }
        updateDashboard();
    });

    container.addEventListener('change', function(e) {
        if(e.target.classList.contains('country-checkbox')) {
            const checkedBoxes = document.querySelectorAll('.country-checkbox:checked');
            
            if (checkedBoxes.length > 3) {
                e.target.checked = false;
                alert("Možete označiti maksimalno 3 države za usporedbu!");
                return;
            }
            
            if (e.target.checked) {
                document.getElementById('checkAll').checked = false; 
            }
        }
        updateDashboard();
    });
}

function initEvents() {
    document.getElementById('yearFilter').addEventListener('input', (e) => {
        if (isAnimationUpdate) return; 
        
        isAnimating = false; 
        document.getElementById('playBtn').textContent = '▶ Pokreni animaciju';
        document.getElementById('playBtn').classList.remove('playing');
        document.getElementById('yearVal').innerText = e.target.value;
        updateDashboard();
    });
    
    document.getElementById('playBtn')?.addEventListener('click', toggleAnimation);
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    const btn = document.getElementById('playBtn');
    btn.textContent = isAnimating ? '⏸ Pauziraj' : '▶ Pokreni animaciju';
    btn.classList.toggle('playing', isAnimating);
    
    if (isAnimating) {
        const currentVal = parseInt(document.getElementById('yearFilter').value);
        let closestIndex = animationDecades.findIndex(d => d >= currentVal);
        currentDecadeIndex = closestIndex !== -1 ? closestIndex : 0;
        
        animateStep();
    } else {
        updateDashboard(); 
    }
}

function animateStep() {
    if (!isAnimating || currentDecadeIndex >= animationDecades.length) {
        isAnimating = false;
        document.getElementById('playBtn').textContent = '▶ Pokreni animaciju';
        document.getElementById('playBtn').classList.remove('playing');
        updateDashboard();
        return;
    }
    
    const decade = animationDecades[currentDecadeIndex];
    isAnimationUpdate = true;
    document.getElementById('yearFilter').value = decade;
    document.getElementById('yearVal').innerText = decade;
    isAnimationUpdate = false;
    
    updateDashboard();
    currentDecadeIndex++;
    
    setTimeout(animateStep, 2500); 
}

function updateDashboard() {
    const minYear = parseInt(document.getElementById('yearFilter').value);
    
    const checkedBoxes = document.querySelectorAll('.country-checkbox:checked');
    let selectedCountries = Array.from(checkedBoxes).map(cb => cb.value);
    const isGlobal = document.getElementById('checkAll').checked || selectedCountries.length === 0;

    let yearStart, yearEnd;
    if (isAnimating) {
        yearStart = minYear;
        yearEnd = Math.min(minYear + 9, 2018);
    } else {
        yearStart = minYear;
        yearEnd = 2018; 
    }
    
    
    let globalTimeData = allData.filter(d => {
        const year = parseInt(d.Year);
        return year >= yearStart && year <= yearEnd;
    });
    drawMap(globalTimeData); 

    
    drawPieChart(globalTimeData);
    drawDemographicsChart(globalTimeData);
    updateStats(globalTimeData, yearStart, yearEnd);

    
    let countryFilteredData = allData;
    if (!isGlobal) {
        countryFilteredData = allData.filter(d => d.Country && selectedCountries.includes(d.Country.trim()));
    }
    drawLineChart(countryFilteredData, isGlobal ? ['Cijeli svijet'] : selectedCountries);
}

function drawLineChart(data, countries) {
    const allDecades = ['1900-1909', '1910-1919', '1920-1929', '1930-1939', '1940-1949', '1950-1959', '1960-1969', '1970-1979', '1980-1989', '1990-1999', '2000-2009', '2010-2018'];
    const colors = ['#5bc0be', '#ff006e', '#3a86ff']; 
    
    const datasets = countries.map((country, idx) => {
        const decadeCounts = {};
        allDecades.forEach(dec => decadeCounts[dec] = 0);

        const countryData = country === 'Cijeli svijet' ? data : data.filter(d => d.Country === country);
        
        countryData.forEach(d => {
            const y = parseInt(d.Year);
            const decLabel = getDecadeLabel(y);
            if (decLabel && decadeCounts[decLabel] !== undefined) {
                decadeCounts[decLabel]++;
            }
        });

        return {
            label: country,
            data: allDecades.map(dec => decadeCounts[dec]),
            borderColor: colors[idx % colors.length],
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.3,
            pointBackgroundColor: colors[idx % colors.length],
            pointBorderColor: '#0b132b',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#edf2f4',
            pointHoverBorderColor: colors[idx % colors.length],
            pointHoverBorderWidth: 2
        };
    });

    if (charts['lineChart']) {
        const chart = charts['lineChart'];
        chart.data.labels = allDecades;
        chart.data.datasets = datasets;
        
        chart.update(isAnimating ? 'none' : 'active'); 
    } else {
        charts['lineChart'] = new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: { labels: allDecades, datasets: datasets },
            options: {
                responsive: true,
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'top',
                        labels: {
                            color: '#edf2f4',
                            font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1c2541',
                        titleColor: '#5bc0be',
                        bodyColor: '#edf2f4',
                        borderColor: 'rgba(91, 192, 190, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        font: { family: "'Inter', sans-serif" }
                    }
                },
                scales: { 
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                        ticks: { color: '#a8dadc', font: { family: "'Inter', sans-serif", size: 11 } }
                    },
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
                        ticks: { color: '#a8dadc', precision: 0, font: { family: "'Inter', sans-serif", size: 11 } } 
                    } 
                }
            }
        });
    }
}

function drawPieChart(data) {
    let y = 0, n = 0;
    data.forEach(d => {
        const f = String(d['Fatal (Y/N)']).toUpperCase().trim();
        if(f === 'Y') y++; else if(f === 'N') n++;
    });
    
    const labels = (y === 0 && n === 0) ? ['Nema podataka'] : ['Fatalno', 'Nije fatalno'];
    const values = (y === 0 && n === 0) ? [1] : [y, n];
    const colors = (y === 0 && n === 0) ? ['#3a506b'] : ['#ff4d6d', '#2ecc71'];

    if (charts['pieChart']) {
        const chart = charts['pieChart'];
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update('active'); 
    } else {
        const canvas = document.getElementById('pieChart');
        if (!canvas.parentElement.classList.contains('pie-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('pie-wrapper');
            wrapper.style.height = '280px';        
            wrapper.style.width = '100%';
            wrapper.style.position = 'relative'; 
            wrapper.style.marginTop = '10px';
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'center'; 
            wrapper.style.alignItems = 'center';     
            canvas.parentNode.insertBefore(wrapper, canvas);
            wrapper.appendChild(canvas);
        }

        charts['pieChart'] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#1c2541',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                plugins: { legend: { display: true, position: 'top' } }
            }
        });
    }
}

function drawDemographicsChart(data) {
    const bins = ['0-14', '15-24', '25-34', '35-44', '45-54', '55+'];
    let maleCounts = [0, 0, 0, 0, 0, 0];
    let femaleCounts = [0, 0, 0, 0, 0, 0];

    data.forEach(d => {
        let sex = d.Sex ? d.Sex.trim().toUpperCase() : '';
        let age = parseInt(d.Age);
        if (isNaN(age)) return;

        let idx = -1;
        if (age <= 14) idx = 0;
        else if (age <= 24) idx = 1;
        else if (age <= 34) idx = 2;
        else if (age <= 44) idx = 3;
        else if (age <= 54) idx = 4;
        else idx = 5;

        if (sex === 'M') maleCounts[idx]++;
        else if (sex === 'F') femaleCounts[idx]++;
    });

    if (charts['demographicsChart']) {
        const chart = charts['demographicsChart'];
        chart.data.datasets[0].data = maleCounts;
        chart.data.datasets[1].data = femaleCounts;
        chart.update('active'); 
    } else {
        charts['demographicsChart'] = new Chart(document.getElementById('demographicsChart'), {
            type: 'bar',
            data: {
                labels: bins,
                datasets: [
                    { label: 'Muškarci', data: maleCounts, backgroundColor: '#3a86ff' },
                    { label: 'Žene', data: femaleCounts, backgroundColor: '#ff006e' }
                ]
            },
            options: {
                responsive: true,
                animation: { duration: 750 },
                plugins: { legend: { display: true, position: 'top' } },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
            }
        });
    }
}

function drawMap(data) {
    const countries = {};
    data.forEach(d => countries[d.Country] = (countries[d.Country] || 0) + 1);

    const plotData = [{
        type: 'choropleth',
        locationmode: 'country names',
        locations: Object.keys(countries),
        z: Object.values(countries),
        colorscale: 'YlGnBu', 
        showscale: true,
        colorbar: {
            title: { 
                text: 'Dubina opasnosti<br>(Broj napada)', 
                font: { color: '#edf2f4', size: 11, family: "'Inter', sans-serif" } 
            },
            tickfont: { color: '#a8dadc', size: 10, family: "'Inter', sans-serif" },
            thickness: 15,
            len: 0.85,
            x: 0.96,
            reversescale: true 
        }
    }];

    Plotly.newPlot('mapDiv', plotData, {
        geo: { 
            bgcolor: 'rgba(0,0,0,0)', 
            projection: {type: 'robinson'}, 
            showframe: false,
            showcoastlines: true,
            coastlinecolor: 'rgba(255,255,255,0.08)' 
        },
        margin: {r:50, t:0, b:0, l:0}, 
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    });
}

function updateStats(data, yearStart, yearEnd) {
    const statsPanelElement = document.getElementById('statsPanel');
    if (!statsPanelElement) return; 
    
    const totalAttacks = data.length;
    const fatalAttacks = data.filter(d => String(d['Fatal (Y/N)']).toUpperCase().trim() === 'Y').length;
    const fatalityRate = totalAttacks > 0 ? ((fatalAttacks / totalAttacks) * 100).toFixed(1) : 0;
    
    const validAges = data.filter(d => d.Age && !isNaN(parseInt(d.Age)));
    const avgAge = validAges.length > 0 ? 
        validAges.reduce((sum, d) => sum + parseInt(d.Age), 0) / validAges.length : 0;
    
    const totalElem = document.getElementById('statTotal');
    if (totalElem) totalElem.textContent = totalAttacks;
    
    const fatalElem = document.getElementById('statFatal');
    if (fatalElem) fatalElem.textContent = fatalAttacks;
    
    const rateElem = document.getElementById('statRate');
    if (rateElem) rateElem.textContent = fatalityRate + '%';
    
    const ageElem = document.getElementById('statAvgAge');
    if (ageElem) ageElem.textContent = avgAge > 0 ? avgAge.toFixed(1) : '0'; 
    
    const rangeLabel = document.getElementById('rangeLabel');
    if (rangeLabel) {
        if (yearStart === yearEnd) {
            rangeLabel.textContent = `(${yearStart})`;
        } else {
            rangeLabel.textContent = `(${yearStart} - ${yearEnd})`;
        }
    }
}