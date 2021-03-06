/* global PL */
// Bass Note		
// by Philippe Lavoie

window.PL = window.PL || {};
window.PL.BassNote = window.PL.BassNote || {};

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
                var clone = JSON.parse(JSON.stringify(note));
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
    
    FretBoard.DeserializeTabNote = function (tabNote) {
        
        var note = {"midi": 0, "string": "g"};
        var regex = /([a-z])([0-9]+)/; 
        var m;
        
        if ((m = regex.exec(tabNote)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            console.log(m[1] + "  " + m[2]);
            note.string = m[1];
            note.midi = _.where(FretBoard.Strings, {name: note.string})[0].note + parseInt(m[2]);
        }
        
        return note;
    }

    function FretBoardViewModel() {
        var self = this;

        self.Strings = ko.observableArray(FretBoard.Strings);

        self.BoardRows = ko.computed(function () {
            var rows = [];
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