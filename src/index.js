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
    client.videos.search({ query, per_page: 1, orientation: 'landscape' }).then(result => {
        const videoEntry = result.videos[0].video_files.find(video => video.width === 1920);
        if (videoEntry !== undefined) {
            backgroundVideo.querySelector("source").setAttribute("src", videoEntry.link);
            backgroundVideo.load();
        }
    });
}

function attachVideoListener() {
    const video = document.querySelector("#background-video");
    const spinner = document.querySelector("#spinner");

    video.addEventListener('waiting', () => {
        spinner.style.display = 'block';
    });

    video.addEventListener('canplay', () => {
        spinner.style.display = 'nonen';
    });

    video.addEventListener('playing', () => {
        spinner.style.display = 'none';
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
    // const image = document.createElement('img');
    // document.querySelector("main > div:first-child").replaceChildren();
    // document.querySelector("main > div:first-child").appendChild(image);

    // Promise.all(
    //     Array.from({length: 8}).map(
    //         (_, idx) => import(`./assets/WeatherIcons/SVG/Color/${data.days[idx].icon}.svg`),
    //     ),
    // ).then((icons) => {
    //     image.setAttribute("src", icons[0].default);
    //     document.querySelector("main > div:first-child").appendChild(image);
    // });

    populateRestOfDays(data.days);
}

function populateRestOfDays(days) {
    const daysWeatherDiv = document.querySelector("main > div:last-child");
    daysWeatherDiv.replaceChildren();
    Promise.all(
        // import the next 7 days of weather icons
        days.slice(0, 7).map(
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
    // daytime
    weatherCard.innerHTML = `
        <div class="day-card">
            <h3>${format(day.datetime, 'EEEE')}</h3>
            <img src="${icon.default}">
            <p>Hello. there!</p>
        </div>
    `;
    return weatherCard;
}



attachInputTextListener();
getBackgroundForLocation("Montana");
attachVideoListener();
attachInputActionListener();