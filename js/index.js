(function(root, $) {'use strict';

	var gui = require('nw.gui'),
		win = gui.Window.get(),
		fs = require('fs'),
		request = require('request'),
		http = require('http'),
		path = require('path'),
		url = require('url'),
		config = require('./config.json');
		
	gui.App.addOriginAccessWhitelistEntry("https://instagram.com", "app", "htdocs", true);
	
	hello.init({
			instagram : config.CLIENT_ID
		},{
			scope : 'photos',
			display: 'page',
			redirect_uri: config.REDIRECT_URI
	});
	
	var getPhotos = function(network){
		hello(network).login().then(function(){
			alert("You are signed in to Instagram");
		}, function(e){
			alert("Signin error: " + e.error.message );
		});
	};
	
	var download = function(uri, filename, callback){
		request.head(uri, function(err, res, body){
    		console.log('content-type:', res.headers['content-type']);
    		console.log('content-length:', res.headers['content-length']);
    		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    	});
    };
    
    var mkdirSync = function (path) {
    	try {
    		fs.mkdirSync(path);
    	} catch(e) {
    		if ( e.code != 'EEXIST' ) throw e;
    	}
    };
	
	if(hello('instagram').getAuthResponse() && localStorage.token && localStorage.token !== 'null'){		
		$('.result').removeClass('hide');
		$('#login').addClass('hide');
		
		hello('instagram').api("me/photos").then(function(json){
			$('.loading-icon').addClass('hide');
			$('.backup').removeClass('hide');
			
			for(var i=0; i<json.data.length; i++){
				$('#show-photos .row').append('<div class="col-xs-6 col-md-3"><a href="'+ json.data[i].link +'" class="thumbnail"><img class="my-photo" src="'+ json.data[i].images.low_resolution.url +'" data-name="'+ json.data[i].created_time + '" data-download="'+ json.data[i].picture +'"></a></div>').hide().fadeIn();
			}
		}, function(e){
		    alert("Whoops! " + e.error.message );
		});
		
		
		$('#file-chooser').change(function(evt) {
			var savePath = $(this).val();
      		mkdirSync(path.join(savePath + '/inst-backup'));
			for(var i=0; i< $('.my-photo').length; i++){
				var myPhoto = $('.my-photo')[i];
				download($(myPhoto).data('download'), path.join(savePath + '/inst-backup') + '/'+ $(myPhoto).data('name') +'.jpg', function(){
				  	$('.backup-btn').button('reset');
				});
			}
			// Reset the selected value to empty ('')
     		$(this).val('');
    	});
		
		$('.backup-btn').click(function(){
			$('#file-chooser').trigger('click');
			$(this).button('loading');
		});
		
	}else {
		var insta = hello('instagram').getAuthResponse();
		$('.loading-icon').addClass('hide');
		$('.backup').removeClass('hide');
		
		if(insta && insta.access_token){
			localStorage.token = insta.access_token;
			win.reload();
			//getPhotos('instagram');
		}
		
		$('#instagram').click(function(){
			getPhotos('instagram');
		});
	}

})(this, this.$);