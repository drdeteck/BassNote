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
        $(document).ready(function()
                          {
                              BassNote.ViewModel = new BassNoteViewModel();
                              ko.applyBindings(BassNote.ViewModel);
                          });

        // $(window).resize(function() {
        // 	PL.HoublonVa.RefreshMenuHeight();
        // });
    };

    BassNote.HideAllNotes = function() {
        $(".note").hide();
    };


} (PL.BassNote = PL.BassNote || {}, $));


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

} (PL.Utilities = PL.Utilities || {}, $));


// Start the app
PL.BassNote.Initialize();
