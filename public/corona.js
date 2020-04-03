
async function getData(domain) {
    let route = '';
    if(domain == 'confirmed'){route = '/confirmed'}
    else if(domain == 'deaths'){route = '/deaths'}
    else if(domain == 'recovered'){route = '/recovered'}
    const response = await fetch(route);
    const text = await response.text();
    return text;
}

const rawConfirmed = getData('confirmed');
const rawDeaths = getData('deaths');
const rawRecovered = getData('recovered');


async function getWorld(domain) {
    let data ='';
    if(domain == 'confirmed'){data = await rawConfirmed;}
    else if(domain == 'deaths'){data = await rawDeaths;}
    else if(domain == 'recovered'){data = await rawRecovered;}
    
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(4).length;
    let domainData = Array(totalDays).fill(0);

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').slice(4);
        for (let j = 0; j < cols.length; j++) {
            domainData[j] += parseInt(cols[j]);
        }
    }
    return domainData;
}


async function createCountries(domain) {
    
    let data ='';
    if(domain == 'confirmed'){
        data = await rawConfirmed;
    }
    else if(domain == 'deaths'){
        data = await rawDeaths;
    }
    else if(domain == 'recovered'){
        data = await rawRecovered;
    }

    let countries = [];
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(4).length;

    for (let i = 1; i < rows.length; i++) {

        const cols = rows[i].split(',');
        let countryName = cols[1];
        let domainData = rows[i].split(',').slice(4).map(val => parseInt(val));

        let notSetYet = true;
        countries.forEach(country => {
            if (country.name == countryName) {
                for (let j = 0; j < totalDays; j++) {
                    country.values[j] += domainData[j];
                }
                notSetYet = false;
            }
        })
        if (notSetYet) {
            countries.push({
                name: countryName,
                values: domainData
            });
        }
    }
    
    return countries;
}

async function getSorting(sortBy,domain) {
    
    let statistics = [];
    const c = await createCountries(domain);
    const days = await getDates();

    for (i = 0; i < c.length; i++) {
        const res = {};
        const l = days.length;
        
        res.name = c[i].name;
        res.abs = c[i].values[l - 1];
        res.rel = (c[i].values[l - 1]) - (c[i].values[l - 2]);
        
        const rel1 = res.rel;
        const rel2 = (c[i].values[l - 2]) - (c[i].values[l - 3]);
        const rel3 = (c[i].values[l - 3]) - (c[i].values[l - 4]);
        const rel4 = (c[i].values[l - 4]) - (c[i].values[l - 5]);
        const avrRel = (rel1 + rel2 + rel3 + rel4) / 4;
        
        res.perc = avrRel / res.abs * 100;
        statistics.push(res);
    }
    
    if(sortBy == 'abs'){
        statistics.sort((a, b) => {return b.abs - a.abs});
    }
    else if(sortBy =='rel'){
        statistics.sort((a, b) => {return b.rel - a.rel});
    }
    else if(sortBy == 'perc'){
        statistics = statistics.filter(el => {return el.abs > 500});
        statistics.sort((a, b) => {return b.perc - a.perc});
    }
    return statistics;
}


async function getCountries() {
    let countries = [];
    const c = await createCountries('confirmed');
    c.forEach(el => {
        countries.push(el.name);
    })
    return countries;
}

async function getConfirmed(country) {
    const c = await createCountries('confirmed');
    const obj = c.find(o => o.name == country);
    return obj.values;
}

async function getDeaths(country) {
    const c = await createCountries('deaths');
    const obj = c.find(o => o.name == country);
    return obj.values;
}

async function getRecovered(country) {
    const c = await createCountries('recovered');
    const obj = c.find(o => o.name == country);
    return obj.values;
}

async function getDates() {
    const data = await rawConfirmed;
    const rows = data.split('\n');
    const dates = rows[0].split(',').slice(4);
    return dates;
}

async function getChanges(values) {
    const abs = values;
    let relative = [];
    let percentual = [];
    for (let i = 0; i < abs.length; i++) {
        relative[0] = 0;
        percentual[0] = 0;
        relative[i] = abs[i] - abs[i - 1];
        //avoid some strange errors in data (less total cases in next day)
        if (relative[i] < 0) relative[i] = 0;
        percentual[i] = relative[i] / abs[i] * 100;
    }
    return {
        relative,
        percentual
    };
}

function ex(start, growth, days) {
    let result = start;
    for (i = 1; i < days; i++) {
        result = result * growth;
    }
    return result;
}


function createOptions(labels, datasetlabel, datain, colors) {
    return graphOptions = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: datasetlabel[0],
                data: datain[0],
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: colors[0],
                borderWidth: 1,
                fill: false,
                radius: 1
            },
            {
                label: datasetlabel[1],
                data: datain[1],
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: colors[1],
                borderWidth: 1,
                fill: false,
                radius: 1
            },
            {
                label: datasetlabel[2],
                data: datain[2],
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: colors[2],
                borderWidth: 1,
                fill: false,
                radius: 1
            }
        ]
        },
        options: {
            legend: {
                labels: {
                    fontColor: '#353535',
                }
            }
        }
    };
}

