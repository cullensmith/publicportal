// Create constants for the filter items
const statetextbox = document.getElementById('statePicks');
const ctytextbox = document.getElementById('countyPicks');
const ctybuttonContainer = document.getElementById('county-container');
const statustextbox = document.getElementById('statusPicks');
const statusbuttonContainer = document.getElementById('status-container');
const typetextbox = document.getElementById('typePicks');
const typebuttonContainer = document.getElementById('type-container');
const cattextbox = document.getElementById('ftacatPicks');
const catbuttonContainer = document.getElementById('ftacat-container');


// Main portion centered around the map container
// Initialize Leaflet map
const divider = document.getElementById('dividerContainer');
const mapC = document.getElementById('map');
const bottomContainer = document.getElementById('bottomContainer');
let isDragging = false;


divider.addEventListener('mousedown', (e) => {
  isDragging = true;
  document.body.style.cursor = 'ns-resize';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const containerRect = document.getElementById('container').getBoundingClientRect();
  const offsetY = e.clientY - containerRect.top;

  const totalHeight = containerRect.height;
  const mapHeightPercentage = (offsetY / totalHeight) * 100;

  if (mapHeightPercentage >= 10 && mapHeightPercentage <= 90) {
    mapC.style.height = `${mapHeightPercentage}%`;
    bottomContainer.style.height = `${100 - mapHeightPercentage}%`;

    // resizes the map so that it covers the new container size
    map.invalidateSize();
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = 'default';
});


var map = L.map('map').setView([39.8283,-98.5795], 4);
var geojsonLayer;

map.createPane('wellTilesPane');
map.getPane('wellTilesPane').style.zIndex = 300;
var osmUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        osm = L.tileLayer(osmUrl, { maxZoom: 20, attribution: osmAttrib }).addTo(map),
        drawnItems = L.featureGroup().addTo(map);
var OpenStreetMap_Mapnik  = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});
// not free
// var OpenStreetMap_Mapnik = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
//     maxZoom: 19,
//     attribution: '&copy; Stadia Maps &copy; OpenStreetMap contributors'
// });
var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    // attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' 
});
var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    // attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' 
});
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
var controlbase = L.control.layers({'Light': osm, 'Dark' : CartoDB_DarkMatter, 'Street':OpenStreetMap_Mapnik, 'Satellite':sat, 'Terrain':Esri_WorldTopoMap, 'OpenTopo': OpenTopoMap}, {}, { position: 'bottomleft', collapsed: false }).addTo(map);

var geocoder = L.Control.Geocoder.nominatim();
if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    var params = new URLSearchParams(location.search);
    var geocoderString = params.get('geocoder');
    if (geocoderString && L.Control.Geocoder[geocoderString]) {
    // console.log('Using geocoder', geocoderString);
    geocoder = L.Control.Geocoder[geocoderString]();
    } else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString);
    }
}

var control = L.Control.geocoder({
    defaultMarkGeocode: false,
    collapsed: false,
    placeholder: 'Go to a location...',
    position:'topright',
    geocoder: geocoder
}).addTo(map);


// Store the marker object
var searchMarker = null;

// Custom transparent icon (1x1 pixel transparent PNG)
var transparentIcon = L.icon({
    iconUrl: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png',  // A 1x1 transparent PNG URL or your own image
    iconSize: [1, 1],  // Set size to 1x1 (or a very small size)
    iconAnchor: [0.5, 0.5],  // Anchor it at the center
    popupAnchor: [0, -16],  // Adjust popup position
});

// Overriding the default marker to make it transparent
control.on('markgeocode', function(event) {
    var latlng = event.geocode.center;
    var marker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'transparent-marker', // Use custom class for the marker
            iconSize: [0, 0]  // Set the size of the marker to 0 (invisible)
        })
    }).addTo(map);
    map.setView(latlng, 14);  // Center map on the result
});



var dots;

// Function to fetch GeoJSON data from a view
function getStates(data) {
    // var states = document.getElementById('statePicks').value;
    $.ajax({
        url: '/wells/getstates_view', // Replace with your view URL
        method: 'GET',
        data: {
            states: data,
        },
        success: function(data) {
            map.eachLayer(function(layer) {

                try {
                    if (layer._leaflet_id == stateLayer) {
                        map.removeLayer(layer);
                    } else {
                        // console.log('state layer id did not match') 
                    }
                    }
                    catch(err) {
                        // console.log('no such state layer exists'); 
                    }
                    
            }); 
            // Convert GeoJSON to vector tiles using leaflet-geojson-vt
            var geojsonStyle = {
                fillColor:"#FFFFFF",
                color: "#000",
                weight: 3,
                opacity: .6,
                fillOpacity: 0.000001,
                };
            
            var options = {
                maxZoom: 20,
                minZoom: 6,
                tolerance: 3,
                debug: 0,
                style: geojsonStyle,
                zIndex: 100,
            };
            canvasLayer_state = L.geoJSON(data, options).addTo(map);


            stateLayer=canvasLayer_state._leaflet_id
            try {
                statebounds = canvasLayer_state.getBounds();
                map.fitBounds(statebounds, {animate: false});
                map.on('moveend', function() {
                    // setCheckboxes();
                })
                
            } catch(err) {
                // console.log('no such layer exists just yet'); 
            } 

        },
        error: function(xhr, status, error) {
            // Handle error
            console.error(error);
        }
    });
}

var _countyPolygonCache = {};  // keyed by state string — polygons never change

// Function to fetch GeoJSON data from a view
function getCounties(s, c, well_type, well_status, category) {
    var states = getSelValues('statePicks')

    // County counts always need to reflect the current filter
    var countsRequest = $.ajax({
        url: '/wells/get_county_counts',
        method: 'GET',
        traditional: true,
        data: {
            states: states,
            county: c,
            well_type: well_type,
            well_status: well_status,
            category: category,
            search_field: refineParams.map(function(r) { return r.field; }),
            search_value: refineParams.map(function(r) { return r.value; }),
        },
    });

    // County polygons are static — cache after first fetch per state selection
    var polygonPromise;
    if (_countyPolygonCache[states]) {
        var d = $.Deferred();
        d.resolve(_countyPolygonCache[states]);
        polygonPromise = d.promise();
    } else {
        polygonPromise = $.ajax({
            url: '/wells/getcounties_view',
            method: 'GET',
            data: { states: states },
        }).then(function(data) {
            _countyPolygonCache[states] = data;
            return data;
        });
    }

    $.when(polygonPromise, countsRequest).done(function(polygonData, countsResult) {
        // polygonPromise resolves to the data directly; countsRequest resolves to [data, status, xhr]
        var countsData = Array.isArray(countsResult) ? countsResult[0] : countsResult;

        // Build tally from server-side aggregate counts
        var tally = {};
        countsData.forEach(function(item) {
            tally[item.stusps + '_' + (item.county || '').toLowerCase()] = item.count;
        });

        map.eachLayer(function(layer) {
            try {
                if (layer._leaflet_id == countyLayer) {
                    map.removeLayer(layer);
                }
            } catch(err) {}
        });

        var geojsonStyle = {
            fillColor: "#FFFFFF",
            color: "#000",
            weight: 1,
            opacity: .5,
            fillOpacity: 0.00001,
        };

        canvasLayer_cty = L.geoJSON(polygonData, {
            style: geojsonStyle,
            onEachFeature: function(feature, layer) {
                const county = feature.county;
                layer.on({
                    mouseover: function(e) {
                        var layer = e.target;
                        layer.bindTooltip(`<strong>County:</strong> ${county}`, {
                            permanent: false,
                            direction: 'top',
                            opacity: 0.8
                        }).openTooltip();
                    },
                    mouseout: function(e) {
                        e.target.closeTooltip();
                    }
                });
            }
        }).addTo(map);

        ctyct(polygonData, tally);
        countyLayer = canvasLayer_cty._leaflet_id;
        map.invalidateSize();

    }).fail(function() {
        console.error('Error loading county data');
    });
}



function addCtyOptions(states) {
    // var states = document.getElementById('statePicks').value;

    $.ajax({
        url: '/wells/createCountyList',
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            // create the "buttons" for each county for the dropdown
            let ctyitems = data;
            highlight = ctytextbox.innerHTML;
            ctybuttonContainer.innerHTML = '';
            var fragment = document.createDocumentFragment();
            ctyitems.forEach(ctyitem => {
                const ctybutton = document.createElement('button');
                ctybutton.id = ctyitem.stusps + ': ' + ctyitem.county + 'btn';
                if (highlight.includes(ctybutton.id.slice(0, -3))) {
                    ctybutton.className = 'highlightbutton';
                } else {
                    ctybutton.className = 'filterbutton';
                }
                ctybutton.innerText = ctyitem.stusps + ': ' + ctyitem.county;
                ctybutton.onclick = () => toggleselection('county', ctyitem.stusps + ': ' + ctyitem.county);
                fragment.appendChild(ctybutton);
            });
            ctybuttonContainer.appendChild(fragment);
        },
        error: function(xhr,status,error) {
            console.error(error);
        }
    })
};



