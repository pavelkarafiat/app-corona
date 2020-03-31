
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

async function relativeChanges(){
    const abs = await getCsv();
    //let rel = abs.infected.forEach((el)=>'55');
    let rel = [11,12,13,14,15];
    let rel2 = rel.map(element => {'33';});
    return rel2;
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




const msg = async function() {
    const msg = await relativeChanges();
    console.log('Message:', msg);
}

msg();
chart1();
 