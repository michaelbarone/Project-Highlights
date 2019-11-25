var app = angular.module('website', ['ngAnimate', 'ui.bootstrap']);

app.controller('MainCtrl', function ($scope, $timeout, QueueService, $http) {
    var INTERVAL = 10000;
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
        $scope.currentIndex = index;
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentIndex === index;
    }

    function nextSlide() {
        $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
		timeout = $timeout(nextSlide, INTERVAL);
		
		/*
        console.log($scope.currentIndex);
		console.log(timeout);
		if($scope.currentIndex==3){
			console.log("cancel attempt");
			$timeout.cancel(timeout);
		}
		*/
    }

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
        return $scope.currentAnimation === animation;
    }

    function loadSlides() {
		
		var slides = [];
		// load slides
		$http({
		  method: 'GET',
		  url: './data/getImages.php'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				slides = slides.concat({id:value.split('.')[0], src:"./data/serveImage.php?image="+value});
			});
			//console.log(slides);
			QueueService.loadManifest(slides);
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadSlides");
		});		
    }

    function loadVideos() {
		
		var videos = [];
		// load videos
		$http({
		  method: 'GET',
		  url: './data/getVideos.php'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				videos = videos.concat({id:value.split('.')[0], src:"./data/serveVideos.php?videos="+value});
			});
			console.log(videos);
			$scope.videos = videos;
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadSlides");
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

            $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
    $scope.loaded = false;
	$scope.video = false;
	$scope.imgagesBetweenVideos = 10;
	$scope.imagesSinceLastVideo = 0;
    $scope.currentIndex = 0;
    $scope.currentAnimation = 'slide-left-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;

    loadSlides();
	loadVideos();
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
            TweenMax.fromTo(element, 1, { opacity: 0}, {opacity: 1, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {opacity: 0, onComplete: done});
        }
    };
});

app.directive('bgImage', function ($window, $timeout) {
    return function (scope, element, attrs) {
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

        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

        element.bind('load', function () {
            resizeBG();
        });
    }
});

