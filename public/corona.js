async function getData() {
    const response = await fetch('/confirmed');
    const text = await response.text();
    return text;
}

const rawdata = getData();

async function getCountries() {
    const data = await rawdata;
    const rows = data.split('\n');
    const countries = [];
    rows.forEach(el => {
        const col = el.split(',');
        const country = col[1];
        countries.push(country);
    })
    countries.shift();
    return countries;
}

async function getCountryIndex(country) {
    const countries = await getCountries();
    const countryIndex = countries.findIndex(el => el == country) + 1;
    return countryIndex;
}

async function getDetails(country) {
    const data = await rawdata;
    const rows = data.split('\n');
    const countryIndex = await getCountryIndex(country);

    const dates = rows[0].split(',').slice(40);
    const confirmed = rows[countryIndex].split(',').slice(40);
    return {dates,confirmed};
}

async function getChanges(country) {
    const data = await getDetails(country);
    const abs = data.confirmed;
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
    const data = await getDetails(country);
    const datachanges = await getChanges(country);
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');
    const graphoptions1 = createOptions(data.dates,'total confirmed cases',data.confirmed);
    const graphoptions2 = createOptions(data.dates,'new cases',datachanges.relative);
    const graphoptions3 = createOptions(data.dates,'percentual changes',datachanges.percentual);

    if (window.bar1 != undefined) {window.bar1.destroy();}
    window.bar1 = new Chart(ctx1, graphoptions1);
    if (window.bar2 != undefined) {window.bar2.destroy();}
    window.bar2 = new Chart(ctx2, graphoptions2);
    if (window.bar3 != undefined) {window.bar3.destroy();}
    window.bar3 = new Chart(ctx3, graphoptions3);
}



const defaultCountry = 'Czechia';
let country = defaultCountry;
const countryHeader = document.getElementById('country');
countryHeader.textContent = ` ${country}`;

drawChart(country);

//add selecting of countries form
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



/*
 function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}
*/


