import './styles.css';
import { createClient } from 'pexels'

function attachDataListListener() {

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
            console("Error fetching cities: ", error);
        }
    });
}

function getBackground() {
    const backgroundVideo = document.querySelector("#background-video");
    const client = createClient('');
    const query = 'Rainy day';
    client.videos.search({ query, per_page: 1, orientation: 'landscape' }).then(result => {
        const videoEntry = result.videos[0].video_files.find(video => video.width === 1920);
        backgroundVideo.querySelector("source").setAttribute("src", videoEntry.link);
        backgroundVideo.load();
    });
}



attachDataListListener();
getBackground();
//applyBackGroundImage();