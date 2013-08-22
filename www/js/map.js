var Map = function(lat, lng){

  $('body').append('<div id="map"></div>');
  this.map = L.map('map', {
    center: [37.7833, -122.4167],
    zoom: 12
  });
  var mapProviders = [
    'http://b.tile.cloudmade.com/3d86352279094c469637fd800ec9ad22/3/256/{z}/{x}/{y}.jpg',
    'http://otile3.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    'http://b.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  ];
  L.tileLayer(mapProviders[1], {
    maxZoom: 18
  }).addTo(this.map);

  this.map.locate({setView: true, maxZoom: 18});
};