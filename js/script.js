// Bass Note		
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
        
        self.LanguageClick = function(viewModel, event) {
            $(".language .btn").removeClass("active");
            $(event.target).addClass("active");
            PL.FretBoard.Language($(event.target).attr("data"));
        };
    }

}(PL.BassNote = PL.BassNote || {}, $));

/*************/
/* FretBoard */
/*************/

(function (FretBoard, $, undefined) {

    FretBoard.VM = null;

	// The language of the notes labels
    FretBoard.Language = ko.observable("midi");

    // Nb Fret to put on the board
    FretBoard.NbFrets = 24;

    // Nb of octave to generate the notes list. 10 is good with the Midi range.
    FretBoard.NbOctaves = 10;

    FretBoard.DotFrets = [3, 5, 7, 9, 15, 17, 19, 21];
    FretBoard.DoubleDotFrets = [12, 24];

    // Base note information on the first midi octave
    FretBoard.BaseNotes = [{ name: "C", english: "c", french: "do", midi: 0, octave: 0 },
                       { name: "C#", english: "c#", french: "do#", midi: 1, octave: 0 },
                       { name: "D", english: "d", french: "ré", midi: 2, octave: 0 },
                       { name: "D#", english: "d#", french: "ré#", midi: 3, octave: 0 },
                       { name: "E", english: "e", french: "mi", midi: 4, octave: 0 },
                       { name: "F", english: "f", french: "fa", midi: 5, octave: 0 },
                       { name: "F#", english: "f#", french: "fa#", midi: 6, octave: 0 },
                       { name: "G", english: "g", french: "sol", midi: 7, octave: 0 },
                       { name: "G#", english: "g#", french: "sol#", midi: 8, octave: 0 },
                       { name: "A", english: "a", french: "la", midi: 9, octave: 0 },
                       { name: "A#", english: "a#", french: "la#", midi: 10, octave: 0 },
                       { name: "B", english: "b", french: "si", midi: 11, octave: 0 }];

    // Strings to support. Possible to extand to a 5 or 6 stringed (Bass and or guitar)
    FretBoard.Strings = [{ type: "note", name: "g", css: "row-string string-g", note: 43, color: "orange" },
                         { type: "note", name: "d", css: "row-string string-d", note: 38, color: "blue" },
                         { type: "note", name: "a", css: "row-string string-a", note: 33, color: "yellow" },
                         { type: "note", name: "e", css: "row-string string-e", note: 28, color: "red" }];

    // Method to generates all notes objects
    FretBoard.GenerateNotes = function (baseNotes, octaves) {
        var notes = [];
        var nbNotes = baseNotes.length;

        _(octaves).times(function (n) {
            _.each(baseNotes, function (note) {
                clone = JSON.parse(JSON.stringify(note));
                clone.midi = clone.midi + (n * nbNotes);
                clone.octave = n + 1;
                notes.push(clone);
            });
        });

        return notes;
    }

    // Notes list
    FretBoard.Notes = FretBoard.GenerateNotes(FretBoard.BaseNotes, FretBoard.NbOctaves);

    FretBoard.Initialize = function () {
        FretBoard.VM = new FretBoardViewModel();

        ko.applyBindings(FretBoard.VM, $("#fret-board")[0]);
    };

    function FretBoardViewModel() {
        var self = this;

        self.Strings = ko.observableArray(FretBoard.Strings);

        self.BoardRows = ko.computed(function () {
            var rows = [];
            var isFirst = true;
            var nbStrings = self.Strings().length;

			// First Edge row
            rows.push(new RowViewModel({ type: "board", css: "row edge", color: "" }))
            
			_.each(self.Strings(), function (string, index) {
				var css = "row";
                if (index + 3 === nbStrings) { css = "row dotted" };
                rows.push(new RowViewModel(string))
                rows.push(new RowViewModel({ type: "board", css: css, color: "" }))
            });
			
			// Set the last edge
			_.last(rows).Css("row edge");
			
			// Numbers
			rows.push(new RowViewModel({ type: "number", css: "row-number", color: "", note: 1 }))
            
			return rows;
        });
    }

    function RowViewModel(string) {
        var self = this;

        self.Css = ko.observable(string.css);

        self.Frets = ko.computed(function () {
            var frets = [];

            if (string.type != "note") {

                // Board row
                frets.push({ Css: "neck", Template: string.type, Name: "" });
                frets.push({ Css: "edge", Template: string.type, Name: "" });

                _(PL.FretBoard.NbFrets).times(function (index) {
                    // Do dots
                    if (string.css.indexOf("dotted") > -1) {
                        if (_.find(FretBoard.DotFrets, function (num) { return num === index + 1; })) {
                            frets.push({ Css: "wood", Template: "dot", Name: "" });
                        }
                        else if (_.find(FretBoard.DoubleDotFrets, function (num) { return num === index + 1; })) {
                            frets.push({ Css: "wood", Template: "doubledot", Name: "" });
                        }
                        else {
                            frets.push({ Css: "wood", Template: string.type, Name: index + 1 });
                        }
                        frets.push({ Css: "fret", Template: string.type, Name: "" });
                    }
                    else {
                        frets.push({ Css: "wood", Template: string.type, Name: index + 1 });
                        frets.push({ Css: "fret", Template: string.type, Name: "" });
                    }
                });
            }
            else {

                // String row
                var note = FretBoard.Notes[string.note];
                note.string = string.name;
                frets.push(new NoteViewModel("note", note));
                frets.push({ Css: "string", Template: "board" });

                _(PL.FretBoard.NbFrets).times(function (index) {
                    var note = FretBoard.Notes[string.note + index + 1];
                    note.string = string.name;
                    frets.push(new NoteViewModel("note", note));
                    frets.push({ Css: "string", Template: "board" });
                });
            }


            return frets;
        });

        self.Template = function (element) {

            return element.Template + "-template";
        };
    }

    function NoteViewModel(css, note) {
        var self = this;

        self.Css = ko.observable(css);
        self.Id = ko.observable(note.string + "-" + note.midi);
        self.Name = ko.observable();
        self.Template = css

        self.Name = ko.computed(function () {
            if (PL.FretBoard.Language() === "fr") {
                return note.french;
            }
            else if (PL.FretBoard.Language() === "midi") {
                return note.midi;
            }
            return note.english;
        });

        self.Play = function () {
            PL.Sound.PlayNote(note.midi);
        };
    }

}(PL.FretBoard = PL.FretBoard || {}, $));

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

}(PL.Utilities = PL.Utilities || {}, $));


// Start the app
PL.BassNote.Initialize();