function addStatus(states) {
    // var states = document.getElementById('statePicks').value;
    $.ajax({
        url: '/wells/createStatusList',
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            // create the "buttons" for each county for the dropdown
            let statusitems = JSON.parse(data);
            // console.log(statustextbox.innerHTML)
            highlight = statustextbox.innerHTML
            statusbuttonContainer.innerHTML = ''
            // Iterate through the statesarray array and create a button for each color
            statusitems.forEach(item => {
                const statusbutton = document.createElement('button');
                statusbutton.className = 'filterbutton';
                statusbutton.id = item.stusps + ': ' + item.well_status+'btn';
                // console.log(ctyitem.county)
                if (highlight.includes(statusbutton.id.slice(0,-3))) {
                    // console.log('found something to highlight')
                    statusbutton.className = 'highlightbutton';
                } else {
                    statusbutton.className = 'filterbutton';
                }
                statusbutton.innerText = item.stusps + ': ' + item.well_status; // Capitalize the first letter of color
                statusbutton.onclick = () => toggleselection('status',item.stusps + ': ' + item.well_status);
                // Append the button to the button-container div
                statusbuttonContainer.appendChild(statusbutton);
            });
        },
        error: function(xhr,status,error) {
            console.error(error);
        }
    })
};

function addType(states) {
    // var states = document.getElementById('statePicks').value;
    $.ajax({
        url: '/wells/createTypeList',
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            // create the "buttons" for each county for the dropdown
            let typeitems = JSON.parse(data);
            // console.log(typetextbox.innerHTML)
            highlight = typetextbox.innerHTML
            typebuttonContainer.innerHTML = ''
            // Iterate through the statesarray array and create a button for each color
            typeitems.forEach(item => {
                const typebutton = document.createElement('button');
                typebutton.className = 'filterbutton';
                typebutton.id = item.stusps + ': ' + item.well_type+'btn';
                // console.log(ctyitem.county)
                if (highlight.includes(typebutton.id.slice(0,-3))) {
                    // console.log('found something to highlight')
                    typebutton.className = 'highlightbutton';
                } else {
                    typebutton.className = 'filterbutton';
                }
                typebutton.innerText = item.stusps + ': ' + item.well_type; // Capitalize the first letter of color
                typebutton.onclick = () => toggleselection('type',item.stusps + ': ' + item.well_type);
                // Append the button to the button-container div
                typebuttonContainer.appendChild(typebutton);
            });
        },
        error: function(xhr,status,error) {
            console.error(error);
        }
    })
};



function getColor(stype) {
    switch (stype) {
        case 'Plugged':
        return  '#0287D4';
        case 'Injection / Storage / Service':
        return '#A3CF5F';
        case 'Production Well':
        return 'red';
        case 'Other / Unknown':
        return '#00253B';
        case 'Orphaned / Abandoned / Unverified Plug':
        return '#FFC857';
        case 'Not Drilled':
        return 'green';
        default:
        return '#FDFFFC';
    }
}

var geoJsonCtyLayer;
var geoJsonCtyLayerid;
var ctytally;
var ctytallyid;
let ctyids = [];
var layerNames;
var numicon;
// Create a GeoJSON layer to store all polygons with count > 0

var ctytallyLayer;
var markerIconCollection;
var vectorLayer = null;     // Leaflet.VectorGrid MVT tile layer
var _lastHoveredProps = null; // properties of the well the mouse is currently over
var currentFilters = {};
var refineParams = [];       // array of {field, value} pairs from the results-pane refine box
var tableMode = 'filter';   // 'filter' | 'circle'
var circleParams = {};
var currentTableTotal = 0;
var radiusCircle = null;    // L.Circle placed via radius input
var radiusMarker = null;    // draggable center marker for radiusCircle
// Compute the bounding-box center of a GeoJSON Polygon or MultiPolygon
// without creating a Leaflet layer.
function getGeoJSONCenter(geometry) {
    var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    function scanRing(ring) {
        ring.forEach(function(c) {
            if (c[0] < minLng) minLng = c[0];
            if (c[0] > maxLng) maxLng = c[0];
            if (c[1] < minLat) minLat = c[1];
            if (c[1] > maxLat) maxLat = c[1];
        });
    }
    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(scanRing);
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(function(poly) { poly.forEach(scanRing); });
    }
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
}

function ctyct(data, tally) {
    let minCount = Infinity;
    let maxCount = -Infinity;

    if (ctytallyLayer) {
        map.removeLayer(ctytallyLayer);
    };

    // Loop through each feature and check the tally count
    var filteredCtyCtGeoJSON = {
        "type": "FeatureCollection",
        "features": []
    };
    var markerFeatures = {
        "type": "FeatureCollection",
        "features": []
    };

    data.features.forEach(feature => {
        const statename = feature.statename;
        const county = feature.county;
        const geometry = feature.geometry;
        const tallyKey = `${statename}_${county.toLowerCase()}`;
        const count = tally[tallyKey] || 0;

        // Track the min and max counts to later adjust opacity proportionally
        if (count < minCount) minCount = count;
        if (count > maxCount) maxCount = count;

        if (count > 0) {
            filteredCtyCtGeoJSON.features.push(feature);

            const center = getGeoJSONCenter(geometry);

            markerFeatures.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [center.lng, center.lat]
                },
                "properties": {
                    "county": county,
                    "statename": statename,
                    "count": count
                }
            });
        }
    });

    // Function to calculate opacity based on count
    function calculateOpacity(count) {
        const normalized = (count - minCount) / (maxCount - minCount);
        return 0.1 + normalized * 0.8;  // Opacity will range from 0.1 to 0.9
    }

    // Create a GeoJSON layer for the filtered polygons
    ctytallyLayer = L.geoJSON(filteredCtyCtGeoJSON, {
        style: function(feature) {
            const county = feature.county;
            const statename = feature.statename;
            const count = tally[`${statename}_${county.toLowerCase()}`] || 0;
            const opacity = calculateOpacity(count); // Calculate opacity based on count

            return {
                fillColor: '#025687',
                color: '#025687',
                weight: 2,
                opacity: 1,
                fillOpacity: opacity // Set fill opacity based on count
            };
        },
        onEachFeature: function(feature, layer) {
            const county = feature.county;
            const statename = feature.statename;
            const count = tally[`${statename}_${county.toLowerCase()}`] || 0;
            // layer.bindPopup(`<strong>County:</strong> ${county}<br><strong>Count:</strong> ${count}`);
            // Add hover functionality to show county name in a tooltip
            layer.on({
                mouseover: function(e) {
                    var layer = e.target;
                    layer.bindTooltip(`<strong>County:</strong> ${county}<br><strong>Count:</strong> ${count}`, {
                        permanent: false,
                        direction: 'top',
                        opacity: 0.9
                    }).openTooltip();
                },
                mouseout: function(e) {
                    e.target.closeTooltip();
                }
            });
        }
    }).addTo(map);
    document.getElementById('countylayer').checked = true;
    document.getElementById('countychoropleth').checked = true;

    if (markerIconCollection) {
        map.removeLayer(markerIconCollection);
    } ;

    // Create GeoJSON layer for markers (with zoom level control)
    markerIconCollection = L.geoJSON(markerFeatures, {
        zIndex: 1,
        pointToLayer: function(feature, latlng) {
            const numberIcon = L.divIcon({
                className: 'number-icon',
                html: `<strong>${feature.properties.count}</strong>`,
                iconSize: [55, 30],
                iconAnchor: [27, 15],
            });
            return L.marker(latlng, { icon: numberIcon, zIndex: 1 });
        }
    });
    document.getElementById('countycount').checked = false;
}


// Show points only if zoom level is between 10 and 14
map.on('zoomend', function () {
    var currentZoom = map.getZoom();
    // console.log(currentZoom)
    if (currentZoom <= 6) {
        if (markerIconCollection) {
            markerIconCollection.remove();
            document.getElementById('countycount').checked = false;
        }
    } 
});


