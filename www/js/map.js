var Map = function(){

  $('body').append('<div id="map"></div>');
  this.map = L.map('map', {
    center: [37.7833, -122.4167],
    zoom: 12
  });

  // L.tileLayer('http://[abc].tile.cloudmade.com/3d86352279094c469637fd800ec9ad22/3/256/{z}/{x}/{y}.jpg  ', {
  L.tileLayer('http://otile3.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(this.map);

  this.map.locate({setView: true, maxZoom: 18});
};