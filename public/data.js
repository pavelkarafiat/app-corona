
async function getData(domain) {
    let route = '';
    if(domain == 'confirmed'){route = '/confirmed'}
    else if(domain == 'deaths'){route = '/deaths'}
    else if(domain == 'recovered'){route = '/recovered'}
    const response = await fetch(route);
    const text = await response.text();
    return text;
}

async function getDataJson(){
    route = '/testscz';
    const response = await fetch(route);
    const json = await response.json();
    return json.data;
}


const rawConfirmed = getData('confirmed');
const rawDeaths = getData('deaths');
const rawRecovered = getData('recovered');
const rawTestcz = getDataJson();
//this is hardcoded to fit date series from CZ
const dateStart = "1/27/20";


async function getDatesIndex() {
    const data = await rawConfirmed;
    const rows = data.split('\n');
    const row = rows[0].split(',');
    const startIndex = row.indexOf(dateStart);
    return startIndex;
}

async function getDates() {
    const data = await rawConfirmed;
    const rows = data.split('\n');
    const row = rows[0].split(',');
    const dates = row.slice(await getDatesIndex());
    return dates;
}

async function getWorld(domain) {
    let data ='';
    if(domain == 'confirmed'){data = await rawConfirmed;}
    else if(domain == 'deaths'){data = await rawDeaths;}
    else if(domain == 'recovered'){data = await rawRecovered;}
    
    const dateStartInd = await getDatesIndex();
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(dateStartInd).length;
    let domainData = Array(totalDays).fill(0);

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').slice(dateStartInd);
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
    const dateStartInd = await getDatesIndex();
    const rows = data.split('\n');
    const totalDays = rows[0].split(',').slice(dateStartInd).length;

    for (let i = 1; i < rows.length; i++) {

        const cols = rows[i].split(',');
        let countryName = cols[1];
        let domainData = rows[i].split(',').slice(dateStartInd).map(val => parseInt(val));

        let notSetYet = true;
        countries.forEach(country => {
            if (country.name == countryName) {
                for (let j = 0; j < totalDays; j++) {
                    country.val[j] += domainData[j];
                }
                notSetYet = false;
            }
        })
        if (notSetYet) {
            countries.push({
                name: countryName,
                val: domainData
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
        res.abs = c[i].val[l - 1];
        res.rel = (c[i].val[l - 1]) - (c[i].val[l - 2]);
        
        const rel1 = res.rel;
        const rel2 = (c[i].val[l - 2]) - (c[i].val[l - 3]);
        const rel3 = (c[i].val[l - 3]) - (c[i].val[l - 4]);
        const rel4 = (c[i].val[l - 4]) - (c[i].val[l - 5]);
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

async function getTestscz(){
    let tests = [];
    let newtests = [];
    const data = await rawTestcz;
    data.forEach(el =>{
        tests.push(el['testy-celkem']);
        newtests.push(el['testy-den']);
    })
    return{tests,newtests}
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
    return obj.val;
}

async function getDeaths(country) {
    const c = await createCountries('deaths');
    const obj = c.find(o => o.name == country);
    return obj.val;
}

async function getRecovered(country) {
    const c = await createCountries('recovered');
    const obj = c.find(o => o.name == country);
    return obj.val;
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

async function getRatio(set1,set2){
    let ratio = [];
    for(let i =0; i<set1.length; i++){
        let el = 0;
        if (set1[i] !== 0){
            el = (set1[i]+0.01)/(set2[i]+0.01)*100;
        }
        ratio.push(el);
    }
    return ratio;
}

function ex(start, growth, days) {
    let result = start;
    for (i = 1; i < days; i++) {
        result = result * growth;
    }
    return result;
}

function doublingTime(growth){
    return 70/growth;
    //this very simple aprox formula is taken from here
    //https://en.wikipedia.org/wiki/Doubling_time
}



