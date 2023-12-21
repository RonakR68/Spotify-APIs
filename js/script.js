//Spotify API credentials
const clientId = '' //add your spotify API client Id here
const clientSecret = '' //add your spotify API client secret here

//Function to get an access token
async function getAccessToken(){
    const response = await fetch('https://accounts.spotify.com/api/token',{
        method: 'POST',
        headers:{
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    return data.access_token;
}

//Function to get new album releases
async function getNewReleases(country = ''){
    console.log("get new releases called");
    const accessToken = await getAccessToken();
    const apiUrl = `https://api.spotify.com/v1/browse/new-releases${country ? `?country=${country}` : ''}`;
    const response = await fetch(apiUrl, {
        headers:{
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    const data = await response.json();
    return data.albums.items;
}

//Function to get featured playlists
async function getFeaturedPlaylists(country = ''){
    console.log("get featured playlists called");
    const accessToken = await getAccessToken();
    const apiUrl = `https://api.spotify.com/v1/browse/featured-playlists${country ? `?country=${country}` : ''}`;
    const response = await fetch(apiUrl, {
        headers:{
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    const data = await response.json();
    return data.playlists.items;
}

//Function to update api result
function updateResult(result, isFeatured){
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = ''; // Clear old results
    if(result && result.length > 0){
        result.forEach(item => {
            const image = item.images[0].url;
            const name = item.name;
            let artists = '';
            //Check if it's a featured playlist
            if(isFeatured){
                artists = 'Featured Playlist';
            } 
            else{
                artists = item.artists.map(artist => artist.name).join(', ');
            }
            const releaseElement = document.createElement('div');
            releaseElement.className = 'release';
            
            //Create an anchor element with the Spotify URL
            const spotifyUrl = item.external_urls.spotify;
            const anchorElement = document.createElement('a');
            anchorElement.href = spotifyUrl;
            anchorElement.target = '_blank';
            anchorElement.rel = 'noopener noreferrer';

            // Create the image element and add it to the anchor
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.alt = name;
            anchorElement.appendChild(imgElement);

            // Create the title and artists elements
            const titleElement = document.createElement('h2');
            titleElement.textContent = name;
            const artistsElement = document.createElement('p');
            artistsElement.textContent = artists;

            // Append the anchor, title, and artists elements to the release element
            releaseElement.appendChild(anchorElement);
            releaseElement.appendChild(titleElement);
            releaseElement.appendChild(artistsElement);

            // Append the release element to the result container
            resultElement.appendChild(releaseElement);
        });
        resultElement.firstChild.style.marginTop = '20px';
    } 
    else{
        resultElement.innerHTML = 'No results found.';
    }
}

//Function to fetch and display data based on user selection
async function fetchData(){
    const apiSelect = document.getElementById('api-select');
    const selectedApi = apiSelect.value;
    const countrySelect = document.getElementById('country-select');
    const country = countrySelect ? countrySelect.value : '';
    let result;
    if (selectedApi === 'new-releases'){
        result = await getNewReleases(country);
        updateResult(result, false); //false to indicate it's not a featured playlist
    } 
    else if (selectedApi === 'featured-playlists'){
        result = await getFeaturedPlaylists(country);
        updateResult(result, true); //true to indicate it's a featured playlist
    }
}

// Function to handle the change in API selection
function handleApiChange(){
    const apiSelect = document.getElementById('api-select');
    const selectedApi = apiSelect.value;
    const optionalParamsDiv = document.getElementById('optional-params');
    // Clear previous optional parameters
    optionalParamsDiv.innerHTML = '';
    if(selectedApi === 'new-releases' || selectedApi === 'featured-playlists'){
        // Display optional country dropdown for both New Releases and Featured Playlists
        const countrySelect = document.createElement('select');
        countrySelect.id = 'country-select';
        countrySelect.innerHTML = `
            <option value="">Select country</option>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="AU">Australia</option>
            <option value="GB">United Kingdom</option>
            <option value="ES">Spain</option>
        `;
        countrySelect.style.marginTop = '20px';
        const fetchDataButton = document.createElement('button');
        fetchDataButton.id = 'fetch-button';
        fetchDataButton.textContent = 'Search';
        fetchDataButton.addEventListener('click', fetchData);
        const spacingElement = document.createElement('div');
        spacingElement.style.marginBottom = '20px'; 
        optionalParamsDiv.appendChild(countrySelect);
        optionalParamsDiv.appendChild(spacingElement);
        optionalParamsDiv.appendChild(fetchDataButton);
    }
}

//Initialize the API selection
handleApiChange();
