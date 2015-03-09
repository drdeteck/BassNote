(function (TabParser, $, undefined) {

    TabParser.ViewModel = null;
    
    TabParser.Setup = function(url, selector) {
        $(document).ready(function () {
            TabParser.ViewModel = new TabParserViewModel();
            
            TabParser.ParseText(url);
            
            ko.applyBindings(TabParser.ViewModel, $(selector)[0]);
            
        });
    };
    
    TabParser.ParseText = function(data) {
        var stringsRaw = data.split("\r\n");
                
        if (stringsRaw.length >= 4) {
        
            TabParser.ViewModel.String1Label(FirstLetter(stringsRaw[0]));
            TabParser.ViewModel.String2Label(FirstLetter(stringsRaw[1]));
            TabParser.ViewModel.String3Label(FirstLetter(stringsRaw[2]));
            TabParser.ViewModel.String4Label(FirstLetter(stringsRaw[3]));
            
            TabParser.ViewModel.String1Notes(Notes(stringsRaw[0]));
            TabParser.ViewModel.String2Notes(Notes(stringsRaw[1]));
            TabParser.ViewModel.String3Notes(Notes(stringsRaw[2]));
            TabParser.ViewModel.String4Notes(Notes(stringsRaw[3]));
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
    
    function TabParserViewModel() {
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


}(PL.TabParser = PL.TabParser || {}, $));