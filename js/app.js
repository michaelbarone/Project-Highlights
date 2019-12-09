var app = angular.module('website', ['ngAnimate', 'ui.bootstrap']);

app.controller('MainCtrl', function ($scope, $timeout, $interval, QueueService, $http) {
    var INTERVAL = 10000;
	// random value 3 through 5
	var IMAGESBETWEENVIDEOS = Math.floor(Math.random() * 3) + 3;
	// at 10000 INTERVAL, 360 is 1 check per hour
	var SLIDESBETWEENVERSIONCHECK = 360;
	var timeout;
	
	/*
       var slides = [{id:"image00", src:"./images/image00.jpg"},
        {id:"image01", src:"./images/image01.jpg"},
        {id:"image02", src:"./images/image02.jpg"},
        {id:"image03", src:"./images/image03.jpg"},
        {id:"image04", src:"./images/image04.jpg"}];
		
		console.log(slides);
	*/


    function setCurrentSlideIndex(index) {
        $scope.currentImageIndex = index;
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentImageIndex === index;
    }

	$scope.$watch('currentImageIndex', function(newValue, oldValue) {
		//console.log(newValue);
		$scope.hideProjectInfo = true;
		$timeout(function () {
			$scope.hideProjectInfo = false;
		}, 1000);
	});

    function nextSlide() {
		$scope.slidesSinceLastVersionCheck++;
		if($scope.slidesSinceLastVersionCheck > SLIDESBETWEENVERSIONCHECK){
			// run version check
			// reload content
			loadContent();
		} else {
			//console.log($scope.imagesSinceLastVideo);
			//console.log(timeout);
			if($scope.imagesSinceLastVideo > IMAGESBETWEENVIDEOS){
				//$timeout.cancel(timeout);
				showVideo();
			} else {
				if($scope.imagesSinceLastVideo>-1){
					$scope.currentImageIndex = ($scope.currentImageIndex < $scope.slides.length - 1) ? ++$scope.currentImageIndex : 0;
				}
				$scope.imagesSinceLastVideo++;
				timeout = $timeout(nextSlide, INTERVAL);
			}
		}
    }
	
	function showVideo() {
		$scope.currentVideoIndex = ($scope.currentVideoIndex < $scope.videos.length - 1) ? ++$scope.currentVideoIndex : 0;
		//console.log("Playing Video");
		$scope.imagesSinceLastVideo = -1;
		if($scope.videos[$scope.currentVideoIndex].src){
			$timeout(function () {
				$scope.video = true;
			}, 500);			
			$timeout(function () {
				$scope.videoUrl = $scope.videos[$scope.currentVideoIndex].src;
			}, 1000);
			$timeout(function () {
				// check if video is paused, and play
				//console.log(document.getElementById('videoPlayer').paused);
				if (document.getElementById('videoPlayer').paused){
					document.getElementById('videoPlayer').play();
				}
				
				
				//advance currentImage for next frame after video
				$scope.currentImageIndex = ($scope.currentImageIndex < $scope.slides.length - 1) ? ++$scope.currentImageIndex : 0;
			}, 5000);
			$timeout(function () {
				// auto close video if video does not load/play properly after 61 seconds
				if($scope.video == true){
					closeVideo();
				}
			}, 61000);
		} else {
			closeVideo();
		}
	}
	
	function closeVideo(){
		$scope.video = false;
		$scope.videoUrl = "";
		document.getElementById('videoPlayer').src="";
		$timeout.cancel(timeout);
		timeout = $timeout(nextSlide, 100);
	}
	
	$('#videoPlayer').on('ended', function(){
		//console.log("video completed");
		closeVideo();
	});
	

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
        return $scope.currentAnimation === animation;
    }

	function loadContent() {
		var releaseNetwork = {};
		var releaseLocal = {};
		$scope.slidesSinceLastVersionCheck = 0;
		// check app versiona and reload if needed

		
		$http({
		  method: 'GET',
		  url: './app.json?'+Date.now()
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			//console.log("local version");
			//console.log(response.data);
			releaseLocal = response.data.currentRelease;
			
			// get network version
			$http({
			  method: 'GET',
			  url: './data/getVersion.php'
			}).then(function successCallback(response) {
				// RESPONSE CONTAINS YOUR FILE LIST
				//console.log("network version");
				//console.log(response.data);
				releaseNetwork = response.data.currentRelease;
				
				
				// compare versions and update if needed
				if(releaseLocal.version != releaseNetwork.version) {
					console.log("Local:"+releaseLocal.version+ " Network:"+releaseNetwork.version);
					console.log("versions are different, need to update local");
					
					// run update script to overwrite local files
					// script needs to reload page after copy is completed
					
					// maybe run 10-15 second timer before refresh, update statusbar on main screen with "updating app" message
					$scope.progressBarText = "Upgrading Website";
					
					var progressCount = 0;
					var progressInterval = $interval(function(){
						$scope.progress = progressCount;
						progressCount++;
						if(progressCount>100){
							$interval.cancel(progressInterval);
							location.href=location.href;
						}
					}, 150);
					
					
					$http({
						method: 'GET',
						url: './data/updateLocalVersion.php'
					}).then(function successCallback(response) {
						// RESPONSE CONTAINS YOUR FILE LIST
						console.log("local version updated..  refreshing");
						//$timeout(function () {
						//	location.href=location.href;
						//}, 2000);

					}, function errorCallback(response) {
						// ERROR CASE
						console.log("error on updateLocalVersion");
					});
					
				} else {
					//console.log("local version up to date");
					//if app uptodate then load content
					loadSlides();
					loadVideos();
				}
				
				
			}, function errorCallback(response) {
				// ERROR CASE
				console.log("error on loadNetworkVersion");
				// error, load content anyway
				loadSlides();
				loadVideos();
			});
			
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadLocalVersion");
			// error, load content anyway
			loadSlides();
			loadVideos();
		});
	}

    function loadSlides() {
		var fileValue = "";
		var fileValueExplode = [];
		var slides = [];
		// load slides
		$http({
		  method: 'GET',
		  url: './data/getImages.php'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				fileValueExplode = value.split('.');
				var fileExt = fileValueExplode.pop();
				fileValue = fileValueExplode.join();
				if(['JPEG','jpeg','JPG','jpg','PNG','png'].indexOf(fileExt) >= 0){
					slides = slides.concat({id:fileValue, src:"./data/serveImage.php?image="+value});
				}
			});
			//console.log(slides);
			QueueService.loadManifest(slides);
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadSlides");
		});		
    }

    function loadVideos() {
		var fileValue = "";
		var fileValueExplode = [];
		var videos = [];
		// load videos
		$http({
		  method: 'GET',
		  url: './data/getVideos.php'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				fileValueExplode = value.split('.');
				var fileExt = fileValueExplode.pop();
				fileValue = fileValueExplode.join();
				if(['mp4','MP4'].indexOf(fileExt) >= 0){				
					videos = videos.concat({id:fileValue, src:"./data/serveVideo.php?video="+value});
				}
			});
			//console.log(videos);
			$scope.videos = videos;
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadVideos");
		});		
    }


    $scope.$on('queueProgress', function(event, queueProgress) {
        $scope.$apply(function(){
            $scope.progress = queueProgress.progress * 100;
        });
    });

    $scope.$on('queueComplete', function(event, slides) {
        $scope.$apply(function(){
            $scope.slides = slides;
            $scope.loaded = true;
			$scope.imagesSinceLastVideo = 0
			//get random start point in $scope.slides
			$scope.currentImageIndex = Math.floor(Math.random() * ($scope.slides.length));
			//console.log($scope.currentImageIndex);
            $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
	$scope.progressBarText = "Loading";
    $scope.loaded = false;
	$scope.video = false;
	$scope.hideProjectInfo = false;
	$scope.imagesSinceLastVideo = 0;
	$scope.currentVideoIndex = 0;
    $scope.currentImageIndex = 0;
	$scope.slidesSinceLastVersionCheck = 0;
    //$scope.currentAnimation = 'slide-left-animation';
    //$scope.currentAnimation = 'slide-down-animation';
    $scope.currentAnimation = 'fade-in-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;

	loadContent();
});

app.factory('QueueService', function($rootScope){
    var queue = new createjs.LoadQueue(true);
	queue.setMaxConnections(10);
	
    function loadManifest(manifest) {
        queue.loadManifest(manifest);

        queue.on('progress', function(event) {
            $rootScope.$broadcast('queueProgress', event);
        });

        queue.on('complete', function() {
            $rootScope.$broadcast('queueComplete', manifest);
        });
    }
    return {
        loadManifest: loadManifest
    }
});

app.animation('.slide-left-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { left: $window.innerWidth}, {left: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {left: -$window.innerWidth, onComplete: done});
        }
    };
});

