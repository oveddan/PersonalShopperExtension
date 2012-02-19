var PERSONALSHOPPER = PERSONALSHOPPER || {};
PERSONALSHOPPER.APPLICATION = PERSONALSHOPPER.APPLICATION || {};
// global dependency
var debug = debug || PERSONALSHOPPER.UTILITIES.debug;

PERSONALSHOPPER.APPLICATION.productPageMediator = (function (productPageDetector, addToListPrompter, addToListWindow) {
    var writeFoundMatches = function (foundMatches) {
    	debug.log("matches:");
    	for(var i = 0, max = foundMatches.length; i < max; i++){
    		debug.log(foundMatches[i]);
        }        
    },
    buildTrackAddToCartWorker = function(){
        var worker = new Worker('SaveAddToCartClickProductInfo.js');
        return worker;
    },
    trackAddToCartClick = function(button, trackAddToCartWorker){
        debug.log(['tracking click of:',button]);
        var productInfo = productPageDetector.getProductInfoAroundAddToCartButton(button);
        if(productInfo){
            trackAddToCartWorker.postMessage(productInfo);
        }
    },
	Constr = function(config){
		this.config = config;
	};
	Constr.prototype = {
		constructor : PERSONALSHOPPER.APPLICATION.productPageMediator,
		findButtons : function(){
	        var addToCartMatches = productPageDetector.getAddToCartMatches(document.body);
	        if(addToCartMatches.hasMatch()){
	        	writeFoundMatches(addToCartMatches.getTextMatches());
	        	writeFoundMatches(addToCartMatches.getElementMatches());
	       	}
            return addToCartMatches;
		},
		detectAndNotifyIfProductPage : function(){
			var isProductPage = productPageDetector.isProductPage(document.body);
			debug.log('Is Product Page?');
			debug.log(isProductPage);				
			if(isProductPage){
				var productTitle = productPageDetector.getProductName(document.body);
				var self = this;
				var origFn = this.openAddToListWindow;
				var prompter = new addToListPrompter(document.body, productTitle);
				var openAddToListWindowFunction = function() {
					return origFn.apply(self, [prompter, productTitle]);
				};
				prompter.promptToAddToList(openAddToListWindowFunction);
			}
		},
        trackAddToCartClicks : function(addToCartButtons){
            var trackAddToCartWorker = buildTrackAddToCartWorker();
            for(var i = 0, max = addToCartButtons.length; i < max; i++){
                var addToCartButton = addToCartButtons[i];
                var currentOnClick = addToCartButton.onclick;
                addToCartButton.onclick = function(){
                    trackAddToCartClick(this, trackAddToCartWorker);
                    if(currentOnClick)
                        currentOnClick();
                }
            }
        },
		openAddToListWindow : function(addToListPrompter, productTitle){
			debug.log(productTitle);
			addToListPrompter.closePromptToAddToList();
			scrapedProductInfo = productPageDetector.getProductInfo();
			var listWindow = new addToListWindow(document.body);
			listWindow.openAndLoadProduct(scrapedProductInfo);
		}
	};
    return Constr;
})(PERSONALSHOPPER.ADDTOLIST.productPageDetector,
	PERSONALSHOPPER.BOOKMARKLETS.addToListPrompter,
	PERSONALSHOPPER.BOOKMARKLETS.addToListWindow);