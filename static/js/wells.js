// Initialize Leaflet map

const textbox = document.getElementById('stateinputbox');
const buttonContainer = document.getElementById('button-container');
const ctytextbox = document.getElementById('countybox');
const ctybuttonContainer = document.getElementById('ctybutton-container');

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
    console.log('Using geocoder', geocoderString);
    geocoder = L.Control.Geocoder[geocoderString]();
    } else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString);
    }
}

var control = L.Control.geocoder({
    collapsed: false,
    placeholder: '',
    position:'topright',
    geocoder: geocoder
}).addTo(map);
var dots;

// Call the getContainer routine.
var htmlObject = control.getContainer();
// Get the desired parent node.
var a = document.getElementById('search-container');

// Function to fetch GeoJSON data from a view
function getStates(data) {
    var states = document.getElementById('stateinputbox').value;
    $.ajax({
        url: '/wells/getstates_view', // Replace with your view URL
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            map.eachLayer(function(layer) {

                try {
                    if (layer._leaflet_id == stateLayer) {
                        map.removeLayer(layer);
                    } else {
                        // console.log('layer id did not match') 
                    }
                    }
                    catch(err) {
                        // console.log('no such layer exists'); 
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
                style: geojsonStyle
            };
            canvasLayer_state = L.geoJSON(data, options).addTo(map);

            // canvasLayer_state = L.geoJson.vt(data, options).addTo(map); 

            stateLayer=canvasLayer_state._leaflet_id
            try {
                map.fitBounds(canvasLayer_state.getBounds());
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
function getCounties(data) {
    pts = data
    var states = document.getElementById('stateinputbox').value;
    $.ajax({
        url: '/wells/getcounties_view', 
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            ctyct(data,pts);

            console.log('GeoJSON data received:', data);
            // Convert GeoJSON to vector tiles using leaflet-geojson-vt
            map.eachLayer(function(layer) {

                try {
                    if (layer._leaflet_id == countyLayer) {
                        map.removeLayer(layer);
                    } else {
                        console.log('layer id did not match')
                    }
                    }
                    catch(err) {
                        console.log('no such layer exists');
                    }
                    
            }); 

            var geojsonStyle = {
                fillColor:"#FFFFFF",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.00001,
                };
            
            var options = {
                maxZoom: 20,
                minZoom: 8,
                tolerance: 3,
                debug: 0,
                style: geojsonStyle,
                zIndex: 5000
            };
            canvasLayer_cty = L.geoJson.vt(data, options).addTo(map);

            countyLayer = canvasLayer_cty._leaflet_id
            
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error(error);
        }
    });
}



function addCtyOptions(data) {
    var states = document.getElementById('stateinputbox').value;
    console.log('states targeted')
    console.log(states)
    $.ajax({
        url: '/wells/createCountyList',
        method: 'GET',
        data: {
            states: states,
        },
        success: function(data) {
            // create the "buttons" for each county for the dropdown
            let ctyitems = JSON.parse(data);
            console.log('here is the data')
            console.log(ctyitems)
            // Iterate through the statesarray array and create a button for each color
            ctyitems.forEach(color => {
                const ctybutton = document.createElement('button');
                ctybutton.className = 'hdbutton';
                ctybutton.id = color;
                ctybutton.innerText = color.stusps + ': ' + color.county; // Capitalize the first letter of color
                ctybutton.onclick = () => toggleselection(color);
                // Append the button to the button-container div
                ctybuttonContainer.appendChild(ctybutton);
            });
        },
        error: function(xhr,status,error) {
            console.error(error);
        }
    })
};

let autoinput1 = document.getElementById('countybox');
autoinput1.addEventListener('keyup', async function(event) {
    showhelper()
    let response = await supplylist(autoinput1.value)
});
function hidehelper1() {
    hideit1 = document.getElementById('ctybutton-container');
    hideit1.style.display = 'none';
}
function showhelper1() {
    hideit1 = document.getElementById('ctybutton-container');
    hideit1.style.display = 'block';
    hideit1.style.opacity= 1;
}

function onEachFeatureFn(prop, feature, layer) {
        layer.feature.property.longitude
    }
// Empty Layer Group that will receive the clusters data on the fly.
var markers = L.geoJSON(null, {
    pointToLayer: createClusterIcon,
    onEachFeature: function (feature, layer) {
        const wwlink = '<br><b>WellWiki Page: </b><a href='+feature.properties.wellwiki+' target="_blank">'+feature.properties.wellwiki+'</a>';
        layer.bindPopup("<b>API Number: </b>" + feature.properties.api_num + "<br><b>FracTracker Class: </b>" + 
                                                feature.properties.ft_category + "<br><b>State: </b>" + 
                                                feature.properties.stusps + "<br><b>Provided Well Type: </b>" + 
                                                feature.properties.well_type + "<br><b>Provided Well Status: </b>" + 
                                                feature.properties.well_status + "<br><b>Well Name: </b>" + 
                                                feature.properties.well_name + "<br><b>Operator: </b>" + 
                                                feature.properties.operator + "<br><b>Longitude:</b> " + 
                                                feature.properties.lng + "<br><b>Latitude: </b>" + 
                                                feature.properties.lat + wwlink);
}
});

        // Update the displayed clusters after user pan / zoom.
map.on('moveend', update);

function update() {
    if (!ready) return;
    var bounds = map.getBounds();
    var bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    var zoom = map.getZoom();
    var clusters = index.getClusters(bbox, zoom);
    markers.clearLayers();
    markers.addData(clusters);

}

// Zoom to expand the cluster clicked by user.
markers.on('click', function(e) {
    var clusterId = e.layer.feature.properties.cluster_id;
    var center = e.latlng;
    var expansionZoom;
    if (clusterId) {
    expansionZoom = index.getClusterExpansionZoom(clusterId);
    map.flyTo(center, expansionZoom);
    }
});



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

function createClusterIcon(feature, latlng) {
    var markerStyle = {
        color: getColor(feature.properties.ft_category),
        fillColor: getColor(feature.properties.ft_category),
        maxZoom: 20,
        minZoom: 8,
        radius: 3, // Radius // Fill opacity of the circle
    };
    if (!feature.properties.cluster) return L.circleMarker(latlng, markerStyle);
    var count = feature.properties.point_count;
    var size =
    count < 100 ? 'small' :
    count < 1000 ? 'medium' : 'large';
    var icon = L.divIcon({
    html: '<div><span>' + feature.properties.point_count_abbreviated + '</span></div>',
    className: 'marker-cluster marker-cluster-' + size,
    iconSize: L.point(25)
    });

    return L.marker(latlng, {
    icon: icon
    });
}



// Function to update the map markers with the filtered data
function updateMapMarkers(data) {
    data = JSON.parse(data);
    
    console.log('updateMapMarkers')
    // Clear existing markers from the map
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }  
    });

    index = supercluster({
        radius: 20,
        extent: 256,
        maxZoom: 9,
        }).load(data.features); // Expects an array of Features.
    ready = true;

    // map.addLayer(markers); 
    update();
    // Get the bounding box of the markers
    updateTable(data.features);
    document.getElementById('loading-popup').classList.add('hidden');
}

function ctyct(data,d) {
    // Initialize a tally object
    let tally = {};
    console.log('d')
    console.log(d)
    console.log('data')
    console.log(data)
    // Iterate through each feature to tally based on `stusps` and `county`
    JSON.parse(d).features.forEach(feature => {
    const { stusps, county } = feature.properties;
    const key = `${stusps}_${county}`;
    if (!tally[key]) {
        tally[key] = 0;
    }
    tally[key]++;
    });
    p = L.geoJSON(data)
    // Add polygons to the map
    p.eachLayer(polygonData => {
        console.log(polygonData)
        const { statename, county, geometry } = polygonData.feature;
        const tallyKey = `${statename}_${county}`;
        const count = tally[tallyKey] || 0;
    
    // Plot the GeoJSON layer on the map
    const geoJsonLayer = L.geoJSON(geometry).addTo(map).bindPopup(`${county} - ${statename}: ${count} occurrences`);

    // Access each layer within the GeoJSON (it could be a Polygon or MultiPolygon)
    geoJsonLayer.eachLayer(function(layer) {
    // Make sure the layer is a Polygon (or MultiPolygon)

    // Create a custom icon using the dynamic number
    const numberIcon = L.divIcon({
        className: 'number-icon',
        html: `<div style="background-color: #ff780000; color: #383838; padding: 10px; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; font-size: 16px; font-weight: 900">${count}</div>`,
        iconSize: [40, 40],
        iconAnchor: [30, 30]
        });
    if (layer instanceof L.Polygon || layer instanceof L.MultiPolygon) {
        // Get the center of the polygon (or MultiPolygon)
        const center = layer.getCenter(); // This works for both Polygon and MultiPolygon

        // Place a marker at the centroid of the polygon
        L.marker(center, { icon: numberIcon })
        .addTo(map)
        .bindPopup(`${county} - ${statename}: ${count} occurrences`);
    }
    });
})};

// Show points only if zoom level is between 10 and 14
map.on('zoomend', function () {
    var currentZoom = map.getZoom();
    if (currentZoom >= 10 && currentZoom <= 20) {
        markers.addTo(map);
    } else {
        markers.remove();
    }
});


// Function to apply category filter
function applyCategoryFilter() {

// function applyCategoryFilter(category, states) {
    // console.log(category)
    // console.log(states)
    // Function to get selected values
    // var category = window.getSelectedValues = () => {
    //     return selectedValues;
    // };
    console.log('here are the lucky categories')
    // console.log(category)
    console.log('did we get em?')
    var category = document.getElementById('fta_cat').value; 
    var states = document.getElementById('stateinputbox').value;
    var statesop = document.getElementById('stateinputbox').value;
    var county = document.getElementById('countybox').value;
    var countyop = document.getElementById('op_21').value;
    var well_type = document.getElementById('autoinputbox2').value;
    var well_typeop = document.getElementById('op_41').value;
    var well_status = document.getElementById('autoinputbox3').value;
    var well_statusop = document.getElementById('op_31').value;
    var well_name = document.getElementById('well_name').value;
    var well_nameop = document.getElementById('op_51').value;
    // Perform AJAX call to fetch filtered data based on 'category'
    console.log('sending the request');
    document.getElementById('loading-popup').classList.remove('hidden');


    document.getElementById('loading-popup').classList.remove('hidden');
    // Start adding periods to the text
    let dots = '';
    let dotCount = 0;
    dotInterval = setInterval(() => {
        dotCount += 1;
        if (dotCount > 2) {
            thetext = '   '; // Reset dots
            dotCount = 0;
        } else {
            thetext = '...'
        }
        document.getElementById('loading-dots').textContent = thetext;
    }, 1000); // Update text every 500ms

    $.ajax({
        url: '/wells/generate_geojson',
        method: 'GET',
        data: {
            states: states,
            statesop: statesop,
            county: county,
            countyop: countyop,
            well_type: well_type,
            well_typeop: well_typeop,
            well_status: well_status,
            well_statusop: well_statusop,
            well_name: well_name,
            well_nameop: well_nameop,
            category: category,

        },
        success: function(data) {
            filteredData = data
            console.log('had success')
            updateMapMarkers(data);
            console.log('should be done');
            getCounties(data);
            getStates(data);
        },
        error: function(xhr, status, error) {
            console.error(error);
            document.getElementById('loading-popup').classList.add('hidden');
        }
    });
    

}
function updateTable(features) {
    var tableBody = document.getElementById('maintablebody');
    var currentPage = 1;
    var rowsPerPage = 50;

    // Function to display rows based on current page
    function displayRows(currentPage) {
        var startIndex = (currentPage - 1) * rowsPerPage;
        var endIndex = startIndex + rowsPerPage;
        var pageFeatures = features.slice(startIndex, endIndex);

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

        // Show buttons for the first page, last page, two pages before and two pages after the current page
        var buttonsToShow = [];
        if (totalPages > 0) {
            if (currentPage > 3) {
                buttonsToShow.push(1);
            }

            if (currentPage > 2) {
                buttonsToShow.push(currentPage - 2);
            }
            if (currentPage > 1) {
                buttonsToShow.push(currentPage - 1);
            }

            buttonsToShow.push(currentPage);

            if (currentPage < totalPages) {
                buttonsToShow.push(currentPage + 1);
            }
            if (currentPage < totalPages - 1) {
                buttonsToShow.push(currentPage + 2);
            }

            if (totalPages > 1) {
                buttonsToShow.push(totalPages);
            }
        }

        // Add page number buttons
        buttonsToShow.forEach(function(page) {
            var button = document.createElement('button');
            button.textContent = page;
            button.onclick = function() {
                currentPage = parseInt(this.textContent);
                displayRows(currentPage);
            };
            paginationCell.appendChild(button);
        });
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

    /* Function to sort the table by the selected column
    document.getElementById('sort-dropdown').addEventListener('change', function() {
        var selectedColumn = this.value;
        console.log('itchanged')
        features.sort(function(a, b) {
            // Sorting logic for text data
            console.log(a)
            console.log(a.properties[selectedColumn])
            if (a.properties[selectedColumn] < b.properties[selectedColumn]) return -1;
            if (a.properties[selectedColumn] > b.properties[selectedColumn]) return 1;
            return 0;
        });
        // After sorting, update the table
        displayRows(currentPage);
    }); */
}
// Function to download CSV of table data
function downloadTableData() {
    console.log('starting the download')
    // Check if filtered data is available
    if (!filteredData) {
        console.error("Filtered data is not available.");
        return;
    }
    
    // Parse filtered data
    var data = JSON.parse(filteredData);
    console.log(data)
    // Function to properly encode special characters for CSV
    function encodeForCSV(str) {
        // If the string contains comma, double quote, or newline characters,
        // wrap it in double quotes and escape any double quotes within the string
        if (/[,"\n]/.test(str)) {
            return '"' + str.replace(/"/g, '""').replace('#','') + '"';
        } else if (/#/.test(str)) {
            // If the string contains #, wrap it in double quotes to ensure it's treated as a regular character
            console.log(str);
            console.log(str.replace('#',''));
            return str.replace('#','');
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

    console.log(headers)
    
    // Convert each data item to CSV format
    data.features.forEach(function(dataItem) {
        console.log(dataItem)
        var row = headers.map(function(header) {
            return encodeForCSV(dataItem.properties[header]);
        }).join(",");
        console.log(row);
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

// Toggle legend content
document.getElementById('legend-toggle').addEventListener('click', function() {
    var content = document.querySelector('.legend-content');
    var icon = document.getElementById('legend-toggle');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
});

// Initialize legend state
document.querySelector('.legend-content').style.display = 'none'; // Start with legend collapsed

function supplylist(b) {
    var listbox = 'statebox';
    $.ajax({
        url: '/wells/autolist', // Replace with your view URL
        method: 'GET',
        data: {
            box: b,
            typed: listbox
        },
        success: function(data) {
            console.log(data)
            const listitems = data.data;
            console.log(listitems)
            // Iterate through the statesarray array and create a button for each st
            document.getElementById('button-container').innerHTML = '';

            listitems.forEach(st => {
                const button = document.createElement('button');
                button.className = 'hdbutton';
                button.id = st;
                button.innerText = st.charAt(0).toUpperCase() + st.slice(1); // Capitalize the first letter of color
                button.onclick = () => toggleselection(st);
                // Append the button to the button-container div
                document.getElementById('button-container').appendChild(button);
            });
        },
        error: function(xhr, status, error) {
            // Handle error
            console.error(error);
        }
    });
}

// const statesarray = [
//     "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
//     "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
//     "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
//     "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
//     "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
//     "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
//     "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
//     ];

// // Iterate through the statesarray array and create a button for each st
// statesarray.forEach(st => {
//     const button = document.createElement('button');
//     button.className = 'hdbutton';
//     button.id = st;
//     button.innerText = st.charAt(0).toUpperCase() + st.slice(1); // Capitalize the first letter of color
//     button.onclick = () => toggleselection(st);
    
//     // Append the button to the button-container div
//     document.getElementById('button-container').appendChild(button);
// });

let stateinput = document.getElementById('stateinputbox');
stateinput.addEventListener('keyup', async function(event) {
    console.log(stateinput.value)
    showhelper()
    let response = await supplylist(stateinput.value)
});
function hidehelper() {
    buttonContainer.style.display = 'none';
}
function showhelper() {
    buttonContainer.style.display = 'block';
    buttonContainer.style.opacity= 1;
}



// Add an event listener to the textbox to show the button container on focus
textbox.addEventListener('focus', () => {
    buttonContainer.style.display = 'block'; // Show the button container
});
// Add an event listener to the textbox to show the button container on focus
ctytextbox.addEventListener('focus', () => {
    ctybuttonContainer.style.display = 'block'; // Show the button container
});
window.addEventListener('click', function(event) {
    var selectionbox = document.getElementById('button-container');
    if (!selectionbox.contains(event.target) && event.target !== textbox) {
        selectionbox.style.display = 'none'
    }
});
window.addEventListener('click', function(event) {
    var ctybox = document.getElementById('countybox');
    if (!ctybuttonContainer.contains(event.target) && event.target !== ctybox) {
        ctybuttonContainer.style.display = 'none'
    }
});

function toggleselection(thestate) {
    var statetextbox = document.getElementById('stateinputbox');
    var buttonState = document.createElement('button-state');
    // console.log('clicked it')
    // console.log(thestate)
    // buttonState.classList.add('button-in-textbox');
    // buttonState.textContent = "Button " + thestate;

    // buttonState.onclick = function() {
    //     buttonState.remove();
    // };

    // statetextbox.appendChild(buttonState);

    // var newButton = document.createElement("button");
    buttonState.textContent = thestate;
    buttonState.id = "input-" + thestate;

    // Append the new button to the input box (which is now an input field)
    statetextbox.parentNode.appendChild(buttonState);
}
function removeButton(event) {
    // Check if the clicked element is a button
    if (event.target.tagName === "BUTTON") {
        event.target.remove(); // Remove the button from the input box
    }
}

// function toggleselection(word) {
//     var textbox = document.getElementById('stateinputbox');
//     var bid = document.getElementById(word)

//     if (textbox.value.includes(word)) {
//         bid = document.getElementById(word)
//         textbox.value = textbox.value.replace(word,'');
//         bid.style.backgroundColor = 'white'
//         bid.style.color = 'black'
//     } else if (textbox.value === '') {
//         textbox.value = word
//         bid.style.backgroundColor = 'darkgray'
//         bid.style.color = 'white'
//     } else {
//         textbox.value = textbox.value + ', ' + word
//         bid.style.backgroundColor = 'darkgray'
//         bid.style.color = 'white'
//     }
//     if (textbox.value.startsWith(', ')) {
//         textbox.value = textbox.value.replace(', ','');
//     }
//     if (textbox.value.endsWith(',')) {
//         textbox.value = textbox.value.slice(0,-1);
//     }
//     if (textbox.value.endsWith(', ')) {
//         textbox.value = textbox.value.slice(0,-2);
//     }
//     if (textbox.value.includes(', ,')) {
//         textbox.value = textbox.value.replace(', ,',',')
//     }
//     addCtyOptions()
// }