async function drawChart(country) {
    const dates = await getDates();
    
    const confirmed = await getConfirmed(country);
    const confirmedChng = await getChanges(confirmed);
    const deaths = await getDeaths(country);
    console.log(deaths);
    const deathsChng = await getChanges(deaths);
    const recovered = await getRecovered(country);
    const recoveredChng = await getChanges(recovered);

    const graphoptions1 = createOptions(dates, ['cases','deaths','recovered'], [confirmed,deaths,recovered], ['#ff0000','#000','#5c9723']);
    const graphoptions2 = createOptions(dates, ['new cases','new deaths','new recovered'], [confirmedChng.relative,deathsChng.relative,recoveredChng.relative],['#ff0000','#000','#5c9723']);
    const graphoptions3 = createOptions(dates, ['growth cases','growth deaths','growth recovered'], [confirmedChng.percentual,deathsChng.percentual,recoveredChng.percentual],['#ff0000','#000','#5c9723']);

    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');

    if (window.bar1 != undefined) {
        window.bar1.destroy();
    }
    window.bar1 = new Chart(ctx1, graphoptions1);
    if (window.bar2 != undefined) {
        window.bar2.destroy();
    }
    window.bar2 = new Chart(ctx2, graphoptions2);
    if (window.bar3 != undefined) {
        window.bar3.destroy();
    }
    window.bar3 = new Chart(ctx3, graphoptions3);
}

async function drawChartWorld() {
    const dates = await getDates();
    
    const confirmed = await getWorld('confirmed');
    const confirmedChng = await getChanges(confirmed);
    const deaths = await getWorld('deaths');
    const deathsChng = await getChanges(deaths);
    const recovered = await getWorld('recovered');
    const recoveredChng = await getChanges(recovered);

    const graphoptions4 = createOptions(dates, ['cases','deaths','recovered'], [confirmed,deaths,recovered], ['#ff0000','#000','#5c9723']);
    const graphoptions5 = createOptions(dates, ['new cases','new deaths','new recovered'], [confirmedChng.relative,deathsChng.relative,recoveredChng.relative],['#ff0000','#000','#5c9723']);
    const graphoptions6 = createOptions(dates, ['growth cases','growth deaths','growth recovered'], [confirmedChng.percentual,deathsChng.percentual,recoveredChng.percentual],['#ff0000','#000','#5c9723']);

    const ctx4 = document.getElementById('chart4').getContext('2d');
    const ctx5 = document.getElementById('chart5').getContext('2d');
    const ctx6 = document.getElementById('chart6').getContext('2d');
    
    window.bar4 = new Chart(ctx4, graphoptions4);
    window.bar5 = new Chart(ctx5, graphoptions5);
    window.bar6 = new Chart(ctx6, graphoptions6);
}

/*-----------------------rendering-----------------------------*/

const defaultCountry = 'Czechia';
let country = defaultCountry;
const countryHeader = document.getElementById('country');
countryHeader.textContent = ` ${country}`;

drawChart(country);
drawChartWorld();

//render selecting form
getCountries().then(countries => {
    const countryOption = document.getElementById('countrySelect');
    countries.forEach(country => {
        const entry = document.createElement('option');
        entry.innerHTML = country;
        entry.value = country;
        countryOption.append(entry);
    });
    countryOption.addEventListener('change', (event) => {
        country = event.target.value;
        countryHeader.textContent = ` ${country}`;
        drawChart(country);
    });
});

//render statistics
getSorting('abs','confirmed').then(list => {
    const rankingDiv = document.getElementById('abs');
    for (let i = 0; i < 15; i++) {
        const entry = document.createElement('p');
        const name = list[i].name;
        const abs = list[i].abs;
        entry.textContent = `${i+1}. ${name}, ${abs}`;
        rankingDiv.append(entry);
    };
})

getSorting('rel','confirmed').then(list => {
    const rankingDiv = document.getElementById('rel');
    for (let i = 0; i < 15; i++) {
        const entry = document.createElement('p');
        const name = list[i].name;
        const rel = list[i].rel;
        entry.textContent = `${i+1}. ${name}, ${rel}`;
        rankingDiv.append(entry);
    };
})

getSorting('perc','confirmed').then(list => {
    const rankingDiv = document.getElementById('perc');
    for (let i = 0; i < 15; i++) {
        const entry = document.createElement('p');
        const name = list[i].name;
        const perc = list[i].perc;
        entry.textContent = `${i+1}. ${name}, ${perc.toFixed(0)}%`;
        rankingDiv.append(entry);
    };
    const info = document.createElement('p');
    info.textContent = `*only countries with more than 500 cases, growth is average for last 4 days`;
    rankingDiv.append(info);
})
