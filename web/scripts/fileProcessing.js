/* Get locations file name
 */
var reader; //GLOBAL File Reader object for demo purpose only
var glocations = new Array();
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
//This event is called when the DOM is fully loaded
    window.addEvent("domready", function () {
        //Creating a new AJAX request that will request 'CityLocations.txt' from the current directory
        var csvRequest = new Request({
            url: "files/CitySignInfos.txt",
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
//    displayContents(serverResponse);
    buildLocationsList(serverResponse);
    displayMap();
}

/* Get sign data from server
 * @returns {}
 */
function getSignsInfo() {
//This event is called when the DOM is fully loaded
    window.addEvent("domready", function () {
        //Creating a new AJAX request that will request 'SignsInfo.txt' from the current directory
        var csvRequest = new Request({
            url: "files/SignsInfo.txt.txt",
            async: false,
            onSuccess: function (response) {
                //The response text is available in the 'response' variable
                //Set the value of the textarea with the id 'csvResponse' to the response
                // $("serverResponse").value = response;
                var servResponse = response;
                serverResponse = servResponse.replace("\r\n", "\n");
                buildSignsInfoList(txt)
                //build signsInfoList by loop on lines

                // $("myResponse").value = serverResponse;
            }
        }).send(); //Don't forget to send our request!
    });
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
            //displayContents(output);

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
    var locationsRawData = txt.split("\n");
    //loop on array
    var arrayLength = locationsRawData.length;
    for (var i = 0; i < arrayLength; i++) {
        var locations = locationsRawData[i].split("_");
        // if not null
        glocations.push(['Parking', locations[0], locations[1], locations[2], arrayLength - i]);
    }
}

function buildSignsInfoList(txt) {
    var signRawData = txt.split("\n");
    //loop on array
    var arrayLength = locationsRawData.length;
    for (var i = 0; i < arrayLength; i++) {
        var locations = locationsRawData[i].split("_");
        // if not null
        glocations.push(['Parking', locations[0], locations[1], arrayLength - i]);
    }
}

function displayMap() {
    /*
     var markerIcon = {
     url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
     scaledSize: new google.maps.Size(80, 80),
     origin: new google.maps.Point(0, 0),
     anchor: new google.maps.Point(32,65),
     labelOrigin: new google.maps.Point(40,33)
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
    var map = new google.maps.Map(document.getElementById('map'),
            {   zoom: 15,
                center: new google.maps.LatLng(45.4701204, -73.64414631),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            
    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    var signIcon, signLbl;
    for (i = 0; i < glocations.length; i++) {
        signIcon = null;
        signLbl = glocations[i][3].toString();
        switch (signLbl) {
            case "NoParking":
                signIcon = 'images/NoParking.png';
                break;
            case "ParkingAllowed":
                signIcon = 'images/ParkingAllowed.png';
                break;
            default:
                signIcon = null;
                break;
        }
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(glocations[i][1], glocations[i][2]),
            //label: signLbl,
            icon: signIcon,
            map: map
        });
    }

    google.maps.event.addListener(marker, 'click', (function (marker, i) {
        return function () {
            infowindow.setContent(glocations[i][0]);
            infowindow.open(map, marker);
        }
    })(marker, i));
}