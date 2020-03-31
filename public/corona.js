
async function getData(){
    try {
        const response = await fetch('/api');
        const text = await response.text();
        return Promise.resolve(text);
      } catch (error) {
        console.error(error);
    }
}

async function getCsv() {
    const data = await getData();
    const table = data.split('\n');
    const dates = table[0].split(',').slice(40);
    const infected = table[92].split(',').slice(40);
    return {dates, infected};
}

async function getChanges(){
    const data = await getCsv();
    const abs = data.infected;
    let rel = [];
    let perc = [];
    for (let i = 0; i < abs.length; i++) {
        rel[0]=0;
        perc[0]=0;
        rel[i] = abs[i]-abs[i-1];
        perc[i]= rel[i]/abs[i]*100;
    }
    return {rel,perc};
    }


async function chart1() {

    const data = await getCsv();
    const ctx = document.getElementById('chart1').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'total confirmed cases in cz',
                data: data.infected,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
    });
}

async function chart2() {
    
    const data = await getCsv();
    const datach = await getChanges();
    const ctx = document.getElementById('chart2').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'new cases in cz',
                data: datach.rel,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
    });
}

async function chart3() {
    
    const data = await getCsv();
    const datach = await getChanges();
    const ctx = document.getElementById('chart3').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'percentual changes in cz',
                data: datach.perc,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
    });
}


const msg = async function() {
    const msg = await relativeChanges();
    console.log('Message:', msg);
}


chart1();
chart2();
chart3();

 