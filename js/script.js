// The Dram Project
// by Philippe Lavoie

window.PL = window.PL || {};

(function (HoublonVa, $, undefined) {

    // Public Constants
    HoublonVa.CATEGORY_MICRO = 1;
    HoublonVa.CATEGORY_PUB = 2;
    HoublonVa.CATEGORY_MARKET = 3;
    
    // Public Properties
    HoublonVa.ViewModel = null;

    // Private Properties

    // Public Methods
    HoublonVa.Initialize = function () {

        PL.HoublonVa.Setup();
    };

    // Setup method. 
    // Create the View Model, Apply the Knockout binding and call the WebService
    HoublonVa.Setup = function () {
        $(document).ready(function()
                          {
                              // Setup footer
                              $("#footer-button").click(PL.HoublonVa.RunFooterAnimation);

                              // Setup Filter toggle button
                              $(".filter").click(PL.HoublonVa.ToggleFilters);

                              // Knockout apply bindings
                              var callbacks = [PL.HoublonVa.HideLoadingMask];

                              callbacks.unshift(PL.GoogleMaps.Resize);
                              // callbacks.unshift(PL.HoublonVa.RefreshMenuHeight);

                              HoublonVa.ViewModel = new HoublonVaViewModel(callbacks);
                              ko.applyBindings(HoublonVa.ViewModel);

                              PL.GoogleMaps.Initialize();

                              // Setup Data
                              PL.SpreadSheet.Key = "0AoKnDojyuN8YdEpjVHpZYzZkYW1FdmhzbTZJYjlITGc&sheet=data";
                              PL.SpreadSheet.GetData("select%20*%20order%20by%20A%2C%20B%2C%20C", HoublonVa.ViewModel.MapperCallback);
                          });

        // $(window).resize(function() {
        // 	PL.HoublonVa.RefreshMenuHeight();
        // });
    };

    HoublonVa.IsTablet = function() {
        return $(window).width() <= 1400 && $(window).width() > 480;
    };

    HoublonVa.IsFullSize = function() {
        return $(window).width() > 1400;
    };

    // Resize the left menu size
    // HoublonVa.RefreshMenuHeight = function() {
    // 	var menuPadding = $("#nav-list").outerHeight(true) - $("#nav-list").height();
    // 	$("#nav-list").height($(window).height() - (menuPadding + $("#nav-list").offset().top));
    // };

    HoublonVa.RunFooterAnimation = function(doOpen) {
        var footerOpenHeight = 250,
            footerCloseHeight = 40,
            footerHeight = 0;

        if ((typeof doOpen != 'boolean' && $("#footer").height() === footerOpenHeight) || (typeof doOpen === 'boolean' && !doOpen)) {
            footerHeight = footerCloseHeight;
        }
        else {
            footerHeight = footerOpenHeight;
        }

        $("#footer").animate( { height: footerHeight }, {
            queue: false,
            duration: 500,
            complete: function () {
                $("#footer-button i").toggleClass("icon-chevron-up");
                $("#footer-button i").toggleClass("icon-chevron-down");
            }
        });
    };

    HoublonVa.ScrollTo = function() {
        if (location.hash) {
            var regex = /#(\w+\s?\w+)&?(\d)?/g;
            var result = regex.exec(location.hash);

            if (result.length > 2) {
                var distillery = result[1].replace(" ", "");
                var bottleIndex = result[2];

                // Scroll vertically
                var menuElement = $("[href=#" + distillery + "]");
                var num = $('#paging a').index(menuElement);
                var scrollHeight = PL.HoublonVa.IsTablet() ? ($(window).height() - 18) * num : $("#wrapper").height() * num;

                $("#" + distillery).parent().animate({scrollTop: scrollHeight}, 'fast');

                // Scroll horizontally
                if (PL.HoublonVa.IsTablet()) {
                    $($("#" + distillery + " ul li").get(bottleIndex)).show("slide", { direction: "right" }, 500);
                    $($("#" + distillery + " ul li").get(0)).hide("slide", { direction: "left" }, 500);
                }
                else {
                    $("#" + distillery + " ul").roundabout("animateToChild", bottleIndex);
                }

                // Select menu
                $("#paging li").removeClass("active");
                menuElement.parent().addClass("active");

                // Scroll to the menu element if necessary
                if (!isScrolledIntoView(menuElement)) {
                    var menuElementTop = menuElement.offset().top - $("#nav-list").offset().top;
                    $("#nav-list").animate({scrollTop: menuElementTop}, 'fast');
                }
            }
        }
    }

    HoublonVa.HideLoadingMask = function() {
        $("#mask").hide();
    }

    HoublonVa.ToggleFilters = function() {
        if ($(this).hasClass("active"))
        { 
            $(this).removeClass("active")
            HoublonVa.ViewModel.ResetFilter();
        }
        else
        {
            $(".filter").removeClass("active");
            $(this).addClass("active");
            var category = parseInt($(this).attr("category"));
            HoublonVa.ViewModel.FilterByType(category);
        }
    }

    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
                && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
    }

} (PL.HoublonVa = PL.HoublonVa || {}, $));


/***************/
/* Utilities */
/***************/

