// Convert points to coords and viceversa
// https://stackoverflow.com/questions/25219346/how-to-convert-from-x-y-screen-coordinates-to-latlng-google-maps
export function latLng2Point(latLng, map) {
  const topRight = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  const bottomLeft = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  const scale = Math.pow(2, map.getZoom());
  const worldPoint = map.getProjection().fromLatLngToPoint(latLng);

  return new google.maps.Point(
    (worldPoint.x - bottomLeft.x) * scale,
    (worldPoint.y - topRight.y) * scale
  );
}

export function point2Coords(point, map) {
  const topRight = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  const bottomLeft = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  const scale = Math.pow(2, map.getZoom());
  const worldPoint = new google.maps.Point(
    point.x / scale + bottomLeft.x,
    point.y / scale + topRight.y
  );
  const fn = map.getProjection().fromPointToLatLng(worldPoint);

  return {
    lat: fn.lat(),
    lng: fn.lng()
  };
}
