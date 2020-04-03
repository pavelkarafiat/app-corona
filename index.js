
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;
//console.log(process.env);

app.listen(port, () => {console.log(`Starting server at ${port}`);});
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));



app.get('/confirmed', async (req, res) => {
  const confirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
  const response = await fetch(confirmed);
  const data = await response.text();
  res.send(data);
});

app.get('/deaths', async (req, res) => {
  const deaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
  const response = await fetch(deaths);
  const data = await response.text();
  res.send(data);
});

app.get('/recovered', async (req, res) => {
  const recovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
  const response = await fetch(recovered);
  const data = await response.text();
  res.send(data);
});