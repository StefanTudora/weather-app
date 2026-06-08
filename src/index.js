import './styles.css';
import { createClient } from 'pexels'
import { format } from 'date-fns'

function attachInputTextListener() {

    const datalist = document.querySelector("datalist");
    document.querySelector("input").addEventListener('input', async (event) => {
        const cityName = event.target.value.trim();
        if (cityName.length < 2) {
            return;
        }
        datalist.replaceChildren();
        try {
            const response = await fetch(`http://api.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(cityName)}&maxRows=10&featureClass=P&orderby=population&username=stefantudora`);
            const data = await response.json()
            data.geonames.forEach(geoCity => {
                const addable = `${geoCity.toponymName}, ${geoCity.adminName1}`;
                if (datalist.children.length !== 0 && Array.from(datalist.children).find(child => child.value === addable)) {
                    // Either no elements found, or the entry is already present
                    return;
                }
                const cityOption = document.createElement('option');
                cityOption.value = addable;
                datalist.appendChild(cityOption);
            });
        } catch (error) {
            console.log("Error fetching cities: ", error);
        }
    });
}

function getBackgroundForLocation(location) {
    const backgroundVideo = document.querySelector("#background-video");
    const client = createClient('v2t9tKiz4DQ2dUkjhksC2vtPTPY5xWMrYXNjdh3iZlB9xSmSulH8Pik3');
    const query = location;
    client.videos.search({ query, per_page: 1, orientation: 'landscape' })
        .then(result => {
            const videoEntry = result.videos[0].video_files.find(video => video.width === 1920);
            if (videoEntry !== undefined) {
                backgroundVideo.querySelector("source").setAttribute("src", videoEntry.link);
                backgroundVideo.load();
            }
        }).catch(error => {
            console.error("Error fetching background video:", error);
        });
}

function attachInputActionListener() {
    const searchBar = document.querySelector("#search-bar");
    const fetchData = (searchString) => {
        try {
            const entry = Array.from(searchBar.querySelectorAll("option")).find(option => option.value === searchString);
            if (entry !== undefined) {
                getWeatherForLocation(searchString);
                getBackgroundForLocation(searchString);
            }
        } catch (error) {
            console.log(`Location string invalid: ${error}`);
        }
    }
    searchBar.querySelector("input").addEventListener("keypress", (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        fetchData(event.target.value.trim());
    });
    searchBar.querySelector("button").addEventListener("click", () => {
        fetchData(searchBar.querySelector("input").value);
    });
}

async function getWeatherForLocation(location) {
    const query = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?
                        unitGroup=us
                        &include=days,alerts,hours
                        &key=9QJ4LRBP5H4GUE9VTUEE5PZZM
                        &contentType=json`;
    const requestString = query.replaceAll(/\s+/g, '').trim();
    const response = await fetch(requestString);
    const data = await response.json();
    renderCurrentDayData(data.days[0], data.address);
    renderAdditionalInfoCurrDay(data.days[0]);
    renderWeekdaysForecast(data.days.slice(1, 8));
}

function renderCurrentDayData(day, location) {
    const dayWeatherDiv = document.querySelector("main > div:first-child");
    // Use saved temperatures for every temperature conversion as to not make the result drift
    dayWeatherDiv.dataset.currtemp = day.temp;
    dayWeatherDiv.dataset.tempmax = day.tempmax;
    dayWeatherDiv.dataset.tempmin = day.tempmin;
    // Empty previous data
    dayWeatherDiv.replaceChildren();
    new Promise((resolve, reject) => {
        const img = import(`./assets/WeatherIcons/SVG/Color/${day.icon}.svg`);
        if (img !== undefined) {
            resolve(img);
        } else {
            reject("Couldn't find the image.");
        }
    }).then((icon) => {
        dayWeatherDiv.innerHTML = `
                <h3>${location}</h3>
                <p>${day.conditions}</p>
                <p>Currently <span class="curr-temp">${getConvertedTemp(day.temp)}<span></p>
                <p class="min-max">Max/Min: <span class="max-temp">${getConvertedTemp(dayWeatherDiv.dataset.tempmax)}</span>, <span class="min-temp">${getConvertedTemp(dayWeatherDiv.dataset.tempmin)}</span></p> 
                <img src="${icon.default}">
            `;
    }).catch((errorMsg) => {
        console.log(errorMsg);
    });
}

function renderWeekdaysForecast(days) {
    const daysWeatherDiv = document.querySelector("main > div:last-child");
    daysWeatherDiv.replaceChildren();
    Promise.all(
        days.map(
            day => import(`./assets/WeatherIcons/SVG/Color/${day.icon}.svg`)
        ),
    ).then((icons) => {
        icons.forEach((icon, idx) => {
            daysWeatherDiv.appendChild(getCard(days[idx], icon));
        });
    });
}

function getCard(day, icon) {
    const weatherCard = document.createElement("div");
    weatherCard.dataset.tempmax = day.tempmax;
    weatherCard.dataset.tempmin = day.tempmin;
    weatherCard.innerHTML = `
        <h3>${format(day.datetime, 'EEEE')}</h3>
        <img src="${icon.default}">
        <p>${day.conditions}</p>
        <p><span class="max-temp">${getConvertedTemp(weatherCard.dataset.tempmax)}</span>, <span class="min-temp">${getConvertedTemp(weatherCard.dataset.tempmin)}</span></p>
    `;
    weatherCard.setAttribute("class", "day-card");
    return weatherCard;
}

function getConvertedTemp(temperature) {
    const state = document.querySelector("#toggle").checked;
    var convertor = (value) => `${value} \u00B0F`;
    if (state) {
        convertor = (value) => `${((value - 32) / 1.8).toFixed(1)} \u00B0C`;
    }
    return convertor(temperature);
}

function attachTemperatureListener() {
    const tempToggleBtn = document.querySelector("#toggle");
    const getParent = (elem) => elem.closest('div');
    tempToggleBtn.addEventListener("click", () => {
        const mainTemp = document.querySelector(".curr-temp");
        mainTemp.textContent = getConvertedTemp(getParent(mainTemp).dataset.currtemp);

        const maxTempList = document.querySelectorAll(".max-temp");
        maxTempList.forEach(node => {
            node.textContent = getConvertedTemp(getParent(node).dataset.tempmax);
        });
        const minTempList = document.querySelectorAll(".min-temp");
        minTempList.forEach(node => {
            node.textContent = getConvertedTemp(getParent(node).dataset.tempmin);
        })
    });
}

function renderAdditionalInfoCurrDay(day) {
    const weatherCard = document.querySelector("main > div:nth-child(2)");
    weatherCard.replaceChildren();

    const weatherPropertiesMap = new Map([
        ['Humidity', `${day.humidity} <span style="font-size: 1.5rem;">%</span>`],
        ['Pressure', `${day.pressure} <span style="font-size: 1.5rem;">mmHg</span>`],
        ['Chance of Rain', `${day.precipprob} <span style="font-size: 1.5rem;">%</span>`],
        ['Wind Speed', `${day.windspeed} <span style="font-size: 1.5rem;">km/h</span>`]
    ]);

    for (const [key, value] of weatherPropertiesMap) {
        const propertyDiv = document.createElement("div");
        propertyDiv.innerHTML = `
            <h3>${key}</h3>
            <p>${value}</p>
        `;
        weatherCard.appendChild(propertyDiv);
    }
}


attachTemperatureListener();
attachInputTextListener();
getBackgroundForLocation("Florence, Tuscany");
getWeatherForLocation("Florence, Tuscany")
attachInputActionListener();