// Lazily fetch GeoJSON (needed for CSV download, sort, search).
// filteredData is cleared on every apply-filter so this re-fetches when stale.
function fetchFilteredData(callback) {
    if (filteredData) { callback(); return; }
    $.ajax({
        url: '/wells/generate_geojson',
        method: 'GET',
        data: {
            states:      currentFilters.states      || '',
            county:      currentFilters.county      || '',
            well_type:   currentFilters.well_type   || '',
            well_status: currentFilters.well_status || '',
            category:    currentFilters.category    || '',
        },
        success: function(data) {
            filteredData = JSON.parse(data);
            callback();
        },
        error: function() {
            console.error('Error fetching filtered data for export/sort.');
        }
    });
}

// Function to apply category filter
function applyCategoryFilter() {
    document.getElementById('filterpanel').classList.add('hide');
    document.getElementById('filterbtn').classList.remove('sel');
    document.getElementById('loadingpanel').classList.remove('hide');

    var states = getSelValues('statePicks').split(',').filter(function(v) { return v; }).join(',');
    var counties    = getSelValues('countyPicks');
    var well_status = getSelValues('statusPicks');
    var well_type   = getSelValues('typePicks');
    var category    = getSelValues('ftacatPicks');

    // Set filters immediately — no need to wait for GeoJSON
    currentFilters = { states: states, county: counties, well_type: well_type, well_status: well_status, category: category };
    refineParams = [];    // clear any previous text search when main filters change
    document.getElementById('sort-field2').value = '';
    document.getElementById('srch-input').value = '';
    document.getElementById('circle-radius-input').value = '';
    clearAllCircles();
    collapseExtraFilters();
    filteredData = null;  // will be fetched lazily on download/sort/search
    tableMode = 'filter';

    // Uncheck all point layer categories for the new query
    Object.values(_catCheckboxMap).forEach(function(id) {
        document.getElementById(id).checked = false;
    });

    // Fire all requests in parallel — nothing blocks on GeoJSON anymore
    loadTablePage(1);
    loadVectorTiles();
    getCounties(states, counties, well_type, well_status, category);
    getStates(states);

    document.getElementById('loadingpanel').classList.add('hide');
    document.getElementById('resultspanel').classList.remove('hide');
    map.invalidateSize();
    document.getElementById('resultsbtn').classList.add('sel');

    document.getElementById('legenditemid21').classList.remove('dim')
    document.getElementById('legenditemid11').classList.remove('dim')
    document.getElementById('category1').classList.remove('dim')
    document.getElementById('legenditemid22').classList.remove('dim')
    document.getElementById('legenditemid12').classList.remove('dim')
    document.getElementById('category2').classList.remove('dim')
    document.getElementById('legenditemid23').classList.remove('dim')
    document.getElementById('legenditemid13').classList.remove('dim')
    document.getElementById('category3').classList.remove('dim')
    document.getElementById('legenditemid24').classList.remove('dim')
    document.getElementById('legenditemid14').classList.remove('dim')
    document.getElementById('category4').classList.remove('dim')
    document.getElementById('legenditemid25').classList.remove('dim')
    document.getElementById('legenditemid15').classList.remove('dim')
    document.getElementById('category5').classList.remove('dim')
    document.getElementById('legenditemid26').classList.remove('dim')
    document.getElementById('legenditemid16').classList.remove('dim')
    document.getElementById('category6').classList.remove('dim')
    document.getElementById('legenditemid27').classList.remove('dim')
    document.getElementById('legenditemid17').classList.remove('dim')
    document.getElementById('countylayer').classList.remove('dim')
    document.getElementById('legenditemid28').classList.remove('dim')
    document.getElementById('legenditemid18').classList.remove('dim')
    document.getElementById('countycount').classList.remove('dim')
    document.getElementById('legenditemid29').classList.remove('dim')
    document.getElementById('legenditemid19').classList.remove('dim')
    document.getElementById('countychoropleth').classList.remove('dim')
}




function sortTable() {
    fetchFilteredData(function() {
        var field = document.getElementById('sort-field').value;
        var sdata = filteredData.features;
        var sortedData = [...sdata].sort(function(a, b) {
            var operatorA = a.properties[field] ? a.properties[field].toLowerCase() : '';
            var operatorB = b.properties[field] ? b.properties[field].toLowerCase() : '';
            if (operatorA < operatorB) return -1;
            if (operatorA > operatorB) return 1;
            return 0;
        });
        updateTable(sortedData);
    });
}


document.getElementById('sortbtn').addEventListener('click', function () {
    sortTable();
});

// function revert() {
//     updateTable(filteredData)
// }

function updateTable(features, totalCount) {
    console.log('UT')
    console.log(features)
    var tableBody = document.getElementById('maintablebody');
    var currentPage = 1;
    var rowsPerPage = 50;
    // console.log('features')
    // console.log(features)
    // Function to display rows based on current page

    var pgrecsMax;

    function maxrec(p) {
        // console.log('here is p')
        // console.log(p)
        pgrecsMax = p
        if ((((p-1)*50) + 50) > features.length) {
            pgrecsMax = features.length
        } else {
            // pgrecsMax = (((currentPage-1)*50) + 50)
            pgrecsMax = 5
        }
    };

    maxrec(currentPage)

    function displayRows(currentPage) {
        var startIndex = (currentPage - 1) * rowsPerPage;
        var endIndex = startIndex + rowsPerPage;
        var pageFeatures = features.slice(startIndex, endIndex);

        var pgrecsMax;

        function maxrec(p) {
            pgrecsMax = p
            if ((((p-1)*50) + 50) > features.length) {
                pgrecsMax = features.length
            } else {
                // pgrecsMax = (((currentPage-1)*50) + 50)
                pgrecsMax = (((p-1)*50) + 50)
            }
        };
    
        maxrec(currentPage)
    
        // maxrec(currentPage)
        const displayTotal = totalCount && totalCount > features.length ? totalCount : features.length;
        const cappedNote = totalCount && totalCount > features.length
            ? ' (showing ' + features.length.toLocaleString() + ' of ' + totalCount.toLocaleString() + ' total)'
            : '';
        document.getElementById('records').innerText = 'Records ' + (((currentPage-1)*50)+1) + ' - ' + pgrecsMax + ' of ' + displayTotal.toLocaleString() + cappedNote;


        // Clear existing rows in table body
        tableBody.innerHTML = '';

        // Append rows to table
        pageFeatures.forEach(function(feature) {
            var row = document.createElement('tr');

            // Loop through each property in feature to create cells
            for (var prop in feature.properties) {
                if (prop == 'id' || prop == 'wellwiki' || prop == 'ftuid') { continue; } 
                else {
                    var cell = document.createElement('td');
                    cell.textContent = feature.properties[prop]; // Display each property
                    row.appendChild(cell);
                }
            }

            tableBody.appendChild(row);
        });

        // Update pagination controls
        updatePaginationControls(currentPage);
    }

    // Initial display of rows
    displayRows(currentPage);

    // Function to update pagination controls
    function updatePaginationControls(currentPage) {
        var paginationCell = document.getElementById('pagination');
        paginationCell.innerHTML = ''; // Clear existing pagination buttons

        // Calculate total pages
        var totalPages = Math.ceil(features.length / rowsPerPage);

        // Show buttons for the first page, last page, previous page, current page, and next page
        var buttonsToShow = [];

        if (totalPages > 0) {
            // First page button
            if (currentPage > 1) {
                var firstButton = document.createElement('button');
                firstButton.textContent = "First";  // Set label as "First"
                firstButton.className = "pagebtn";
                firstButton.onclick = function() {
                    currentPage = 1;
                    displayRows(currentPage);
                };
                paginationCell.appendChild(firstButton);
            }

            // Previous page button
            if (currentPage > 1) {
                var prevButton = document.createElement('button');
                prevButton.textContent = "Previous";  // Set label as "Previous"
                prevButton.className = "pagebtn";
                prevButton.onclick = function() {
                    currentPage = currentPage - 1;
                    displayRows(currentPage);
                };
                paginationCell.appendChild(prevButton);
            }

            // Current page button
            var currentButton = document.createElement('button');
            currentButton.textContent = "Page: " + currentPage;
            currentButton.className = "pagebtn";
            currentButton.onclick = function() {
                currentPage = parseInt(currentPage);
                displayRows(currentPage);
            };
            paginationCell.appendChild(currentButton);

            // Next page button
            if (currentPage < totalPages) {
                var nextButton = document.createElement('button');
                nextButton.textContent = "Next";  // Set label as "Next"
                nextButton.className = "pagebtn";
                nextButton.onclick = function() {
                    currentPage = currentPage + 1;
                    displayRows(currentPage);
                };
                paginationCell.appendChild(nextButton);
            }

            // Last page button
            if (currentPage < totalPages) {
                var lastButton = document.createElement('button');
                lastButton.textContent = "Last";  // Set label as "Last"
                lastButton.className = "pagebtn";
                lastButton.onclick = function() {
                    currentPage = totalPages;
                    displayRows(currentPage);
                };
                paginationCell.appendChild(lastButton);
            }
        }
    }


    // Function to go to a specific page
    window.goToPage = function() {
        var pageNumber = document.getElementById('page-input').value;
        if (pageNumber && pageNumber >= 1 && pageNumber <= Math.ceil(features.length / rowsPerPage)) {
            currentPage = parseInt(pageNumber);
            displayRows(currentPage);
        } else {
            alert('Please enter a valid page number.');
        }
    };


}


