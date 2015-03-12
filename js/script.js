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

        $(document).ready(function () {

            PL.FretBoard.Initialize();

            PL.Sound.Initialize();

            BassNote.HideAllNotes();

            //              BassNote.ViewModel = new BassNoteViewModel();          
            //              ko.applyBindings(BassNote.ViewModel);

            SetupMenu();

            // Setup Scales
            $(".section-scale li").click(function () {

                if (!$(this).hasClass("active")) {
                    BassNote.ShowScale($(this).attr("data"));
                }

                DisableStatus($("nav li[cmd='notes']"));
                $(".section-scale li").removeClass("active");
                $(this).addClass("active");
            });

            // Dummy Data for input
            var tab = "G|---------------------------|\r\nD|---------------------------|\r\nA|-33333---------------------|\r\nE|--------33333-55555-11111--|";

            PL.TabParser.Setup(tab, ".section-input");
        });
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
            case "base":
                $("#a4 span, #d4 span, #g4 span, #e5 span, #a5 span, #d6 span, #g6 span, #e7 span, #a7 span, #d7 span, #g7 span").show();
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
                case "band":
                    PL.Sound.PlayNote(50);
                    break;
            }
        });
    }

}(PL.BassNote = PL.BassNote || {}, $));

/*********/
/* Sound */
/*********/

(function (FretBoard, $, undefined) {

    FretBoard.VM = null;

    FretBoard.Language = ko.observable("fr");

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

    // Strgin to support. Possible to extand to a 5 or 6 stringed (Bass and or guitar)
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

            _.each(self.Strings(), function (string, index) {
                if (isFirst) {
                    isFirst = false;
                    rows.push(new RowViewModel({ type: "board", css: "row", color: "" }))
                }
                var css = "row";
                if (index + 3 === nbStrings) { css = css + " dotted" };
                rows.push(new RowViewModel(string))
                rows.push(new RowViewModel({ type: "board", css: css, color: "" }))

            });

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
                frets.push({ Css: "neck", Template: string.type });
                frets.push({ Css: "edge", Template: string.type });

                _(PL.FretBoard.NbFrets).times(function (index) {
                    // Do dots
                    if (string.css.indexOf("dotted") > -1) {
                        if (_.find(FretBoard.DotFrets, function (num) { return num === index + 1; })) {
                            frets.push({ Css: "wood", Template: "dot" });
                        }
                        else if (_.find(FretBoard.DoubleDotFrets, function (num) { return num === index + 1; })) {
                            frets.push({ Css: "wood", Template: "doubledot" });
                        }
                        else {
                            frets.push({ Css: "wood", Template: string.type });
                        }
                        frets.push({ Css: "fret", Template: string.type });
                    }
                    else {
                        frets.push({ Css: "wood", Template: string.type });
                        frets.push({ Css: "fret", Template: string.type });
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
            return note.english;
        });

        self.Play = function () {
            PL.Sound.PlayNote(note.midi);
        };
    }

}(PL.FretBoard = PL.FretBoard || {}, $));

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