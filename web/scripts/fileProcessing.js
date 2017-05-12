/* Get locations file name
 */
var TEST_MODE = 0;

if (TEST_MODE) {
    urlParam = "files/CitySignInfos.txt";
    var iDB = 0;
    var iColl = 1;
    var iLat = 0;
    var iLong = 1;
    var iCity = 4;
    var iIcon = 2;
} else {
    urlParam = "files/CityLocations.txt";
    var iDB = 0, iColl = 0, iLat = 0, iLong = 1, iCity = 0, iIcon = 0;
}

var reader; //GLOBAL File Reader object for demo purpose only
var glocations = new Array();
/*  glocation[0] db
 *  [1] collection
 *  [2] latitude 
 *  [3] longitude 
 *  [4] city
 *  [5] icon
 */
var serverResponse = "pouf";

/*
 function onloadFunction {
 getLocations();
 buildLocationsList(serverResponse);
 //    displayContents(serverResponse);
 getSignsInfo();
 serverResponse = "pouf";
 buildSignsInfoList(serverResponse);
 displayMap();
 }
 */

/* Get locations from server
 * @returns {}
 */
function getLocations() {
    console.log("start getLocations");

//This event is called when the DOM is fully loaded
    window.addEvent("domready", function () {
        //Creating a new AJAX request that will request 'CityLocations.txt' from the current directory
        var csvRequest = new Request({
            url: urlParam,
            async: false,
            onSuccess: function (response) {
                //The response text is available in the 'response' variable
                //Set the value of the textarea with the id 'csvResponse' to the response
                // $("serverResponse").value = response;
                var servResponse = response;
                serverResponse = servResponse.replace("\r\n", "\n");
                // $("myResponse").value = serverResponse;
            }
        }).send(); //Don't forget to send our request!
    });
    //displayContents(serverResponse); // keep for debugging
    buildLocationsList(serverResponse);
    displayMap();
}

/**
 * Check for the various File API support.
 */
function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        reader = new FileReader();
        return true;
    } else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return false;
    }
}

/**
 * read text input
 */
function readText(filePath) {
    var output = ""; //placeholder for text output
    if (filePath.files && filePath.files[0]) {
        reader.onload = function (e) {
            output = e.target.result;
            //displayContents(output);
            buildLocationsList(output);
            displayMap();
        };//end onload()
        reader.readAsText(filePath.files[0]);
    }//end if html5 filelist support
    else if (ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
        try {
            reader = new ActiveXObject("Scripting.FileSystemObject");
            var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
            output = file.ReadAll(); //text contents of file
            file.Close(); //close file "input stream"
            displayContents(output);
            buildLocationsList(output);
            displayMap();
        } catch (e) {
            if (e.number == -2146827859) {
                alert('Unable to access local files due to browser security settings. ' +
                        'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
                        'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
            }
        }
    } else { //this is where you could fallback to Java Applet, Flash or similar
        return false;
    }
    return true;
}

/**
 * display content using a basic HTML replacement
 */
function displayContents(txt) {
    var el = document.getElementById('main');
    el.innerHTML = txt; //display output in DOM
}

function buildLocationsList(txt) {
    console.log("start buildLocationsList");
    var locationsRawData = txt.split("\n");
    //loop on array
    var arrayLength = locationsRawData.length;
    for (var i = 0; i < arrayLength; i++) {
        var locations = locationsRawData[i].split("_");
        // if not null
        if (TEST_MODE) {
            //latitude, long., icon, zIndex
            glocations.push([locations[iLat], locations[iLong], locations[iIcon], arrayLength - i]);
            //glocations.push([locations[0], locations[1], 'NoParkingTimeRestriction.png', arrayLength - i]);
        } else {
            glocations.push([locations[iLat], locations[iLong], 'NoParkingTimeRestriction.png', arrayLength - i]);
        }
    }
}

function displayMap() {
    var map = new google.maps.Map(document.getElementById('map'),
            {zoom: 15,
                center: new google.maps.LatLng(45.4701204, -73.64414631),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
    var infowindow = new google.maps.InfoWindow();

    var marker, i;
    var signIcon;    
    for (i = 0; i < glocations.length; i++) {
        var signIconDir = 'images/';
        if (TEST_MODE) {
            var lat = glocations[i][iLat];
            var long = glocations[i][iLong];
            signIcon = signIconDir + glocations[i][iIcon];
           //signIcon = signIconDir + 'NoParkingTimeRestriction.png';
        } else {
            var lat = glocations[i][iLat];
            var long = glocations[i][iLong];
            signIcon = signIconDir + 'NoParkingTimeRestriction.png';
        }
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            //label: signIcon,
            icon: signIcon,
            map: map
        });
        /*
         var markerIcon = {
         url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
         scaledSize: new google.maps.Size(80, 80),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(32, 65),
         labelOrigin: new google.maps.Point(40, 33)
         };
         
         var markerLabel = 'GO!';
         var marker = new google.maps.Marker({
         map: map,
         animation: google.maps.Animation.DROP,
         position: markerLatLng,
         icon: markerIcon,
         label: {
         text: markerLabel,
         color: "#eb3a44",
         fontSize: "16px",
         fontWeight: "bold"
         }
         });
         */
    } //displayMap()

    google.maps.event.addListener(marker, 'click', (function (marker, i) {
        return function () {
            infowindow.setContent(glocations[i][0]);
            infowindow.open(map, marker);
        }
    })(marker, i));
}