function loadTablePage(page) {
    var params = Object.assign({}, currentFilters, { page: page });
    if (refineParams.length) {
        params.search_field = refineParams.map(function(r) { return r.field; });
        params.search_value = refineParams.map(function(r) { return r.value; });
    }
    var url = '/wells/get_table_page';
    if (tableMode === 'circle') {
        url = '/wells/get_records_in_circle';
        Object.assign(params, circleParams);
        params.visible_categories = Object.keys(_catCheckboxMap).filter(function(cat) {
            return document.getElementById(_catCheckboxMap[cat]).checked;
        }).join(',');
    }
    $.ajax({
        url: url,
        method: 'GET',
        traditional: true,
        data: params,
        success: function(data) {
            currentTableTotal = data.total_count;
            renderServerTablePage(data.features, page, data.total_pages, data.total_count);
        },
        error: function() {
            console.error('Error loading table page');
        }
    });
}

function renderServerTablePage(records, page, totalPages, totalCount) {
    var tableBody = document.getElementById('maintablebody');
    var startRec = ((page - 1) * 50) + 1;
    var endRec = (page - 1) * 50 + records.length;

    document.getElementById('records').innerText = 'Records ' + startRec.toLocaleString() + ' - ' + endRec.toLocaleString() + ' of ' + totalCount.toLocaleString();

    tableBody.innerHTML = '';
    records.forEach(function(record) {
        var row = document.createElement('tr');
        for (var prop in record) {
            if (prop === 'id' || prop === 'wellwiki' || prop === 'ftuid') { continue; }
            var cell = document.createElement('td');
            cell.textContent = record[prop] !== null ? record[prop] : '';
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    });

    var paginationCell = document.getElementById('pagination');
    paginationCell.innerHTML = '';
    if (totalPages > 0) {
        if (page > 1) {
            var firstButton = document.createElement('button');
            firstButton.textContent = 'First';
            firstButton.className = 'pagebtn';
            firstButton.onclick = function() { loadTablePage(1); };
            paginationCell.appendChild(firstButton);

            var prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.className = 'pagebtn';
            prevButton.onclick = function() { loadTablePage(page - 1); };
            paginationCell.appendChild(prevButton);
        }

        var currentButton = document.createElement('button');
        currentButton.textContent = 'Page: ' + page;
        currentButton.className = 'pagebtn';
        paginationCell.appendChild(currentButton);

        if (page < totalPages) {
            var nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.className = 'pagebtn';
            nextButton.onclick = function() { loadTablePage(page + 1); };
            paginationCell.appendChild(nextButton);

            var lastButton = document.createElement('button');
            lastButton.textContent = 'Last';
            lastButton.className = 'pagebtn';
            lastButton.onclick = function() { loadTablePage(totalPages); };
            paginationCell.appendChild(lastButton);
        }
    }

    window.goToPage = function() {
        var pageNumber = parseInt(document.getElementById('page-input').value);
        if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
            loadTablePage(pageNumber);
        } else {
            alert('Please enter a valid page number (1-' + totalPages + ').');
        }
    };

    map.invalidateSize();
}


