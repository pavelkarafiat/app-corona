

function mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function createDataset(dataset,country,n){
    let length = 23;
    let step = mapRange(n,0,length,0,1);
    let r1 = Math.random()*255;
    let r2 = Math.random()*255;
    let r3 = Math.random()*255;
    console.log(length);
    console.log(step);
    return {label: country,
            data: dataset,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor:`rgba(${r2},${r1},${r3}, 1)`,
            borderWidth: 0.85,
            fill: false,
            radius: 0
    };
};


function createOptionsTop(labels, data, countries) {
    
    //datain is array of array
    let _datasets = [];
    for (let i =0; i<data.length;i++){
        _datasets.push(createDataset(data[i],countries[i],i));
    }

    let graphOptions = {
        type: 'line',
        data: {
            labels: labels,
            datasets: _datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.7,
            tooltips: {enabled: false},
            hover: {mode: null},
            legend: {
                display: true,
                labels: {
                    fontColor: '#000',
                    fontFamily: 'Inter',
                    boxWidth: 10,
                }
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: true
                    },
                    ticks:{
                        fontFamily: 'Inter',
                        fontSize: 12,
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        fontFamily: 'Inter',
                        fontSize: 10,
                    }
                }]
            }                
        }
    }
    return graphOptions;
    
};



async function drawChartTop() {

    const dates = await getDates();
    const length = dates.length;
    let countries = [];
    let data = [];
    sortAbs = await getSorting('abs','confirmed');
    for(let i=0;i<23;i++){
        const name = sortAbs[i].name;
        countries.push(name);
        let confirmed = await getConfirmed(name);
        let deaths = await getDeaths(name);
        let recovered = await getRecovered(name);
        let active = [];
        for(let j =0;j<length;j++){
            active[j]=confirmed[j]-recovered[j]-deaths[j];
        }
        //normalize
        let max = Math.max(...active);
        for(let j =0;j<length;j++){
            active[j]=active[j]/max;
        }
        data.push(active);
    }


    const grey = 'rgb(155,155,155)';
    const graphoptions7 = createOptionsTop(dates,data,countries);
    const ctx7 = document.getElementById('chart7').getContext('2d');
    window.bar7 = new Chart(ctx7, graphoptions7);

}
