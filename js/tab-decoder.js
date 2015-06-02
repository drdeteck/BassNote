// Bass Note		
// by Philippe Lavoie

window.PL = window.PL || {};

/***************/
/* Tab Encoder */
/***************/
(function (TabEncoder, $, undefined) {
    var g = 0;
    var d = 1;
    var a = 2; 
    var e = 3;
    
    function TabAppend(tab, text){
        for (var index = 0; index < tab.length; index++) {
            tab[index] += text;
        }
    }    
    
    function InitTab() {
        var tab = ["G", "D", "A", "E"];
        TabAppend(tab, "|-");
        return tab;
    }
    
    TabEncoder.Encode = function(notes) {
        var tab = InitTab();
        
        var tabs = "";
           
        _.each(notes, function(note, index){
            var str = note[0];
            var nbr = note.substr(1, note.length - 1);
            
            switch (str) {
                case 'g':
                    tab[g] += (nbr + "-");
                    tab[d] += "-".repeat(note.length);
                    tab[a] += "-".repeat(note.length);
                    tab[e] += "-".repeat(note.length);
                    break;
                case 'd':
                    tab[g] += "-".repeat(note.length);
                    tab[d] += (nbr + "-");
                    tab[a] += "-".repeat(note.length);
                    tab[e] += "-".repeat(note.length);
                    break;
                case 'a':
                    tab[g] += "-".repeat(note.length);
                    tab[d] += "-".repeat(note.length);
                    tab[a] += (nbr + "-");
                    tab[e] += "-".repeat(note.length);
                    break;
                case 'e':
                    tab[g] += "-".repeat(note.length);
                    tab[d] += "-".repeat(note.length);
                    tab[a] += "-".repeat(note.length);
                    tab[e] += (nbr + "-");
                    break;
                case '|':
                    TabAppend(tab, "|-");
                    break;
                case '-':
                    _(note.length).times(function(){TabAppend(tab, "-")});
                    break;
                case '~':
                    TabAppend(tab, "|");
                    tabs += tab[g] + "  " + nbr + "<br>" + tab[d] + "<br>" + tab[a] + "<br>" + tab[e] + "<br><br>";
                    tab = InitTab();
                    break;
            }
        });
        
        tabs += tab[g] + "<br>" + tab[d] + "<br>" + tab[a] + "<br>" + tab[e];
        return tabs;
    };
}(PL.TabEncoder = PL.TabEncoder || {}, $));

/***************/
/* Tab Decoder */
/***************/
(function (TabDecoder, $, undefined) {

    TabDecoder.ViewModel = null;
    
    TabDecoder.Setup = function(url, selector) {
        $(document).ready(function () {
            TabDecoder.ViewModel = new TabDecoderViewModel();
            
            TabDecoder.ParseText(url);
            
            ko.applyBindings(TabDecoder.ViewModel, $(selector)[0]);
            
        });
    };
    
    TabDecoder.ParseText = function(data) {
        var stringsRaw = data.split("\r\n");
                
        if (stringsRaw.length >= 4) {
        
            TabDecoder.ViewModel.String1Label(FirstLetter(stringsRaw[0]));
            TabDecoder.ViewModel.String2Label(FirstLetter(stringsRaw[1]));
            TabDecoder.ViewModel.String3Label(FirstLetter(stringsRaw[2]));
            TabDecoder.ViewModel.String4Label(FirstLetter(stringsRaw[3]));
            
            TabDecoder.ViewModel.String1Notes(Notes(stringsRaw[0]));
            TabDecoder.ViewModel.String2Notes(Notes(stringsRaw[1]));
            TabDecoder.ViewModel.String3Notes(Notes(stringsRaw[2]));
            TabDecoder.ViewModel.String4Notes(Notes(stringsRaw[3]));
        }        
    };
    
    function FirstLetter(data) {
        var regex = /[a-zA-Z]/;
        
        var result = regex.exec(data);
        
        return result[0];
    }
    
    function Notes(data) {
        var regex = /[1-9]|-/;
        
        var result = regex.exec(data);

        return data.substr(result.index, data.length - result.index);
    }
    
    function TabDecoderViewModel() {
        var self = this;
        
        self.String1Label = ko.observable();
        self.String2Label = ko.observable();
        self.String3Label = ko.observable();
        self.String4Label = ko.observable();
        
        self.String1Notes = ko.observableArray();
        self.String2Notes = ko.observableArray();
        self.String3Notes = ko.observableArray();
        self.String4Notes = ko.observableArray();
    }


}(PL.TabDecoder = PL.TabDecoder || {}, $));