// Function to download CSV of table data
function downloadTableData(data) {
    // If data not yet loaded, fetch it then retry
    if (!data) {
        fetchFilteredData(function() { downloadTableData(filteredData); });
        return;
    }

    function encodeForCSV(str) {
        if (/[,"\n#]/.test(str)) {
            return '"' + str.replace(/"/g, '""').replace(/#/g, '') + '"';
        }
        return str;
    }

    // Convert data to CSV format
    var csvContent = "data:text/csv;charset=utf-8,";
    var headers = Object.keys(data.features[0].properties);
    csvContent += headers.join(',') + '\n';

    // Convert each data item to CSV format
    data.features.forEach(function(dataItem) {
        // console.log(dataItem)
        var row = headers.map(function(header) {
            return encodeForCSV(dataItem.properties[header]);
        }).join(",");
        // console.log(row);
        csvContent += row + "\n";
    });

    // Create a Blob object with the CSV content
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fractracker_wells_download.csv");

    // Initiate download
    document.body.appendChild(link); // Required for Firefox
    link.click();

    // Remove the link element
    document.body.removeChild(link);
}
 


// function downloadTableData(filteredData) {
//     if (!filteredData || !filteredData.features || filteredData.features.length === 0) {
//         alert("No data to download.");
//         return;
//     } 
//     console.log('clicked the right spot')
//     // Store data globally for later access
//     window._csvFilteredData = filteredData;

//     // Show the modal
//     document.getElementById('emailModal').style.display = 'block';
// }

// document.getElementById('sendEmailBtn').addEventListener('click', function() {
//     const name = document.getElementById('userName').value.trim();
//     const email = document.getElementById('userEmail').value.trim();
//     const status = document.getElementById('emailStatus');
//     const data = window._csvFilteredData;

//     if (!name || !email) {
//         status.innerText = 'Please enter both name and email.';
//         return;
//     }

//     status.innerText = 'Sending...';

//     fetch('/wells/send-csv-email/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCSRFToken(),  // use your CSRF method
//         },
//         body: JSON.stringify({
//             name: name,
//             email: email,
//             data: data,
//         })
//     })
//     .then(res => res.json())
//     .then(response => {
//         if (response.success) {
//             status.innerText = 'Email sent successfully!';
//         } else {
//             status.innerText = 'Error: ' + (response.message || 'Something went wrong.');
//         }
//     })
//     .catch(err => {
//         console.error('Email error:', err);
//         status.innerText = 'An error occurred while sending the email.';
//     });
// });

// // Helper to get CSRF token from cookie
// function getCSRFToken() {
//     const name = 'csrftoken';
//     const cookieValue = document.cookie
//         .split('; ')
//         .find(row => row.startsWith(name + '='))
//         ?.split('=')[1];
//     return cookieValue;
// }


// Toggle legend content
document.getElementById('legend-toggle').addEventListener('click', function() {
    var content = document.querySelector('.legend-content');
    var icon = document.getElementById('legend-toggle');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        document.getElementById('legend_arrow').innerText = 'x';
    } else {
        content.style.display = 'none';
        document.getElementById('legend_arrow').innerText = '';
    }
});

const statesarray = [
    "Alabama", 
    "Alaska", 
    "Arizona", 
    "Arkansas", 
    "California", 
    "Colorado", 
    // "Connecticut", 
    // "Delaware", 
    "Florida", 
    // "Georgia", 
    // "Hawaii", 
    "Idaho", 
    "Illinois", 
    "Indiana", 
    "Iowa", 
    "Kansas", 
    "Kentucky", 
    "Louisiana", 
    // "Maine", 
    "Maryland", 
    // "Massachusetts", 
    "Michigan", 
    // "Minnesota", 
    "Mississippi", 
    "Missouri", 
    "Montana", 
    "Nebraska", 
    "Nevada", 
    // "New Hampshire", 
    // "New Jersey", 
    "New Mexico", 
    "New York", 
    // "North Carolina", 
    "North Dakota", 
    "Ohio", 
    "Oklahoma", 
    "Oregon", 
    "Pennsylvania", 
    // "Rhode Island", 
    // "South Carolina", 
    "South Dakota", 
    "Tennessee", 
    "Texas", 
    "Utah", 
    // "Vermont", 
    "Virginia", 
    "Washington", 
    "West Virginia",
    // "Wisconsin", 
    "Wyoming"
    ];

// Iterate through the statesarray array and create a button for each st
statesarray.forEach(st => {
    const sbutton = document.createElement('button');

    sbutton.className = 'filterbutton';
    sbutton.id = st+'btn';
    sbutton.innerText = st.charAt(0).toUpperCase() + st.slice(1); // Capitalize the first letter of color
    sbutton.onclick = () => toggleselection('state',st);
    // Append the button to the button-container div
    document.getElementById('state-container').style.setProperty("font-family", "Arial, sans-serif", "important");

    document.getElementById('state-container').appendChild(sbutton);
    
});

const ftacats = ['Injection / Storage / Service', 'Not Drilled','Orphaned / Abandoned / Unverified','Other / Unknown','Plugged','Production Well']

ftacats.forEach(st => {
    const fbutton = document.createElement('button');
    fbutton.className = 'filterbutton';
    fbutton.id = st+'btn';
    fbutton.innerText = st.charAt(0).toUpperCase() + st.slice(1); // Capitalize the first letter of color
    fbutton.onclick = () => toggleselection('ftacat',st);
    // Append the button to the button-container div
    document.getElementById('ftacat-container').appendChild(fbutton);
});

function getButtonValues() {
    // Select all buttons inside the container
    const buttonchk = document.getElementById('statePicks').querySelectorAll('*');
    starray = ''
    // Loop through the buttons and log their values
    buttonchk.forEach(b => {
    //   console.log(b.id);
      starray+=b.id.slice(6)+','
    });
    return starray
  }

function getSelValues(s) {
    // Select all buttons inside the container
    const buttonchk = document.getElementById(s).querySelectorAll('*');
    starray = ''
    // Loop through the buttons and log their values
    buttonchk.forEach(b => {
    //   console.log(b.id);
      starray+=b.id.slice(6)+','
    });
    return starray
}


function openlist(bo) {
    // console.log(bo)
    statelist = getButtonValues()
    // console.log(document.getElementById(bo+'-container').value)
    if (bo==="county" && statelist != null) {
        // console.log(statelist),
        addCtyOptions(statelist)
    } else if (bo === "wellstatus" && statelist != null) {
        addStatus(statelist)
    } else if (bo === "welltype" && statelist != null) {
        addType(statelist)
    }
    
};

stcontainer = document.getElementById('state-container')
stbutton = document.getElementById('statebutton')

// Show dropdown when button is clicked
stbutton.addEventListener('click', () => {
    if (stcontainer.style.display === 'none' || stcontainer.style.display === '' ) {
        stcontainer.style.display = 'block';
    } else if (stcontainer.style.display = 'block') {
        stcontainer.style.display = 'none';
    }
});

// Close dropdown if cursor leaves the button or the dropdown container
stcontainer.addEventListener('mouseleave', () => {
    stcontainer.style.display = 'none';
});

// Prevent dropdown from closing if cursor is inside the dropdown content
stcontainer.addEventListener('mouseenter', () => {
    stcontainer.style.display = 'block';
});

// Keep dropdown open if the cursor is inside the button or dropdown
stbutton.addEventListener('mouseleave', () => {
    stcontainer.style.display = 'none';
});




ctycontainer = document.getElementById('county-container')
ctybutton = document.getElementById('countybutton')

// Show dropdown when button is clicked
ctybutton.addEventListener('click', () => {
    if (ctycontainer.style.display === 'none' || ctycontainer.style.display === '' ) {
        if (statetextbox.innerHTML != '' && statetextbox.innerHTML != '**REQUIRED**') {
            ctycontainer.style.display = 'block';
        } else {
            ctycontainer.style.display = 'none';
        }
    } else if (ctycontainer.style.display = 'block') {
        ctycontainer.style.display = 'none';
    }
});

// Close dropdown if cursor leaves the button or the dropdown container
ctycontainer.addEventListener('mouseleave', () => {
    ctycontainer.style.display = 'none';
});

// Prevent dropdown from closing if cursor is inside the dropdown content
ctycontainer.addEventListener('mouseenter', () => {
    ctycontainer.style.display = 'block';
});

// Keep dropdown open if the cursor is inside the button or dropdown
ctybutton.addEventListener('mouseleave', () => {
    ctycontainer.style.display = 'none';
});


statuscontainer = document.getElementById('status-container')
statusbutton = document.getElementById('statusbutton')

// Show dropdown when button is clicked
statusbutton.addEventListener('click', () => {
    if (statuscontainer.style.display === 'none' || statuscontainer.style.display === '' ) {
        if (statetextbox.innerHTML != '' && statetextbox.innerHTML != '**REQUIRED**') {
            statuscontainer.style.display = 'block';
        } else {
            statuscontainer.style.display = 'none';
        }
    } else if (statuscontainer.style.display = 'block') {
        statuscontainer.style.display = 'none';
    }
});

// Close dropdown if cursor leaves the button or the dropdown container
statuscontainer.addEventListener('mouseleave', () => {
    statuscontainer.style.display = 'none';
});

// Prevent dropdown from closing if cursor is inside the dropdown content
statuscontainer.addEventListener('mouseenter', () => {
    statuscontainer.style.display = 'block';
});

// Keep dropdown open if the cursor is inside the button or dropdown
statusbutton.addEventListener('mouseleave', () => {
    statuscontainer.style.display = 'none';
});

typecontainer = document.getElementById('type-container')
typebutton = document.getElementById('typebutton')

// Show dropdown when button is clicked
typebutton.addEventListener('click', () => {
    if (typecontainer.style.display === 'none' || typecontainer.style.display === '' ) {
        if (statetextbox.innerHTML != '' && statetextbox.innerHTML != '**REQUIRED**') {
            typecontainer.style.display = 'block';
        } else {
            typecontainer.style.display = 'none';
        }
    } else if (typecontainer.style.display = 'block') {
        typecontainer.style.display = 'none';
    }
});

// Close dropdown if cursor leaves the button or the dropdown container
typecontainer.addEventListener('mouseleave', () => {
    typecontainer.style.display = 'none';
});

// Prevent dropdown from closing if cursor is inside the dropdown content
typecontainer.addEventListener('mouseenter', () => {
    typecontainer.style.display = 'block';
});

// Keep dropdown open if the cursor is inside the button or dropdown
typebutton.addEventListener('mouseleave', () => {
    typecontainer.style.display = 'none';
});



fcontainer = document.getElementById('ftacat-container')
fbutton = document.getElementById('ftacatbutton')

// Show dropdown when button is clicked
fbutton.addEventListener('click', () => {
    if (fcontainer.style.display === 'none' || fcontainer.style.display === '' ) {
        fcontainer.style.display = 'block';
    } else if (fcontainer.style.display = 'block') {
        fcontainer.style.display = 'none';
    }
});

// Close dropdown if cursor leaves the button or the dropdown container
fcontainer.addEventListener('mouseleave', () => {
    fcontainer.style.display = 'none';
});

// Prevent dropdown from closing if cursor is inside the dropdown content
fcontainer.addEventListener('mouseenter', () => {
    fcontainer.style.display = 'block';
});

// Keep dropdown open if the cursor is inside the button or dropdown
fbutton.addEventListener('mouseleave', () => {
    fcontainer.style.display = 'none';
});





function toggleselection(c,v) {
    var earray = statetextbox.querySelectorAll("*");
    var ecount = earray.length;

    if (document.getElementById('input-'+v) != null) {
        if (c==='state') {
            document.getElementById(v+'btn').classList = 'filterbutton'
        } else if (c==='county') {
            document.getElementById(v+'btn').classList = 'filterbutton'
        } else if (c==='status') {
            document.getElementById(v+'btn').classList = 'filterbutton'
        } else if (c==='type') {
            document.getElementById(v+'btn').classList = 'filterbutton'
        } else if (c==='ftacat') {
            document.getElementById(v+'btn').classList = 'filterbutton'
        };
        document.getElementById('input-'+v).remove();
        if (statetextbox.innerHTML === '') {
            statetextbox.innerHTML = '**REQUIRED**';
            document.getElementById('countybutton').classList.remove('notyet')
            document.getElementById('statusbutton').classList.remove('notyet')
            document.getElementById('typebutton').classList.remove('notyet')
            document.getElementById('ftacatbutton').classList.remove('notyet')
        };
    } else if (ecount>6 && c ==='state') {
        alert("You've selected the max number of states per search.");
    } else {
        if (c === 'state') {
            document.getElementById(v+'btn').classList = 'highlightbutton'
        } else if (c === 'county') {
            document.getElementById(v+'btn').classList = 'highlightbutton'
        } else if (c === 'status') {
            document.getElementById(v+'btn').classList = 'highlightbutton'
        } else if (c === 'type') {
            document.getElementById(v+'btn').classList = 'highlightbutton'
        } else if (c === 'ftacat') {
            document.getElementById(v+'btn').classList = 'highlightbutton'
        }
        var buttonState = document.createElement('button-state');
        buttonState.classList.add('selbutton');
        buttonState.onclick = function() {
            document.getElementById(buttonState.id.slice(6) + 'btn').classList = 'filterbutton';
            buttonState.remove();
            if (statetextbox.innerHTML === '') {
                statetextbox.innerHTML = '**REQUIRED**';
                document.getElementById('countybutton').classList.add('notyet')
                document.getElementById('statusbutton').classList.remove('notyet')
                document.getElementById('typebutton').classList.remove('notyet')
                document.getElementById('ftacatbutton').classList.remove('notyet')
    
            }else if (ctytextbox.innerHTML==='') {
                ctytextbox.innerHTML='You can limit your results to those within a specific county by clicking the corresponding button below.'
            } else if (statustextbox.innerHTML==='') {
                statustextbox.innerHTML='Status varies from state to state, take a look at the reference below.'
            } else if (typetextbox.innerHTML==='') {
                typetextbox.innerHTML='Type varies from state to state, take a look at the reference below.'
            } else if (cattextbox.innerHTML==='') {
                cattextbox.innerHTML='Our attempt to normalize the varying classifications across the country. '
            } ;
        };
        
        // Create a span for the original text
        const textSpan = document.createElement('span');
        if (c === 'state') {
            if (v === "Alabama") {
                textSpan.textContent = 'AL'
            } else if (v === "Arizona") {
                textSpan.textContent = 'AZ';  // Set the text inside the span
            } else if (v === "Arkansas") {
                textSpan.textContent = 'AR';  // Set the text inside the span
            } else if (v === "California") {
                textSpan.textContent = 'CA';  // Set the text inside the span
            } else if (v === "Colorado") {
                textSpan.textContent = 'CO';  // Set the text inside the span
            } else if (v === "Florida") {
                textSpan.textContent = 'FL';  // Set the text inside the span
            } else if (v === "Idaho") {
                textSpan.textContent = 'ID';  // Set the text inside the span
            } else if (v === "Illinois") {
                textSpan.textContent = 'IL';  // Set the text inside the span
            } else if (v === "Indiana") {
                textSpan.textContent = 'IN';  // Set the text inside the span
            } else if (v === "Iowa") {
                textSpan.textContent = 'IA';  // Set the text inside the span
            } else if (v === "Kansas") {
                textSpan.textContent = 'KS';  // Set the text inside the span
            } else if (v === "Kentucky") {
                textSpan.textContent = 'KY';  // Set the text inside the span
            } else if (v === "Louisiana") {
                textSpan.textContent = 'LA';  // Set the text inside the span
            } else if (v === "Maryland") {
                textSpan.textContent = 'MD';  // Set the text inside the span
            } else if (v === "Michigan") {
                textSpan.textContent = 'MI';  // Set the text inside the span
            } else if (v === "Mississippi") {
                textSpan.textContent = 'MS';  // Set the text inside the span
            } else if (v === "Missouri") {
                textSpan.textContent = 'MO';  // Set the text inside the span
            } else if (v === "Montana") {
                textSpan.textContent = 'MT';  // Set the text inside the span
            } else if (v === "Nebraska") {
                textSpan.textContent = 'NE';  // Set the text inside the span
            } else if (v === "Nevada") {
                textSpan.textContent = 'NV';  // Set the text inside the span
            } else if (v === "New Mexico") {
                textSpan.textContent = 'NM';  // Set the text inside the span
            } else if (v === "New York") {
                textSpan.textContent = 'NY';  // Set the text inside the span
            } else if (v === "North Dakota") {
                textSpan.textContent = 'ND';  // Set the text inside the span
            } else if (v === "Ohio") {
                textSpan.textContent = 'OH';  // Set the text inside the span
            } else if (v === "Oklahoma") {
                textSpan.textContent = 'OK';  // Set the text inside the span
            } else if (v === "Oregon") {
                textSpan.textContent = 'OR';  // Set the text inside the span
            } else if (v === "Pennsylvania") {
                textSpan.textContent = 'PA';  // Set the text inside the span
            } else if (v === "South Dakota") {
                textSpan.textContent = 'SD';  // Set the text inside the span
            } else if (v === "Tennessee") {
                textSpan.textContent = 'TN';  // Set the text inside the span
            } else if (v === "Texas") {
                textSpan.textContent = 'TX';  // Set the text inside the span
            } else if (v === "Utah") {
                textSpan.textContent = 'UT';  // Set the text inside the span
            } else if (v === "Virginia") {
                textSpan.textContent = 'VA';  // Set the text inside the span
            } else if (v === "Washington") {
                textSpan.textContent = 'WA';  // Set the text inside the span
            } else if (v === "West Virginia") {
                textSpan.textContent = 'WV';  // Set the text inside the span
            } else if (v === "Wyoming") {
                textSpan.textContent = 'WY';  // Set the text inside the span
            }
            
        } else {
            textSpan.textContent = v;  // Set the text inside the span
        };
        // Create a span for the 'X' that will appear on hover
        const closeSpan = document.createElement('span');
        closeSpan.textContent = ' X';
        closeSpan.style.display = 'none';  // Hide 'X' initially
        closeSpan.style.color = "red";

        // Append the spans inside the button
        buttonState.appendChild(textSpan);
        buttonState.appendChild(closeSpan);



        // Add hover effect to display 'X'
        buttonState.addEventListener('mouseenter', () => {
            closeSpan.style.display = 'inline';  // Show the 'X' when hovered
        });

        buttonState.addEventListener('mouseleave', () => {
            closeSpan.style.display = 'none';  // Hide the 'X' when not hovered
        });

        // buttonState.textContent = v;
        buttonState.id = "input-" + v;
        buttonState.style.fontWeight = 'bold';


        // Append the new button to the input box (which is now an input field)
        if (statetextbox.innerHTML==='**REQUIRED**' && c==='state') {
            statetextbox.innerHTML='';
            document.getElementById('countybutton').classList.remove('notyet')
            document.getElementById('statusbutton').classList.remove('notyet')
            document.getElementById('typebutton').classList.remove('notyet')
            document.getElementById('ftacatbutton').classList.remove('notyet')

        } else if (c==='county' && ctytextbox.innerHTML==='You can limit your results to those within a specific county by clicking the corresponding button below.') {
            ctytextbox.innerHTML=''
        } else if (c==='status' && statustextbox.innerHTML==='Status varies from state to state, take a look at the reference below.') {
            statustextbox.innerHTML=''
        } else if (c==='type' && typetextbox.innerHTML==='Type varies from state to state, take a look at the reference below.') {
            typetextbox.innerHTML=''
        } else if (c==='ftacat' && cattextbox.innerHTML==='Our attempt to normalize the varying classifications across the country. ') {
            cattextbox.innerHTML=''
        } ;
        
        if (c === 'state') {
            statetextbox.appendChild(buttonState);

        } else if (c === 'county') {
            // console.log(ctytextbox.innerHTML.slice(5))
            if (ctytextbox.innerHTML.slice(0,5) === 'Not n'){
                ctytextbox.innerHTML = ''
            }
            ctytextbox.appendChild(buttonState);
        } else if (c === 'status') {
            statustextbox.appendChild(buttonState);
        } else if (c === 'type') {
            typetextbox.appendChild(buttonState);
        } else if (c === 'ftacat') {
            cattextbox.appendChild(buttonState);
        }
    }
}







var productionwells;
var pluggedwells;
var otherwells;
var orphanwells;
var notdrilledwells;
var injectionwells;

var filtproductionwells;
var filtpluggedwells;
var filtotherwells;
var filtorphanwells;
var filtnotdrilledwells;
var filtinjectionwells;




var _catCheckboxMap = {
    'Production Well':                   'category6',
    'Plugged':                           'category5',
    'Other / Unknown':                   'category4',
    'Orphaned / Abandoned / Unverified Plug': 'category3',
    'Not Drilled':                       'category2',
    'Injection / Storage / Service':     'category1',
};

function loadVectorTiles() {
    if (vectorLayer) { map.removeLayer(vectorLayer); vectorLayer = null; }
    if (!currentFilters.states) {
        document.getElementById('showAllWellsBtn').style.display = 'none';
        return;
    }
    document.getElementById('showAllWellsBtn').style.display = '';

    var _tp = new URLSearchParams({
        states:      currentFilters.states      || '',
        county:      currentFilters.county      || '',
        well_type:   currentFilters.well_type   || '',
        well_status: currentFilters.well_status || '',
        category:    currentFilters.category    || '',
    });
    refineParams.forEach(function(r) { _tp.append('search_field', r.field); _tp.append('search_value', r.value); });
    var params = _tp.toString();

    vectorLayer = L.vectorGrid.protobuf('/wells/tiles/{z}/{x}/{y}?' + params, {
        vectorTileLayerStyles: {
            'wells': function(properties) {
                var cbId = _catCheckboxMap[properties.ft_category];
                if (!cbId || !document.getElementById(cbId).checked) {
                    return { fill: false, stroke: false, opacity: 0, fillOpacity: 0, radius: 0, interactive: false };
                }
                return { weight: 0, fillColor: getColor(properties.ft_category), fillOpacity: 0.8, fill: true, radius: 3, interactive: true };
            }
        },
        rendererFactory: L.canvas.tile,
        pane: 'wellTilesPane',
        interactive: true,
        maxZoom: 20,
        minZoom: 6,
    });
    if (map.getZoom() >= 6) { vectorLayer.addTo(map); }
}

function filterProd(data) {
    fd = JSON.parse(data);
    // console.log(fd)

    document.getElementById('category6').checked = false;
    document.getElementById('category5').checked = false;
    document.getElementById('category4').checked = false;
    document.getElementById('category3').checked = false;
    document.getElementById('category2').checked = false;
    document.getElementById('category1').checked = false;


    if (productionwells) {
        map.removeLayer(productionwells);
    } ;
    productionwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Production Well';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }

    });

    if (pluggedwells) {
        map.removeLayer(pluggedwells);
    } ;
    pluggedwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Plugged';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }
    });

    if (otherwells) {
        map.removeLayer(otherwells);
    } ;
    otherwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Other / Unknown';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }
    });

    if (orphanwells) {
        map.removeLayer(orphanwells);
    } ;
    orphanwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Orphaned / Abandoned / Unverified Plug';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }
    });

    if (notdrilledwells) {
        map.removeLayer(notdrilledwells);
    } ;
    notdrilledwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Not Drilled';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }
    });

    if (injectionwells) {
        map.removeLayer(injectionwells);
    } ;
    injectionwells = L.geoJSON(fd, {
        filter: function (feature) {
            return feature.properties.ft_category === 'Injection / Storage / Service';
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                color: getColor(feature.properties.ft_category),
                fillColor: getColor(feature.properties.ft_category),
                zIndex: 10000,
                radius: 1, // Radius // Fill opacity of the circle
            });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to each circle marker based on the properties in the GeoJSON data

            layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                feature.properties.ft_category + "<br><b>State: </b>" + 
                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                feature.properties.well_name + "<br><b>Operator: </b>" + 
                feature.properties.operator + "<br><b>Longitude:</b> " + 
                feature.properties.longitude + "<br><b>Latitude: </b>" + feature.properties.latitude
            );
        }
    });
    // map.addLayer(productionwells)
}
// Toggle category visibility in the vector tile layer
['category1','category2','category3','category4','category5','category6'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', function() {
        if (vectorLayer) { loadVectorTiles(); }
    });
});

