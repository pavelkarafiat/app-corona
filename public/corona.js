
async function getDataConfirmed() {
    const response = await fetch('/confirmed');
    const text = await response.text();
    return text;
}
//call the fetch only once!
const rawConfirmed = getDataConfirmed();

async function getWorld() {
    const data = await rawConfirmed;
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(4).length;
    let confirmed = Array(totalDays).fill(0);
    
    for(let i =1;i<rows.length;i++){
        const cols = rows[i].split(',').slice(4);
        for (let j=0;j<cols.length;j++){
            confirmed[j] += parseInt(cols[j]);
        }
    }
    return confirmed;
}

async function createCountries(){
    let countries = [];
    const data = await rawConfirmed;
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(4).length;
    
    for(let i =1;i<rows.length;i++){
        
        const cols = rows[i].split(',');
        let countryName = cols[1];
        let countryConfirmed = rows[i].split(',').slice(4).map(val=>parseInt(val));
        
        let notSetYet = true;
        //for every new row in table we need to compare all objects
        countries.forEach(country=>{
            //searching for already added countries to array of objects
            if (country.name == countryName){
                //summ all values from different countries contributors
                for (let j=0;j<totalDays;j++){
                    country.confirmed[j] +=  countryConfirmed[j];
                }
                notSetYet = false;
            }
        })
        if (notSetYet) {
            countries.push({name: countryName, confirmed: countryConfirmed});
        }
    }
    return countries;
}

async function getSorting(sortBy){
    let statistics = [];
    const c = await createCountries();
    const days = await getDates();
    for(i=0;i<c.length;i++){
        const res = {};
        const l = days.length;
        res.name=c[i].name;
        res.abs=c[i].confirmed[l-1];
        res.rel=(c[i].confirmed[l-1])-(c[i].confirmed[l-2]);
        const rel1 = res.rel;
        const rel2 = (c[i].confirmed[l-2])-(c[i].confirmed[l-3]);
        const rel3 = (c[i].confirmed[l-3])-(c[i].confirmed[l-4]);
        const rel4 = (c[i].confirmed[l-4])-(c[i].confirmed[l-5]);
        const avrRel = (rel1+rel2+rel3+rel4)/4;
        res.perc=avrRel/res.abs*100;
        statistics.push(res);
    }
    switch(sortBy){
        case 'abs':
            statistics.sort((a,b)=>{return b.abs-a.abs});
            break;
        case 'rel':
            statistics.sort((a,b)=>{return b.rel-a.rel});
            break;
        case 'perc':
            statistics.sort((a,b)=>{return b.perc-a.perc});
            statistics=statistics.filter(el=>{return el.abs > 500});
            console.log(statistics)
            break;
    }
    return statistics;
}


async function getCountries() {
    let countries = [];
    const c = await createCountries();
    c.forEach(el=>{countries.push(el.name);})
    return countries;
}

async function getConfirmed(country){
    const c = await createCountries();
    const obj = c.find(o => o.name == country);
    return obj.confirmed;
}

async function getDates(){
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
        percentual[i] = relative[i] / abs[i] * 100;
    }
    return {relative,percentual};
}

function ex(start, growth, days){
    let result = start;
    for(i=1;i<days;i++){
        result = result*growth;
    }
    return result;
}


function createOptions(labels, datasetlabel, data) {
    return graphOptions = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: datasetlabel,
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
    };
}

async function drawChart(country) {
    const dates = await getDates();
    const confirmed = await getConfirmed(country);
    const changes = await getChanges(confirmed);
        
    const graphoptions1 = createOptions(dates,'total confirmed cases',confirmed);
    const graphoptions2 = createOptions(dates,'new cases',changes.relative);
    const graphoptions3 = createOptions(dates,'percentual changes',changes.percentual);

    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');

    if (window.bar1 != undefined) {window.bar1.destroy();}
    window.bar1 = new Chart(ctx1, graphoptions1);
    if (window.bar2 != undefined) {window.bar2.destroy();}
    window.bar2 = new Chart(ctx2, graphoptions2);
    if (window.bar3 != undefined) {window.bar3.destroy();}
    window.bar3 = new Chart(ctx3, graphoptions3);
}

async function drawChartWorld() {
    const dates = await getDates();
    const confirmed = await getWorld();
    const changes = await getChanges(confirmed);
    
    const graphoptions4 = createOptions(dates,'total confirmed cases',confirmed);
    const graphoptions5 = createOptions(dates,'new cases',changes.relative);
    const graphoptions6 = createOptions(dates,'percentual changes',changes.percentual);

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
getSorting('abs').then(list=>{
    const rankingDiv = document.getElementById('abs');
    for(let i=0; i<20;i++){
        const entry = document.createElement('p');
        const name = list[i].name;
        const abs = list[i].abs;
        entry.textContent=`${i+1}. ${name}, ${abs}`;
        rankingDiv.append(entry);
    };
})

getSorting('rel').then(list=>{
    const rankingDiv = document.getElementById('rel');
    for(let i=0; i<20;i++){
        const entry = document.createElement('p');
        const name = list[i].name;
        const rel = list[i].rel;
        entry.textContent=`${i+1}. ${name}, ${rel}`;
        rankingDiv.append(entry);
    };
})

getSorting('perc').then(list=>{
    const rankingDiv = document.getElementById('perc');
    for(let i=0; i<20;i++){
        const entry = document.createElement('p');
        const name = list[i].name;
        const perc = list[i].perc;
        entry.textContent=`${i+1}. ${name}, ${perc.toFixed(0)}%`;
        rankingDiv.append(entry);
    };
        const info = document.createElement('p');
        info.textContent = `*only countries with more than 500 cases, growth is average for last 4 days`;
        rankingDiv.append(info);
})



