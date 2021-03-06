﻿// Bass Note		
// by Philippe Lavoie

window.PL = window.PL || {};

(function (BassNote, $, undefined) {

    // Public Constants

    // Public Properties
    BassNote.MenuViewModel = null;

    // Private Properties

    // Public Methods
    BassNote.Initialize = function () {

        $(document).ready(function () {

            BassNote.MenuViewModel = new MenuViewModel();
            ko.applyBindings(BassNote.MenuViewModel, $("nav ul")[0]);

            PL.FretBoard.Initialize();
			PL.Scales.Initialize();
			PL.Songs.Initialize();
            PL.Sound.Initialize();

            //PL.TabParser.Setup(tab, ".section-input");
        });
    };

    BassNote.HideAllNotes = function () {
        $(".note").hide();
    };

    BassNote.ShowAllNotes = function () {
        $(".note").show();
    };

	BassNote.ShowNotes = function (notes) {
		_.each(notes, function(note){
			var css = note.string + "-" + note.midi;
			$("#" + css + ">.note").show();
		});
	}
	
    BassNote.Print = function(data) {
        $("#book").html(data);
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
   
    function MenuViewModel() {
        var self = this;
        
        self.NotesClick = function(viewModel, event) {
            if ($(event.target).attr("status") === "active") {
                BassNote.HideAllNotes();
            } else {
                BassNote.ShowAllNotes();
            }
            ToggleElementStatus(event.target);
        };
        
        self.ScalesClick = function(viewModel, event) {
            $(".section-scale").toggleClass("hidden");
            ToggleElementStatus(event.target);
        };
        
        self.SongsClick = function(viewModel, event) {
            $(".section-songs").toggleClass("hidden");
            ToggleElementStatus(event.target);
        };
        
        self.DecoderClick = function(viewModel, event) {
            $("#book").toggleClass("hidden");
            $("#decoder").toggleClass("hidden");
            ToggleElementStatus(event.target);
        };
        
        self.LanguageClick = function(viewModel, event) {
            $(".language .btn").removeClass("active");
            $(event.target).addClass("active");
            PL.FretBoard.Language($(event.target).attr("data"));
        };
    }

}(PL.BassNote = PL.BassNote || {}, $));

/**********/
/* Scales */
/**********/

(function (Scales, $, undefined) {
	Scales.VM = {};
	Scales.List = [];
	Scales.List.push({name: "Ionian Major", notes: [{midi: 36, string: "a"}, {midi: 38, string: "a"}, {midi: 40, string: "d"}, {midi: 41, string: "d"},{midi: 43, string: "d"},{midi: 45, string: "g"}, {midi: 47, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Dorian", notes: [{midi: 36, string: "a"}, {midi: 38, string: "a"}, {midi: 39, string: "a"}, {midi: 41, string: "d"},{midi: 43, string: "d"},{midi: 45, string: "g"}, {midi: 46, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Phrygian", notes: [{midi: 36, string: "a"}, {midi: 37, string: "a"}, {midi: 39, string: "a"}, {midi: 41, string: "d"},{midi: 43, string: "d"},{midi: 44, string: "d"}, {midi: 46, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Lydian", notes: [{midi: 36, string: "a"}, {midi: 38, string: "a"}, {midi: 40, string: "d"}, {midi: 42, string: "d"},{midi: 43, string: "d"},{midi: 45, string: "g"}, {midi: 47, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Mixolydian", notes: [{midi: 36, string: "a"}, {midi: 38, string: "a"}, {midi: 40, string: "d"}, {midi: 41, string: "d"},{midi: 43, string: "d"},{midi: 45, string: "g"}, {midi: 46, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Aeolian Minor", notes: [{midi: 36, string: "a"}, {midi: 38, string: "a"}, {midi: 39, string: "a"}, {midi: 41, string: "d"},{midi: 43, string: "d"},{midi: 44, string: "d"}, {midi: 46, string: "g"},{midi: 48, string: "g"}]});
	Scales.List.push({name: "Locrian ", notes: [{midi: 36, string: "a"}, {midi: 37, string: "a"}, {midi: 39, string: "a"}, {midi: 41, string: "d"},{midi: 42, string: "d"},{midi: 44, string: "d"}, {midi: 46, string: "g"},{midi: 48, string: "g"}]});
	
	Scales.Initialize = function () {
        Scales.VM = new ScalesViewModel(Scales.List);

        ko.applyBindings(Scales.VM, $("#scales")[0]);
    };
	
	function ScalesViewModel(scales) {
		var self = this;
		self.Scales = ko.observableArray();

		_.each(scales, function(scale){
			self.Scales.push(new ScaleViewModel(scale));
		});
	}
	
	function ScaleViewModel(scale) {
		var self = this;
		self.Name = ko.observable(scale.name);
		self.Notes = scale.notes;
		self.State = ko.observable("");
		
		self.Click = function() {
			PL.BassNote.HideAllNotes();
			PL.BassNote.ShowNotes(self.Notes);
		};
	}
	
}(PL.Scales = PL.Scales || {}, $));

/*********/
/* Sound */
/*********/

(function (Sound, $, undefined) {

    // Public Properties
    Sound.delay = 0; // play one note every quarter second
    Sound.velocity = 127; // how hard the note hits

    Sound.Initialize = function () {

        MIDI.loadPlugin({
            soundfontUrl: "./sound/",
            instrument: "electric_bass_finger",
            callback: function () {
                MIDI.programChange(0, 33); // Set Bass Finger in MIDI program
                MIDI.setVolume(0, 255); // Max volume with no distortion ?
            }
        });
    }

    Sound.Check = function () {

    }

    Sound.PlayNote = function (note) {
        MIDI.noteOn(0, note, Sound.velocity, Sound.delay);
        MIDI.noteOff(0, note, Sound.delay + 0.5);
    }

}(PL.Sound = PL.Sound || {}, $));

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

    // Prototype
    String.prototype.repeat = function( num )
    {
        return new Array( num + 1 ).join( this );
    }

}(PL.Utilities = PL.Utilities || {}, $));


// Start the app
PL.BassNote.Initialize();
