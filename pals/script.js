let pos;
let map;
let bounds;
let service;
let geocoder;
let placeTable = document.getElementById('placeDetails')
async function getLoc() {
  let position = await codeAddress();
  let locValue = document.getElementById("places");
  document.getElementById("placeName").innerText = locValue.value;
  let radius = document.getElementById("radius");
  getNearbyPlaces(position, locValue.value, radius.value);
  placeTable.style.display = 'block'
  initialize();
}
function initialize() {
  geocoder = new google.maps.Geocoder();
  bounds = new google.maps.LatLngBounds();
  let latlng = new google.maps.LatLng(12.987606, 79.9719258);
  let mapOptions = {
    zoom: 16,
    center: latlng,
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}
// Find the position of the address
function codeAddress() {
  var address = document.getElementById("location").value;
  geocoder.geocode({ address: address }, function (results, status) {
    if (status == "OK") {
      pos = results[0].geometry.location;
      console.log(pos);
    }// else {
    //   alert("Geocode was not successful for the following reason: " + status);
    // }
  });
  return pos;
}
// Perform a Places Nearby Search Request
function getNearbyPlaces(position, place, withinRadius) {
  let request = {
    location: position,
    keyword: place,
    radius: withinRadius,
  };
  console.log(place + "GLOBAL");
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
  }
}
async function createMarkers(places) {
let displayInfo = []
  for(const place of places) {
    let placePos = place.geometry.location;

    let url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${placePos.lat()},${placePos.lng()}&language=en&key=58FC6URE`;
    let w3w = await fetch(url)
    //   .then(response => response.json())
    //   .then(data => data.words)
    //   .catch((err) =>
    //     console.error(
    //       "Something went wrong in the what3words fetch request: " + err
    //     )
    //   );
    let data = await w3w.json()
    displayInfo.push({name:place.name, w3w:data.words});
    let marker = new google.maps.Marker({
      position: placePos,
      map: map,
      title: place.name
    });
    bounds.extend(placePos);
    
  };

  map.fitBounds(bounds);
  tableData(displayInfo)
  console.log(displayInfo);
}
function remMarker(){
  if(marker && marker.setMap){
    marker.setMap(null);
  }
}

function tableData(tableInfo){
    const tableBody = document.getElementById('placeInfo')
    let dataHtml = ''
    tableInfo.forEach(info => {
        dataHtml += `<tr><td>${info.name}</td><td>${info.w3w}</td></tr>`
    });
    tableBody.innerHTML = dataHtml
}