(function (Utilities, $, undefined) {

    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }

    Number.prototype.toDeg = function() {
        return this * 180 / Math.PI;
    }

    // Public Method
    Utilities.Idfy = function (name)
    {
        return name.replace(" ", "");
    };

    Utilities.FormatMoney = function(number){
        if (typeof number === "number") {
            var num = number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return num + " $";
        }
    };

    Utilities.Haversine = function(lat1, lon1, lat2, lon2){

        // convert decimal degrees to radians 
        var R = 6371; // km 

        var x1 = lat2-lat1;
        var dLat = x1.toRad();  
        var x2 = lon2-lon1;
        var dLon = x2.toRad();  
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *  Math.sin(dLon/2) * Math.sin(dLon/2);  
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return (R * c); 
    };

    Utilities.Bearing = function (lat1, lon1, lat2, lon2) {
        lat1 = lat1.toRad(); lat2 = lat2.toRad();
        var dLon = (lon2-lon1).toRad();
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        return Math.atan2(y, x).toDeg();
    }

    Utilities.GetLocation = function() {
        if (Modernizr.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                PL.HoublonVa.ViewModel().Longitude(position.coords.longitude);
                PL.HoublonVa.ViewModel().Latitude(position.coords.latitude);
            });
        } else {
            // no native support; maybe try a fallback?
        }
    }

} (PL.Utilities = PL.Utilities || {}, $));


/***************/
/* SpreadSheet */
/***************/

(function (SpreadSheet, $, undefined) {

    // Public Properties
    SpreadSheet.Key = "";
    SpreadSheet.Data = {};

    // Private Properties
    var vizPreKeyUrl = "https://spreadsheets.google.com/tq?key=";
    var vizArgsKey = "&tq=";

    // Public Methods
    SpreadSheet.GetData = function (args, callback)
    {
        // Args testing
        if (!args)
        {
            args = "";
        }
        else
        {
            args = vizArgsKey + args;
        }

        var url = vizPreKeyUrl + SpreadSheet.Key + args;

        $.get(url, callback, "text");
    };

    SpreadSheet.CleanVizResponse = function(data)
    {
        try
        {
            var startIndex = data.indexOf("{");
            return $.parseJSON(data.substr(startIndex, (data.length - startIndex - 2))).table.rows;
        }
        catch(e)
        {
            // We report an error, and show the erronous JSON string (we replace all " by ', to prevent another error)
            document.data = data;
            console.log(data);
            console.log(e);
        }

        return "";
    }

} (PL.SpreadSheet = PL.SpreadSheet || {}, $));

/***************/
/* Google Maps */
/***************/

(function (GoogleMaps, $, undefined) {

    GoogleMaps.Map = {};
    GoogleMaps.Longitude = ko.observable(-73.570986);
    GoogleMaps.Latitude = ko.observable(45.509527);
    GoogleMaps.OpenedInfoWindow = {};

    GoogleMaps.Initialize = function() {
        $(document).ready(function() {
            var mapOptions = {
                center: new google.maps.LatLng(GoogleMaps.Latitude(), GoogleMaps.Longitude()),
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            GoogleMaps.Map = new google.maps.Map($("#map-canvas")[0], mapOptions);

            if (Modernizr.geolocation) {
                navigator.geolocation.getCurrentPosition(PL.GoogleMaps.PositionCallback);
            }
        });
    };

    GoogleMaps.Resize = function () {
        google.maps.event.trigger(GoogleMaps.Map, "resize");
        GoogleMaps.Map.setCenter(new google.maps.LatLng(GoogleMaps.Latitude(), GoogleMaps.Longitude()));
        GoogleMaps.Map.setZoom(8);
    }

    GoogleMaps.AddYellowMarker = function(longitude, latitude, title) {
        return GoogleMaps.AddMarker(longitude, latitude, title,  "img/logo32.png");
    }

    GoogleMaps.AddRedMarker = function(longitude, latitude, title) {
        return GoogleMaps.AddMarker(longitude, latitude, title,  "img/logo-test-tap32.png");
    }

    GoogleMaps.AddGreenMarker = function(longitude, latitude, title) {
        return GoogleMaps.AddMarker(longitude, latitude, title,  "img/logo-test-market32.png");
    }

    GoogleMaps.AddMarker = function(longitude, latitude, title, icon) {
        return new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: GoogleMaps.Map,
            title: title,
            icon: icon
        });
    };

    GoogleMaps.OpenInfoWindow = function(infoWindow, marker) {
        if (GoogleMaps.OpenedInfoWindow && PL.GoogleMaps.OpenedInfoWindow.close) {
            GoogleMaps.OpenedInfoWindow.close();
        }

        GoogleMaps.OpenedInfoWindow = infoWindow;
        GoogleMaps.OpenedInfoWindow.open(GoogleMaps.Map, marker);
    }

    GoogleMaps.Center = function(latlng) {	
        GoogleMaps.Map.setCenter(latlng);
        GoogleMaps.Map.setZoom(15);
    }

    GoogleMaps.PositionCallback = function(position) {
        GoogleMaps.Longitude(position.coords.longitude);
        GoogleMaps.Latitude(position.coords.latitude);

        var curentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        GoogleMaps.Center(curentLatLng);

        var currentPosition = new google.maps.Marker({
            position: curentLatLng,
            map: GoogleMaps.Map,
            title: "You are here",
        });

        PL.HoublonVa.ViewModel.SortPlaces();
    };

} (PL.GoogleMaps = PL.GoogleMaps || {}, $));

// Start the app
PL.HoublonVa.Initialize();