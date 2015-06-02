// Bass Note		
// by Philippe Lavoie

window.PL = window.PL || {};
window.PL.BassNote = window.PL.BassNote || {};

/**********/
/* Songs */
/**********/

(function (Songs, $, undefined) {
	Songs.VM = {};
	Songs.List = [];
    
	Songs.Initialize = function () {
        Songs.VM = new SongsViewModel(Songs.List);

        ko.applyBindings(Songs.VM, $("#songs")[0]);
    };
	
	function SongsViewModel(songs) {
		var self = this;
		self.Songs = ko.observableArray();

		_.each(songs, function(song){
			self.Songs.push(new SongViewModel(song));
		});
	}
	
	function SongViewModel(song) {
		var self = this;
		self.Name = ko.observable(song.name);
        self.Data = ko.observable(song.data);
		self.Notes = song.notes;
		self.IsActive = ko.observable(false);
		
		self.Click = function() {
			PL.BassNote.HideAllNotes();
			PL.BassNote.ShowNotes(self.Notes);
            self.IsActive(!self.IsActive());
            
            
            var encoded = PL.TabEncoder.Encode(self.Notes);
            PL.BassNote.Print(encoded);
		};
	}
	
}(PL.Songs = PL.Songs || {}, $));

// Stand By Me - 
PL.Songs.List.push({name: "Stand by me", notes: ['a7', 'd6', 'd7', '--', 'd7', '|',
                                                 'a7', 'd6', 'd7', '--', 'd7', '|',
												 'd7', 'd6', 'a9', '--', 'a9', '|',
												 'a7', 'a9', '--', 'a9', '|',
												 'a9', 'a7', 'a5', '--', 'a5', '|',
												 'a5', 'a9', 'a7', '--', 'a7']});

// Mario Bros #1 - Main Theme
PL.Songs.List.push({name: "Mario Bros", notes: ['d14', 'd14', '-', 'd14','a15', 'd14', '-', 'g12', '-', 'a10', '~',
											    'd10', 'a10', 'e12', '---', 'a12', '-', 'a14', '-', 'a13', 'a12', 'a10', '-', 'd14', 'g12', 'g14', '-', 'g10', 'g12', '-', 'g9', 'd10', 'd12', '-', 'd9' , '~2x',
												'g12', 'g11', 'g10', 'd13', 'g9', '--', 'a10h12', 'd10', 'a12', 'd10', 'd12', '--', 'g12', 'g11', 'g10', 'd13', 'g9', '---', 'g17', 'g17', 'g17', '~']});