// Toggle polygons visibility based on checkbox
document.getElementById('countylayer').addEventListener('change', function() {
    if (this.checked && canvasLayer_cty) {
        canvasLayer_cty.addTo(map);
    } else if (canvasLayer_cty) {
        map.removeLayer(canvasLayer_cty);
    }
});


var _catIds = ['category1','category2','category3','category4','category5','category6'];

function updateWellsToggleBtn() {
    var allChecked = _catIds.every(function(id) { return document.getElementById(id).checked; });
    document.getElementById('showAllWellsBtn').textContent = allChecked ? 'Hide All' : 'Show All';
}

document.getElementById('showAllWellsBtn').addEventListener('click', function() {
    var allChecked = _catIds.every(function(id) { return document.getElementById(id).checked; });
    if (allChecked) {
        _catIds.forEach(function(id) { document.getElementById(id).checked = false; });
    } else {
        _catIds.forEach(function(id) { document.getElementById(id).checked = true; });
        var choropleth = document.getElementById('countychoropleth');
        if (choropleth.checked) {
            choropleth.checked = false;
            if (ctytallyLayer) { map.removeLayer(ctytallyLayer); }
        }
    }
    if (vectorLayer) { loadVectorTiles(); }
    updateWellsToggleBtn();
});

_catIds.forEach(function(id) {
    document.getElementById(id).addEventListener('change', updateWellsToggleBtn);
});

