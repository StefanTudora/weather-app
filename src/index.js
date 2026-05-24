import './styles.css';

function applyBackGroundImage() {
    const img = document.querySelector("#response");
    fetch('https://api.giphy.com/v1/gifs/translate?api_key=iRgp2JeFzqJVZMQ2rT4TGvneO149Ao2z&s=cats')
    .then(function(response) {
        return response.json();
    }).then(function(response) {
        img.src = response.data.images.original.url;
        console.log("Flying cat deployed");
    });
    console.log("Done");
}

function attachDataListListener() {

    const datalist = document.querySelector("datalist");
    document.querySelector("input").addEventListener('input', async(event) => {
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
                cityOption.value = `${geoCity.toponymName}, ${geoCity.adminName1}`;
                datalist.appendChild(cityOption);
            });
        } catch (error) {
            console("Error fetching cities: ", error);
        }
    });

}

attachDataListListener();
//applyBackGroundImage();