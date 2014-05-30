// Bass Note
// by Philippe Lavoie

window.PL = window.PL || {};

(function (BassNote, $, undefined) {

    // Public Constants

    // Public Properties
    BassNote.ViewModel = null;

    // Private Properties

    // Public Methods
    BassNote.Initialize = function () {

        PL.BassNote.Setup();
    };

    // Setup method. 
    // Create the View Model, Apply the Knockout binding and call the WebService
    BassNote.Setup = function () {
        $(document).ready(function () {
            BassNote.HideAllNotes();

            //              BassNote.ViewModel = new BassNoteViewModel();          
            //              ko.applyBindings(BassNote.ViewModel);

            SetupMenu();

            // Scales
            $(".section-scale li").click(function () {

                if (!$(this).hasClass("active")) {
                    BassNote.ShowScale($(this).attr("data"));
                }

                DisableStatus($("nav li[cmd='notes']"));
                $(".section-scale li").removeClass("active");
                $(this).addClass("active");
            });
        });

        // $(window).resize(function() {
        // 	PL.HoublonVa.RefreshMenuHeight();
        // });
    };

    BassNote.HideAllNotes = function () {
        $(".note").hide();
    };

    BassNote.ShowAllNotes = function () {
        $(".note").show();
    };

    BassNote.ShowScale = function (scale) {

        BassNote.HideAllNotes();

        switch (scale) {
        case "major":
            $("#a4 span, #d4 span, #g4 span, #e5 span, #a5 span, #d6 span, #g6 span, #e7 span, #a7 span, #d7 span, #g7 span").show();
            break;
        case "minor":
            $("#g4 span, #e5 span, #a5 span, #d5 span, #g5 span, #e7 span, #a7 span, #d7 span, #g7 span, #e8 span, #a8 span").show();
            break;
        case "major-pentatonic":
            $("#a4 span, #d4 span, #g4 span, #e5 span, #g6 span, #e7 span, #a7 span, #d7 span").show();
            break;
        case "minor-pentatonic":
            $("#e5 span, #a5 span, #d5 span, #g5 span, #a7 span, #d7 span, #g7 span, #e8 span").show();
            break;
        case "blues":
            $("#e5 span, #a5 span, #d5 span, #g5 span, #a6 span, #a7 span, #d7 span, #g7 span, #e8 span, #g8 span").show();
            break;
        case "dorian":
            $("#d4 span, #g4 span, #e5 span, #a5 span, #d5 span, #g5 span, #e7 span, #a7 span, #d7 span, #g7 span, #e8 span").show();
            break;
        case "phrygian":
            $("#e5 span, #a5 span, #d5 span, #g5 span, #e6 span, #a7 span, #d7 span, #g7 span, #e8 span, #a8 span, #d8 span").show();
            break;
        case "lydian":
            $("#a4 span, #d4 span, #g4 span, #e5 span, #a6 span, #d6 span, #g6 span, #e7 span, #a7 span, #d7 span").show();
            break;
        case "mixolydian":
            $("#a4 span, #d4 span, #g4 span, #e5 span, #a5 span, #d5 span, #g5 span, #e7 span, #a7 span, #d7 span, #g7 span").show();
            break;
        case "harmonic-minor":
            $("#g4 span, #e5 span, #a5 span, #g5 span, #d6 span, #e7 span, #a7 span, #d7 span, #g7 span, #e8 span, #a8 span").show();
            break;
        case "phrygian-dominant":
            $("#e5 span, #a5 span, #d5 span, #e6 span, #g6 span, #a7 span, #d7 span, #g7 span, #a8 span, #d8 span, #e9 span").show();
            break;
        }
    }

    function DisableStatus(element) {
        $(element).removeClass("active");
        $(element).attr("status", "");
    }

    function ToggleElementStatus(element) {
        if ($(element).attr("status") === "active") {
            DisableStatus(element);
        } else {
            $(element).addClass("active");
            $(element).attr("status", "active");
            $(element).siblings().removeClass("active");
            $(element).siblings().attr("status", "");
        }
    }

    function SetupMenu() {
        $("nav li").click(function () {
            switch ($(this).attr("cmd")) {
            case "notes":
                if ($(this).attr("status") === "active") {
                    BassNote.HideAllNotes();
                } else {
                    BassNote.ShowAllNotes();
                }
                ToggleElementStatus(this);
                break;
            case "scales":
                $(".section-scale").toggleClass("hidden");
                ToggleElementStatus(this);
                break;
            }
        });
    }


}(PL.BassNote = PL.BassNote || {}, $));


/***************/
/* Utilities */
/***************/

(function (Utilities, $, undefined) {

    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }

    Number.prototype.toDeg = function () {
        return this * 180 / Math.PI;
    }

    // Public Method
    Utilities.Idfy = function (name) {
        return name.replace(" ", "");
    };

    Utilities.FormatMoney = function (number) {
        if (typeof number === "number") {
            var num = number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return num + " $";
        }
    };

    Utilities.Haversine = function (lat1, lon1, lat2, lon2) {

        // convert decimal degrees to radians 
        var R = 6371; // km 

        var x1 = lat2 - lat1;
        var dLat = x1.toRad();
        var x2 = lon2 - lon1;
        var dLon = x2.toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c);
    };

    Utilities.Bearing = function (lat1, lon1, lat2, lon2) {
        lat1 = lat1.toRad();
        lat2 = lat2.toRad();
        var dLon = (lon2 - lon1).toRad();
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return Math.atan2(y, x).toDeg();
    }

}(PL.Utilities = PL.Utilities || {}, $));


// Start the app
PL.BassNote.Initialize();