app.animation('.slide-down-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { top: -$window.innerHeight}, {top: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {top: $window.innerHeight, onComplete: done});
        }
    };
});

app.animation('.fade-in-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 2, { opacity: 0}, {opacity: 1, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {opacity: 0, onComplete: done});
        }
    };
});

app.directive('bgImage', function ($window, $timeout) {
    return function (scope, element, attrs) {
		
		//get image height and width, compare against window.innerH/W.
		//set either height or width of element to corresponding window.innerH/W
		
		
		var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();
			var aspect = "horizontal";
			
			if(bgwidth < bgheight){
				aspect = "vertical"
			}

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;		
		
            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: 'auto',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: 'auto'
                });
            }		
		};
		
		/*
        var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;

            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: winwidth + 'px',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: winheight + 'px'
                });
            }
        };
		*/

        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

		angular.element(document).ready(function () {
			resizeBG();
		});

        element.bind('load', function () {
            resizeBG();
        });
    }
});

app.filter('projectDisplay', function() {
	return function(input){
		if(input==undefined){ return; }
		var output = "";
		var inputExplode = input.split("_");
		output = inputExplode[0].replace(/-/g," ") + " - " + inputExplode[1].substring(0,4);
		inputExplode.splice(0, 2);
		output = output + ": " + inputExplode.join().replace(/,/g," ");
		return output;
	}
});