// Toggle polygons visibility based on checkbox
document.getElementById('countychoropleth').addEventListener('click', function() {
    if (this.checked) {
        ctytallyLayer.addTo(map);
    } else if (ctytallyLayer) {
        map.removeLayer(ctytallyLayer);
    }
});
// Toggle polygons visibility based on checkbox
document.getElementById('countycount').addEventListener('click', function() {
    if (this.checked) {
        markerIconCollection.addTo(map);
    } else if (markerIconCollection) {
        map.removeLayer(markerIconCollection);
    }
});


// Show/hide the vector tile layer based on zoom level
function togglePointLayerByZoom() {
    if (!vectorLayer) return;
    var z = map.getZoom();
    if (z >= 6 && z <= 20) {
        if (!map.hasLayer(vectorLayer)) { vectorLayer.addTo(map); }
    } else {
        if (map.hasLayer(vectorLayer)) { map.removeLayer(vectorLayer); }
    }
}

// Call togglePointLayerByZoom every time the map zooms
map.on('zoomend', togglePointLayerByZoom);

// On map click, query the nearest well in the DB and show a popup
map.on('click', function(e) {
    if (!vectorLayer || !map.hasLayer(vectorLayer)) return;

    // Tolerance in degrees ≈ 8 pixels at the current zoom
    var zoom = map.getZoom();
    var tolerance = 8 * (360 / (256 * Math.pow(2, zoom)));

    var visibleCategories = Object.keys(_catCheckboxMap).filter(function(cat) {
        return document.getElementById(_catCheckboxMap[cat]).checked;
    }).join(',');

    var params = new URLSearchParams({
        lat:                e.latlng.lat,
        lng:                e.latlng.lng,
        tolerance:          tolerance,
        states:             currentFilters.states      || '',
        county:             currentFilters.county      || '',
        well_type:          currentFilters.well_type   || '',
        well_status:        currentFilters.well_status || '',
        category:           currentFilters.category    || '',
        visible_categories: visibleCategories,
    }).toString();

    $.get('/wells/nearest_well?' + params, function(data) {
        if (!data.api_num) return;
        L.popup()
            .setContent(
                '<b>API Number:</b> '               + (data.api_num     || '') +
                '<br><b>FracTracker Class:</b> '    + (data.ft_category || '') +
                '<br><b>State:</b> '                + (data.stusps      || '') +
                '<br><b>Provided Well Type:</b> '   + (data.well_type   || '') +
                '<br><b>Provided Well Status:</b> ' + (data.well_status || '') +
                '<br><b>Well Name:</b> '            + (data.well_name   || '') +
                '<br><b>Operator:</b> '             + (data.operator    || '') +
                '<br><b>Longitude:</b> '            + (data.longitude   || '') +
                '<br><b>Latitude:</b> '             + (data.latitude    || '')
            )
            .setLatLng(e.latlng)
            .openOn(map);
    });
});

// Initial check for the zoom level
togglePointLayerByZoom();




// Create the Leaflet Draw Control
var drawControl = new L.Control.Draw({
    draw: {
        circle: true, // Allow the user to draw a circle
        circlemarker: false,
        polygon: false,
        polyline: false,
        rectangle: false,
        marker: false,
    }
});

// Add draw control to the map (needed to activate draw event machinery)
map.addControl(drawControl);
// Hide Leaflet's built-in control; we use custom buttons below
drawControl.getContainer().style.display = 'none';

// Create custom draw buttons in the sidebar
var drawControlsDiv = document.getElementById('draw-controls');
var circleHandler = new L.Draw.Circle(map, drawControl.options.draw.circle);

var circleBtn = document.createElement('button');
circleBtn.textContent = 'Draw Circle';
circleBtn.title = 'Draw a circle to select wells';
circleBtn.className = 'draw-custom-btn';
circleBtn.style.display = 'none';
circleBtn.addEventListener('click', function () { circleHandler.enable(); });

var clearBtn = document.createElement('button');
clearBtn.textContent = 'Clear Circle';
clearBtn.title = 'Remove drawn circle and reset table';
clearBtn.className = 'draw-custom-btn';
function clearAllCircles() {
    drawnItems.clearLayers();
    if (radiusCircle)  { map.removeLayer(radiusCircle);  radiusCircle = null; }
    if (radiusMarker)  { map.removeLayer(radiusMarker);  radiusMarker = null; }
}

clearBtn.addEventListener('click', function () { clearSelection(); });

