


const defaultCountry = 'Czechia';
let country = defaultCountry;
const countryHeader = document.getElementById('country');
countryHeader.textContent = ` ${country}`;


renderAll();


function renderAll(){
    renderOption();
    drawChart(country);
    drawChartWorld();
    renderInfoCountry(country);
    renderInfoWorld();
    renderSorting(15,'confirmed');
    sortingButtons();
    testsButtons();
}

async function renderInfoCountry(country,testscz){
    let c = await getConfirmed(country);
    let d = await getDeaths(country);
    let r = await getRecovered(country);
    let t = await getTestscz();
    
    t = t.tests[t.tests.length-1];
    c = c[c.length - 1];
    d = d[d.length - 1];
    r = r[r.length - 1];
    
    document.getElementById('infoCountryC').textContent = `${c} `;
    document.getElementById('infoCountryD').textContent = `${(d/c*100).toFixed(1)}% `;
    document.getElementById('infoCountryR').textContent = `${(r/c*100).toFixed(1)}% `;
    document.getElementById('infoCountryTests').textContent = `${t} `;
    document.getElementById('infoCountryRatio').textContent = `${(c/t*100).toFixed(1)}% `;

    document.querySelectorAll(".s-t").forEach(el=>el.style.display='none');
    document.querySelectorAll(".s-abs").forEach(el=>el.style.display='inline');
    if(testscz == true){
        document.querySelectorAll(".s-t").forEach(el=>el.style.display='inline');
        document.querySelectorAll(".s-abs").forEach(el=>el.style.display='none');
    }  

}

async function renderInfoWorld(){
    let c = await getWorld('confirmed');
    let d = await getWorld('deaths');
    let r = await getWorld('recovered');
    c = c[c.length - 2];
    d = d[d.length - 2];
    r = r[r.length - 2];
    document.getElementById('infoWorldC').textContent = `${c} `;
    document.getElementById('infoWorldD').textContent = `${(d/c*100).toFixed(1)}% `;
    document.getElementById('infoWorldR').textContent = `${(r/c*100).toFixed(1)}% `;
}

async function renderOption() {
    const countryOption = document.getElementById('countrySelect');
    let countries = await createCountries('confirmed');
    countries.sort(((a, b) => (a.name > b.name) ? 1 : -1));
    //show only countries with cases more than 500
    countries = countries.filter(el => {
        return (el.val[el.val.length-1] > 500);
    });
    countries.forEach(country => {
        const entry = document.createElement('option');
        entry.innerHTML = country.name;
        entry.value = country.name;
        countryOption.append(entry);
    });
    countryOption.addEventListener('change', (event) => {
        country = event.target.value;
        
        // menu for cz
        const czbtn = document.getElementById('czbuttons');
        if (country !== "Czechia"){
            czbtn.style.display = 'none';
        } else czbtn.style.display = 'block';

        countryHeader.textContent = ` ${country}`;
        renderInfoCountry(country);
        drawChart(country);
    });
}

async function renderSorting(entries,domain){
    
    let sortAbs, sortRel, sortPerc = '';
    let headline ='';
    const red = '#ed330e';
    const dark = '#262626';
    const green = '#5c9723';
    let col ='';

    if (domain == 'confirmed'){
        sortAbs = await getSorting('abs','confirmed');
        sortRel = await getSorting('rel','confirmed');
        sortPerc = await getSorting('perc','confirmed');
        headline = 'cases';
        col = red;
    }
    else if (domain == 'deaths'){
        sortAbs = await getSorting('abs','deaths');
        sortRel = await getSorting('rel','deaths');
        sortPerc = await getSorting('perc','deaths');
        headline = 'deaths';
        col = dark;
    }
    else if (domain == 'recovered'){
        sortAbs = await getSorting('abs','recovered');
        sortRel = await getSorting('rel','recovered');
        sortPerc = await getSorting('perc','recovered');
        headline = 'recovered';
        col = green;
    }
    
    const divAbs = document.getElementById('abs');
    const divRel = document.getElementById('rel');
    const divPerc = document.getElementById('perc');
    const barMax = 170;
    
    const headAbs = document.createElement('h2');
    headAbs.textContent=headline;
    divAbs.innerHTML='';
    divAbs.append(headAbs);
    headAbs.style.color = col;
    const headRel = document.createElement('h2');
    headRel.style.color = col;
    headRel.textContent=`new ${headline}`;
    divRel.innerHTML='';
    divRel.append(headRel);
    const headPerc = document.createElement('h2');
    headPerc.style.color = col;
    headPerc.textContent=`growth ${headline}`;
    divPerc.innerHTML='';
    divPerc.append(headPerc);
    

    for (let i = 0; i < entries; i++) {
        const entry = document.createElement('p');
        const name = sortAbs[i].name;
        const abs = sortAbs[i].abs;
        entry.textContent = `${i+1}. ${name}, ${abs}`;
        divAbs.append(entry);
        
        const quad = document.createElement('div');
        quad.setAttribute('class', 'quad');
        const remap = sortAbs[0].abs/barMax;
        quad.style.width = `${abs/remap}px`;
        divAbs.append(quad);
    };
    for (let i = 0; i < entries; i++) {
        const entry = document.createElement('p');
        const name = sortRel[i].name;
        const rel = sortRel[i].rel;
        entry.textContent = `${i+1}. ${name}, ${rel}`;
        divRel.append(entry);

        const quad = document.createElement('div');
        quad.setAttribute('class', 'quad');
        const remap = sortRel[0].rel/barMax;
        quad.style.width = `${rel/remap}px`;
        divRel.append(quad);
    };
    if (domain=='deaths'){entries = 10} ;
    for (let i = 0; i < entries; i++) {
        const entry = document.createElement('p');
        const name = sortPerc[i].name;
        const perc = sortPerc[i].perc;
        entry.textContent = `${i+1}. ${name}, ${perc.toFixed(0)}%`;
        divPerc.append(entry);

        const doubling = document.createElement('span');
        doubling.setAttribute('class', 'doubling');
        doubling.textContent = ` (doubled in ${doublingTime(perc).toFixed(0)} days)`;
        entry.appendChild(doubling);
    };
    const info = document.createElement('p');
    info.textContent = `*only countries with more than 500 cases, growth is average for last 4 days`;
    info.setAttribute('class', 'light');
    divPerc.append(info);
}

function sortingButtons(){
    document.getElementById('btnc').addEventListener('click',(evt)=>{
        renderSorting(15,'confirmed');
    });
    document.getElementById('btnd').addEventListener('click',(evt)=>{
        renderSorting(15,'deaths');
    });
    document.getElementById('btnr').addEventListener('click',(evt)=>{
        renderSorting(15,'recovered');
    });
}

function testsButtons(){
    document.getElementById('btnabs').addEventListener('click',(evt)=>{
        renderInfoCountry(country);
        drawChart(country);
    });
    document.getElementById('btntest').addEventListener('click',(evt)=>{
        renderInfoCountry(country,true);
        drawChart(country,true);
    });
}