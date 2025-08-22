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
var osmUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        osm = L.tileLayer(osmUrl, { maxZoom: 20, attribution: osmAttrib }).addTo(map),
        drawnItems = L.featureGroup().addTo(map);
var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
});
var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    // attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' 
});
var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    // attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' 
});

var controlbase = L.control.layers({'Light': osm,'OSM':OpenStreetMap_Mapnik, 'Satellite':sat, 'Terrain':Esri_WorldTopoMap}, {}, { position: 'bottomleft', collapsed: false }).addTo(map);

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
                map.fitBounds(statebounds);
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

// Function to fetch GeoJSON data from a view
function getCounties(s,c,data) {
    pts = data
    var states = getSelValues('statePicks')
    $.ajax({
        url: '/wells/getcounties_view', 
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            
            // console.log('GeoJSON data received:', data);
            // Convert GeoJSON to vector tiles using leaflet-geojson-vt
            map.eachLayer(function(layer) {
                try {
                    if (layer._leaflet_id == countyLayer) {
                        map.removeLayer(layer);
                    } else {
                        // console.log('layer id did not match')
                    }
                    }
                    catch(err) {
                        // console.log('no such county layer exists');
                    }
                    
            }); 

            
            var geojsonStyle = {
                fillColor:"#FFFFFF",
                color: "#000",
                weight: 1,
                opacity: .5,
                fillOpacity: 0.00001,
                };

            canvasLayer_cty = L.geoJSON(data, {
                style: geojsonStyle,
                zIndex: 10,
                maxZoom: 20,
                minZoom: 1,
                tolerance: 3,
                debug: 0,
                onEachFeature: function(feature, layer) {
                    const county = feature.county;
                    // layer.bindPopup(`<strong>County:</strong> ${county}`);
                    // Add hover functionality to show county name in a tooltip
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
                    // layer.on('click', function () {
                    //     console.log('clicked it');  // Log the message when the polygon is clicked
                    // });
                }
            }).addTo(map);

            ctyct(data,pts);


            countyLayer = canvasLayer_cty._leaflet_id
            
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error(error);
        }
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
            let ctyitems = JSON.parse(data);
            highlight = ctytextbox.innerHTML
            ctybuttonContainer.innerHTML = ''
            // console.log('what is in the html?')
            // console.log(highlight)
            // Iterate through the statesarray array and create a button for each color
            ctyitems.forEach(ctyitem => {
                const ctybutton = document.createElement('button');
                ctybutton.id = ctyitem.stusps + ': ' + ctyitem.county+'btn';
                // console.log(ctybutton.id)
                if (highlight.includes(ctybutton.id.slice(0,-3))) {
                    // console.log('found something to highlight')
                    ctybutton.className = 'highlightbutton';
                } else {
                    ctybutton.className = 'filterbutton';
                }
                
                // console.log(ctyitem.county)
                ctybutton.innerText = ctyitem.stusps + ': ' + ctyitem.county; // Capitalize the first letter of color
                ctybutton.onclick = () => toggleselection('county',ctyitem.stusps + ': ' + ctyitem.county);
                // Append the button to the button-container div
                ctybuttonContainer.appendChild(ctybutton);
            });
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
function ctyct(data, d) {
    // Initialize a tally object
    let tally = {};
    let minCount = Infinity;
    let maxCount = -Infinity;

    if (ctytallyLayer) {
        map.removeLayer(ctytallyLayer);
    } ;


    // Parse the data and tally occurrences
    JSON.parse(d).features.forEach(feature => {
        const { stusps, county } = feature.properties;
        const key = `${stusps}_${county}`;
        if (!tally[key]) {
            tally[key] = 0;
        }
        tally[key]++;
    });

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
        const tallyKey = `${statename}_${county}`;
        const count = tally[tallyKey] || 0;

        // Track the min and max counts to later adjust opacity proportionally
        if (count < minCount) minCount = count;
        if (count > maxCount) maxCount = count;

        if (count > 0) {
            filteredCtyCtGeoJSON.features.push(feature);

            const polygonLayer = L.geoJSON(feature);
            const center = polygonLayer.getBounds().getCenter(); 

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
            const count = tally[`${statename}_${county}`] || 0;
            const opacity = calculateOpacity(count); // Calculate opacity based on count

            return {
                fillColor: '#025687',        
                color: '#025687',
                weight: 2,              
                opacity: 1,             
                fillOpacity: opacity // Set fill opacity based on count
            };
        },
        zIndex: 200,
        onEachFeature: function(feature, layer) {
            const county = feature.county;
            const statename = feature.statename;
            const count = tally[`${statename}_${county}`] || 0;
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
                html: `<div><strong>${feature.properties.count}</strong></div>`,
                iconSize: [55, 30],
                iconAnchor: [30, 20], 
            });

            const iconStyle = `
                .number-icon {
                    background-color: #00253B;  
                    color: #A9DFFF;
                    opacity: .8;
                    border-radius: 25%;     
                    border: 2px solid white;  
                    display: flex;
                    justify-content: center;  
                    align-items: center;      
                    font-size: 14px;          
                    font-weight: bold;        
                }
            `;
            const styleElement = document.createElement('style');
            styleElement.innerHTML = iconStyle;
            document.head.appendChild(styleElement);

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


// Function to apply category filter
function applyCategoryFilter() {
    document.getElementById('filterpanel').classList.add('hide')
    document.getElementById('filterbtn').classList.remove('sel')
    document.getElementById('loadingpanel').classList.remove('hide');
    // let dots = '';
    // let dotCount = 0;
    // dotInterval = setInterval(() => {
    //     dotCount += 1;
    //     if (dotCount > 2) {
    //         thetext = '   '; // Reset dots
    //         dotCount = 0;
    //     } else {
    //         thetext = '...'
    //     }
    // }, 1000); // Update text every 500ms
    // document.getElementById('loading-dots').textContent = thetext;

    // document.getElementById('refineblock').style.display = 'none';

    var category = document.getElementById('ftacatPicks').value; 
    
    var states = getSelValues('statePicks');  // Assuming this returns a comma-delimited string
    // Split the string into an array
    states = states.split(',');
    // Now filter out the null values
    states = states.filter(value => value !== null && value !== '');  // Also filters out empty strings
    states = states.join(',');

    // console.log('states')
    // console.log(states)
    var counties = getSelValues('countyPicks')
    var well_status = getSelValues('statusPicks');
    var well_type = getSelValues('typePicks');
    var category = getSelValues('ftacatPicks');
    // open up the loading window
    // document.getElementById('loading-popupid').style.display = 'block';
    // Start adding periods to the loading popup text
    // update this with something better such as spinny thing



    $.ajax({
        url: '/wells/generate_geojson',
        method: 'GET',
        data: {
            states: states,
            county: counties,
            well_type: well_type,
            well_status: well_status,
            category: category,
        },
        success: function(data) {
            filteredData = JSON.parse(data);
            console.log('had success retrieving the records') // replace with action item
            // updateMapMarkers(data);
            // console.log(data);
            // console.log(filteredData);
            // console.log(filteredData.features);
            updateTable(filteredData.features);
            filterProd(data);
            getCounties(states, counties, data);
            getStates(states);
            // document.getElementById('refineblock').style.display = 'block';
            // document.getElementById('loading-popupid').style.display = 'none';
            document.getElementById('loadingpanel').classList.add('hide')
            document.getElementById('resultspanel').classList.remove('hide')
            document.getElementById('resultsbtn').classList.add('sel')

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
        },

        error: function(xhr, status, error) {
            alert("There was an error retrieving you're records. Try adding some filters to reduce the number of resulting features");
            console.error(error); // make sure to alter user to the error
            document.getElementById('loading-popupid').style.display = 'none';
        }
    });
}




function sortTable() {
    console.log(filteredData)
    field = document.getElementById('sort-field').value;
    console.log('field')
    console.log(field)
    sdata = filteredData.features
    const sortedData = [...sdata].sort((a, b) => {
        // console.log('a')
        // console.log(field);
        const operatorA = a.properties[field] ? a.properties[field].toLowerCase() : '';
        // console.log('b')
        // console.log(field)
        const operatorB = b.properties[field] ? b.properties[field].toLowerCase() : '';
        if (operatorA < operatorB) return -1;
        if (operatorA > operatorB) return 1;
        return 0;
    });
    
    updateTable(sortedData);  // Render the sorted table
    sdata = ''
}


document.getElementById('sortbtn').addEventListener('click', function () {
    sortTable();
});

// function revert() {
//     updateTable(filteredData)
// }

function updateTable(features) {
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
        document.getElementById('records').innerText = 'Records ' + (((currentPage-1)*50)+1) + ' - ' + pgrecsMax + ' of ' + features.length


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
// Function to download CSV of table data
function downloadTableData(filteredData) {
    console.log('starting the download')
    // Check if filtered data is available
    if (!filteredData) {
        console.error("Filtered data is not available.");
        return;
    }

    // console.log(filteredData)
    // Parse filtered data
    // var data = JSON.parse(filteredData);

    var data = filteredData
    // console.log(data)
    // Function to properly encode special characters for CSV
    function encodeForCSV(str) {
        // If the string contains comma, double quote, or newline characters,
        // wrap it in double quotes and escape any double quotes within the string
        if (/[,"\n#]/.test(str)) {
            return '"' + str.replace(/"/g, '""').replace(/#/g, '') + '"';
            
        }
        return str;
    }

    // Convert data to CSV format
    var csvContent = "data:text/csv;charset=utf-8,";

    // Get the headers from the first data item
    // var headers = ['api_num','county','ft_category','fta_uid','id','latitude','longitude','municipality','operator','other_id','plug_date','spud_date','stusps','well_configuration','well_name','well_status','well_type'];
    // csvContent += headers.map(encodeForCSV).join(",") + "\n"; 

    var headers = Object.keys(data.features[0].properties);
    csvContent += headers.join(',') + '\n';

    // console.log(headers)
    
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
    link.setAttribute("download", "filtered_well_data.csv");

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
    // "Alaska", 
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
    "Texas (disabled)", 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
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
                feature.properties.lng + "<br><b>Latitude: </b>" 
            );
        }
    });
    // map.addLayer(productionwells)
}
// Toggle polygons visibility based on checkbox
document.getElementById('category6').addEventListener('change', function() {
    // document.getElementById('category6').classList.add('loadinglayer');
    document.body.classList.add('loadinglayer');

    if (this.checked) {
        productionwells.addTo(map)
    } else if (productionwells) {
        map.removeLayer(productionwells);
    } 
    document.body.classList.remove('loadinglayer');

    // document.getElementById('category6').classList.remove('loadinglayer');
});

// Toggle polygons visibility based on checkbox
document.getElementById('category5').addEventListener('change', function() {
    if (this.checked) {
        pluggedwells.addTo(map);
    } else if (pluggedwells) {
        map.removeLayer(pluggedwells);
    }
});


// Toggle polygons visibility based on checkbox
document.getElementById('category4').addEventListener('change', function() {
    if (this.checked) {
        otherwells.addTo(map);
    } else if (otherwells) {
        map.removeLayer(otherwells);
    }
});


// Toggle polygons visibility based on checkbox
document.getElementById('category3').addEventListener('change', function() {
    if (this.checked) {
        orphanwells.addTo(map);
    } else if (orphanwells) {
        map.removeLayer(orphanwells);
    }
});


// Toggle polygons visibility based on checkbox
document.getElementById('category2').addEventListener('change', function() {
    if (this.checked) {
        notdrilledwells.addTo(map);
    } else if (notdrilledwells) {
        map.removeLayer(notdrilledwells);
    }
});


// Toggle polygons visibility based on checkbox
document.getElementById('category1').addEventListener('change', function() {
    if (this.checked) {
        injectionwells.addTo(map);
    } else if (injectionwells) {
        map.removeLayer(injectionwells);
    }
});

// Toggle polygons visibility based on checkbox
document.getElementById('countylayer').addEventListener('change', function() {
    if (this.checked && canvasLayer_cty) {
        canvasLayer_cty.addTo(map);
    } else if (canvasLayer_cty) {
        map.removeLayer(canvasLayer_cty);
    }
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


// Function to toggle the point layer visibility based on zoom level
function togglePointLayerByZoom() {
    var currentZoom = map.getZoom();
    // console.log(currentZoom);


    const wellftc = {'category6':productionwells, 'category5':pluggedwells, 'category4':otherwells, 'category3':orphanwells, 'category2':injectionwells, 'category1':notdrilledwells}
    // toggle well layers
    for (const [k,v] of Object.entries(wellftc)) {
        if (currentZoom >= 13 && currentZoom <= 20) {
            if (!map.hasLayer(v) && document.getElementById(k).checked) {
                map.addLayer(v);  // Add point layer when zoom level is between 14 and 20
                document.getElementById(k).checked = true;
            }
        } else if (v) {
            map.removeLayer(v);  // Remove point layer when zoom level is outside 14 to 20
            document.getElementById(k).checked = false;
        };
    }

}

// Call togglePointLayerByZoom every time the map zooms
map.on('zoomend', togglePointLayerByZoom);

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

// Manually attach the draw control to a div outside the map
var drawControlsDiv = document.getElementById('draw-controls');

// Attach the draw control to the separate div
map.addControl(drawControl);

// Move the control outside of the map container
var controlContainer = document.querySelector('.leaflet-draw-toolbar');
drawControlsDiv.appendChild(controlContainer);

// Event listener to count points inside the circle
map.on('draw:created', function (e) {
var layer = e.layer;

if (layer instanceof L.Circle) {
    // Get circle's center and radius
    var circleCenter = layer.getLatLng();
    var circleRadius = layer.getRadius();

    // Count how many points are inside the circle
    var pointsInside = 0;
        // JSON object to store points inside the circle
    var pointsInsideJSON = {
        count: 0,
        points: []
        };

    const wellftcat = {'category6':productionwells, 'category5':pluggedwells, 'category4':otherwells, 'category3':orphanwells, 'category2':injectionwells, 'category1':notdrilledwells}
    
    
    for (const [k,v] of Object.entries(wellftcat)) {
        if (document.getElementById(k).checked === true) {
            v.eachLayer(function (marker) {
                // console.log(marker)
                // console.log(marker.feature.properties.api_num)
                // Check if the marker is inside the circle
                var distance = circleCenter.distanceTo(marker.getLatLng());
                if (distance <= circleRadius) {
                pointsInsideJSON.count++;

                // Collect all attributes of the marker, including coordinates
                var markerData = {
                    api_num: marker.feature.properties.api_num,     // Custom attribute
                    other_id: marker.feature.properties.other_id,     // Custom attribute
                    latitude: marker.feature.properties.latitude,     // Custom attribute
                    longitude: marker.feature.properties.longitude,     // Custom attribute
                    stusps: marker.feature.properties.stusps,     // Custom attribute
                    county: marker.feature.properties.county,     // Custom attribute
                    municipality: marker.feature.properties.municipality,     // Custom attribute
                    well_name: marker.feature.properties.well_name,     // Custom attribute
                    operator: marker.feature.properties.operator,     // Custom attribute
                    spud_date: marker.feature.properties.spud_date,     // Custom attribute
                    plug_date: marker.feature.properties.plug_date,     // Custom attribute
                    well_type: marker.feature.properties.well_type,     // Custom attribute
                    well_status: marker.feature.properties.well_status,     // Custom attribute
                    well_configuration: marker.feature.properties.well_configuration,     // Custom attribute
                    ft_category: marker.feature.properties.ft_category,     // Custom attribute
                    id: marker.feature.properties.id,     // Custom attribute
                };

                pointsInsideJSON.points.push(markerData);
                }
            });
    }}
    // console.log(JSON.stringify(pointsInsideJSON, null, 2));

    //   starting here ============
    data = JSON.stringify(pointsInsideJSON, null, 2)
    // Convert the points to GeoJSON
    function convertToGeoJSON(data) {
        return {
            type: "FeatureCollection",
            features: data.points.map(point => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [point.longitude, point.latitude]
            },
            properties: {
                api_num: point.api_num,
                other_id: point.other_id,
                latitude: point.latitude,
                longitude: point.longitude,
                stusps: point.stusps,
                county: point.county,
                municipality: point.municipality,
                well_name: point.well_name,
                operator: point.operator,
                spud_date: point.spud_date,
                plug_date: point.plug_date,
                well_type: point.well_type,
                well_status: point.well_status,
                well_configuration: point.well_configuration,
                ft_category: point.ft_category,
                id: point.id,

            }
            }))
        };
        }
    
        // Convert data to GeoJSON
        const refinedrad = convertToGeoJSON(pointsInsideJSON);
        
        updateTable(refinedrad.features)
        // Log the result
        // console.log(JSON.stringify(geoJSON, null, 2));


      // Display the JSON object in the console
    //   console.log(JSON.stringify(pointsInsideJSON, null, 2));
    // alert("Points inside the circle: " + pointsInside);
}
});

function refinefilter () {
    f = document.getElementById('sort-field2').value;
    s = document.getElementById('srch-input').value;
    const refinedsrch = {
        "type": "FeatureCollection",
        "features": filteredData.features.filter(function(feature) {
          return feature.properties[f] === s; // Change the value as needed
        })
      };
      console.log('here')
      console.log(refinedsrch.features)
      updateTable(refinedsrch.features)
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