function clearSelection() {
    var wasCircle = (tableMode === 'circle');
    clearAllCircles();
    tableMode = 'filter';
    if (!wasCircle) {
        // No circle was active — treat this as clearing the refine filter
        refineParams = [];
        document.getElementById('sort-field2').value = '';
        document.getElementById('srch-input').value = '';
        document.getElementById('extra-filters').innerHTML = '';
        document.getElementById('add-filter-btn').style.display = 'none';
        updateFilterButtonLayout();
    }
    loadVectorTiles();
    getCounties(currentFilters.states, currentFilters.county, currentFilters.well_type, currentFilters.well_status, currentFilters.category);
    loadTablePage(1);
}

drawControlsDiv.appendChild(circleBtn);
drawControlsDiv.appendChild(clearBtn);

// Radius-input + draggable circle
document.getElementById('place-circle-btn').addEventListener('click', function () {
    var miles = parseFloat(document.getElementById('circle-radius-input').value);
    if (isNaN(miles) || miles <= 0) { alert('Please enter a valid radius in miles.'); return; }
    var meters = miles * 1609.344;
    var center = map.getCenter();

    clearAllCircles();

    radiusCircle = L.circle(center, {
        radius: meters,
        color: '#3388ff',
        fillOpacity: 0.1,
    }).addTo(map);

    radiusMarker = L.marker(center, {
        draggable: true,
        icon: L.divIcon({
            className: '',
            html: '<div style="width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #3388ff;box-shadow:0 1px 4px rgba(0,0,0,0.4);cursor:grab;margin-left:-9px;margin-top:-9px"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        }),
    }).addTo(map);

    radiusMarker.on('drag', function () {
        radiusCircle.setLatLng(radiusMarker.getLatLng());
    });

    radiusMarker.on('dragend', function () {
        var pos = radiusMarker.getLatLng();
        circleParams = { lat: pos.lat, lng: pos.lng, radius: meters };
        loadTablePage(1);
    });

    tableMode = 'circle';
    circleParams = { lat: center.lat, lng: center.lng, radius: meters };
    loadTablePage(1);
});

// Event listener for hand-drawn circle (Leaflet Draw)
map.on('draw:created', function (e) {
var layer = e.layer;

if (layer instanceof L.Circle) {
    var circleCenter = layer.getLatLng();
    var circleRadius = layer.getRadius();
    clearAllCircles();  // remove any previous circle (drawn or radius-input)
    drawnItems.addLayer(layer);

    tableMode = 'circle';
    circleParams = { lat: circleCenter.lat, lng: circleCenter.lng, radius: circleRadius };
    loadTablePage(1);
}
});

function updateAddFilterBtn() {
    var f = document.getElementById('sort-field2').value;
    var s = document.getElementById('srch-input').value.trim();
    document.getElementById('add-filter-btn').style.display = (f && s) ? '' : 'none';
}
document.getElementById('sort-field2').addEventListener('change', updateAddFilterBtn);
document.getElementById('srch-input').addEventListener('input', updateAddFilterBtn);

function updateScrollState() {
    var extraCount = document.querySelectorAll('#extra-filters .extra-filter-row').length;
    var total = 1 + extraCount; // 1 primary + extras
    document.getElementById('filter-pairs-scroll').classList.toggle('needs-scroll', total >= 4);
}

function updateFilterButtonLayout() {
    var hasExtras = document.querySelectorAll('#extra-filters .extra-filter-row').length > 0;
    document.getElementById('sortbtn2').style.display = hasExtras ? 'none' : '';
    document.getElementById('primary-close-btn').style.display = hasExtras ? '' : 'none';
    document.getElementById('sortbtn2-bottom').style.display = hasExtras ? '' : 'none';
}

function collapseExtraFilters() {
    document.getElementById('extra-filters').innerHTML = '';
    updateFilterButtonLayout();
    updateScrollState();
}

function removePrimaryFilter() {
    var firstExtra = document.querySelector('#extra-filters .extra-filter-row');
    if (firstExtra) {
        document.getElementById('sort-field2').value = firstExtra.querySelector('.extra-field').value;
        document.getElementById('srch-input').value = firstExtra.querySelector('.extra-value').value;
        firstExtra.remove();
    } else {
        document.getElementById('sort-field2').value = '';
        document.getElementById('srch-input').value = '';
    }
    updateAddFilterBtn();
    updateFilterButtonLayout();
    updateScrollState();
}

function addExtraFilter() {
    var row = document.createElement('div');
    row.className = 'extra-filter-row';
    row.style.marginTop = '8px';

    var sel = document.createElement('select');
    sel.className = 'extra-field dropdownbutton';
    sel.style.cssText = 'cursor:pointer;text-align:center;padding:5px;margin-bottom:8px;width:100%';
    sel.innerHTML = document.getElementById('sort-field2').innerHTML;
    sel.value = '';

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:84% 16%;width:100%';

    var inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'text-align:center;border:none;height:25px;background-color:#0287D4;border-radius:4px';
    var input = document.createElement('input');
    input.className = 'extra-value';
    input.style.cssText = 'text-indent:5px;border:none;border-radius:4px;height:25px;width:100%';
    inputWrap.appendChild(input);

    var removeWrap = document.createElement('div');
    removeWrap.style.cssText = 'justify-self:right;text-align:center;border:none;height:25px;background-color:white;border-radius:7px';
    var removeBtn = document.createElement('button');
    removeBtn.className = 'divbtns removebtn';
    removeBtn.textContent = '×';
    removeBtn.onclick = function() { row.remove(); updateFilterButtonLayout(); updateScrollState(); };
    removeWrap.appendChild(removeBtn);

    grid.appendChild(inputWrap);
    grid.appendChild(removeWrap);
    row.appendChild(sel);
    row.appendChild(grid);
    document.getElementById('extra-filters').appendChild(row);
    updateFilterButtonLayout();
    updateScrollState();
}

function flashDropdown(el) {
    el.focus();
    var flashes = 0;
    var interval = setInterval(function() {
        el.style.outline = flashes % 2 === 0 ? '4px solid #de541e' : '';
        flashes++;
        if (flashes >= 6) { clearInterval(interval); el.style.outline = ''; }
    }, 250);
}

function refinefilter () {
    var f = document.getElementById('sort-field2').value;
    var s = document.getElementById('srch-input').value.trim();
    if (!f) { flashDropdown(document.getElementById('sort-field2')); return; }
    if (!s) { document.getElementById('srch-input').focus(); return; }

    var allFilters = [{ field: f, value: s }];
    var extraInvalid = false;
    document.querySelectorAll('#extra-filters .extra-filter-row').forEach(function(row) {
        var ef = row.querySelector('.extra-field').value;
        var ev = row.querySelector('.extra-value').value.trim();
        if (ev && !ef) { flashDropdown(row.querySelector('.extra-field')); extraInvalid = true; return; }
        if (ef && ev) allFilters.push({ field: ef, value: ev });
    });
    if (extraInvalid) return;
    refineParams = allFilters;
    loadVectorTiles();
    getCounties(currentFilters.states, currentFilters.county, currentFilters.well_type, currentFilters.well_status, currentFilters.category);

    var params = Object.assign({}, currentFilters, {
        page: 1,
        search_field: refineParams.map(function(r) { return r.field; }),
        search_value: refineParams.map(function(r) { return r.value; }),
    });
    $.ajax({
        url: '/wells/get_table_page',
        method: 'GET',
        traditional: true,
        data: params,
        success: function(data) {
            renderServerTablePage(data.features, 1, data.total_pages, data.total_count);
        },
        error: function() {
            console.error('Error performing search');
        }
    });
}

filterbtn.addEventListener('click', (e) => {
    document.getElementById('resultspanel').classList.add('hide');
    document.getElementById('filterpanel').classList.remove('hide');
    document.getElementById('resultsbtn').classList.remove('sel')
    document.getElementById('filterbtn').classList.add('sel')


});
resultsbtn.addEventListener('click', (e) => {
    document.getElementById('filterpanel').classList.add('hide');
    document.getElementById('resultspanel').classList.remove('hide');
    document.getElementById('filterbtn').classList.remove('sel')
    document.getElementById('resultsbtn').classList.add('sel')
    map.invalidateSize();
});



window.onload = function() {
    document.getElementById('category1').checked = false;
    document.getElementById('category2').checked = false;
    document.getElementById('category3').checked = false;
    document.getElementById('category4').checked = false;
    document.getElementById('category5').checked = false;
    document.getElementById('category6').checked = false;
    document.getElementById('countylayer').checked = false;
    document.getElementById('countycount').checked = false;
    document.getElementById('countychoropleth').checked = false;

}

// Auto-apply pre-selected state if passed via URL (set by template before this script loads)
if (window.PRESELECTED_STATE) {
    toggleselection('state', window.PRESELECTED_STATE);
    applyCategoryFilter();
}