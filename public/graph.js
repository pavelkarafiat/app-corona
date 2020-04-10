

function createOptions(labels, datasetlabel, datain, colors, unit) {
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
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.66,
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
                        callback: function(value, index, values) {
                            return `${value}${unit}`;
                        }
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
};


async function drawChart(country,testcz) {
    const dates = await getDates();
    
    const confirmed = await getConfirmed(country);
    const confirmedChng = await getChanges(confirmed);
    const deaths = await getDeaths(country);
    const deathsChng = await getChanges(deaths);
    const recovered = await getRecovered(country);
    const recoveredChng = await getChanges(recovered);
    const testdata = await getTestscz();
    const positivetests = await getRatio(confirmedChng.relative,testdata.newtests);
    
    const red = '#ed330e';
    const dark = '#262626';
    const green = '#5c9723';
    const blue = '#0088d6';
    const novis ='rgba(0,0,0,0)';
    
    let graphoptions1, graphoptions2, graphoptions3 ='';
    

    if(testcz==true){
        graphoptions1 = createOptions(dates, ['cases','tests',''], [confirmed,testdata.tests], [red,blue,novis],'');
        graphoptions2 = createOptions(dates, ['new cases','new tests',''], [confirmedChng.relative,testdata.newtests],[red,blue,novis],'');
        graphoptions3 = createOptions(dates, ['new positive tests percent','',''], [positivetests],[blue,novis,novis],'%');
    }
    else {
        graphoptions1 = createOptions(dates, ['cases','deaths','recovered'], [confirmed,deaths,recovered], [red,dark,green],'');
        graphoptions2 = createOptions(dates, ['new cases','new deaths','new recovered'], [confirmedChng.relative,deathsChng.relative,recoveredChng.relative],[red,dark,green],'');
        graphoptions3 = createOptions(dates, ['growth cases','growth deaths','growth recovered'], [confirmedChng.percentual,deathsChng.percentual,recoveredChng.percentual],[red,dark,green],'%');
    }

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
    
    const red = '#ed330e';
    const dark = '#262626';
    const green = '#5c9723';

    const graphoptions4 = createOptions(dates, ['cases','deaths','recovered'], [confirmed,deaths,recovered], [red,dark,green],'');
    const graphoptions5 = createOptions(dates, ['new cases','new deaths','new recovered'], [confirmedChng.relative,deathsChng.relative,recoveredChng.relative],[red,dark,green],'');
    const graphoptions6 = createOptions(dates, ['growth cases','growth deaths','growth recovered'], [confirmedChng.percentual,deathsChng.percentual,recoveredChng.percentual],[red,dark,green],'%');

    const ctx4 = document.getElementById('chart4').getContext('2d');
    const ctx5 = document.getElementById('chart5').getContext('2d');
    const ctx6 = document.getElementById('chart6').getContext('2d');
    
    window.bar4 = new Chart(ctx4, graphoptions4);
    window.bar5 = new Chart(ctx5, graphoptions5);
    window.bar6 = new Chart(ctx6, graphoptions6);
}