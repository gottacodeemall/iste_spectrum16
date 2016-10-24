
	$(window).load(function() {
		// Animate loader off screen
		$(".se-pre-con").fadeOut("slow");;
	});

$(document).ready(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
  $(".nav-icon").click(
    function() {
   $(".nav").stop().animate(
   {
     left: '0',
     opacity:1
   },
   500,
   'easeInSine'
   );
  });

  $(".nav-close").click(
    function() {
   $(".nav").stop().animate(
   {
     left: '-300px',
     opacity:0.6
   },
   1500,
   'easeOutBounce'
   );
  });

  var duration = 400,
		epsilon = (1000 / 60 / duration) / 4,
		customMinaAnimation = bezier(.42,.03,.77,.63, epsilon);

	//define a radialSlider object
	var radialSlider = function(element) {
		this.element = element;
		this.slider = this.element.find('.cd-radial-slider');
		this.slides = this.slider.children('li');
		this.slidesNumber = this.slides.length;
		this.visibleIndex = 0;
		this.nextVisible = 1;
		this.prevVisible = this.slidesNumber - 1;
		this.navigation = this.element.find('.cd-radial-slider-navigation');
		this.animating = false;
		this.mask = this.element.find('.cd-round-mask');
		this.leftMask = this.mask.find('mask').eq(0);
		this.rightMask = this.mask.find('mask').eq(1);
		this.bindEvents();
	}

	radialSlider.prototype.bindEvents = function() {
		var self = this;

		//update visible slide when clicking the navigation round elements
		this.navigation.on('click', function(event){
			if( !self.animating ) {
				self.animating =  true;
				event.preventDefault();
				var direction = ( $(event.target).hasClass('next') ) ? 'next' : 'prev';
				//update radialSlider index properties
				self.updateIndexes(direction);
				//show new slide
				self.updateSlides(direction);
			}
		});
	}

	radialSlider.prototype.updateIndexes = function(direction) {
		if(  direction == 'next' ) {
			this.prevVisible = this.visibleIndex;
			this.visibleIndex = this.nextVisible;
			this.nextVisible = ( this.nextVisible + 1 < this.slidesNumber) ? this.nextVisible + 1 : 0;
		} else {
			this.nextVisible = this.visibleIndex;
			this.visibleIndex = this.prevVisible;
			this.prevVisible = ( this.prevVisible > 0 ) ? this.prevVisible - 1 : this.slidesNumber - 1;
		}
	}

	radialSlider.prototype.updateSlides = function(direction) {
		var self = this;

		//store the clipPath elements which need to be animated/updated
		var clipPathVisible = Snap('#'+this.slides.eq(this.visibleIndex).find('circle').attr('id')),
			clipPathPrev = Snap('#'+this.slides.eq(this.prevVisible).find('circle').attr('id')),
			clipPathNext = Snap('#'+this.slides.eq(this.nextVisible).find('circle').attr('id'));

		var radius1 = this.slider.data('radius1'),
			radius2 = this.slider.data('radius2'),
			centerx = ( direction == 'next' ) ? this.slider.data('centerx2') : this.slider.data('centerx1');

		this.slides.eq(this.visibleIndex).addClass('is-animating').removeClass('next-slide prev-slide');

		if( direction == 'next' ) {
			//animate slide content
			this.slides.eq(this.visibleIndex).addClass('content-reveal-left');
			this.slides.eq(this.prevVisible).addClass('content-hide-left');
			//mask slide image to reveal navigation round element
			this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask: url(#'+this.leftMask.attr('id')+')');

			//animate slider navigation round element
			clipPathNext.attr({
				'r': radius1,
				'cx': self.slider.data('centerx2'),
			});
			this.slides.eq(this.nextVisible).addClass('next-slide move-up');
			this.slides.filter('.prev-slide').addClass('scale-down');
		} else {
			//animate slide content
			this.slides.eq(this.visibleIndex).addClass('content-reveal-right');
			this.slides.eq(this.nextVisible).addClass('content-hide-right');
			//mask slide image to reveal navigation round element
			this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask: url(#'+this.rightMask.attr('id')+')');

			//animate slider navigation round element
			clipPathPrev.attr({
				'r': radius1,
				'cx': this.slider.data('centerx1'),
			});
			this.slides.eq(this.prevVisible).addClass('prev-slide move-up');
			this.slides.filter('.next-slide').addClass('scale-down');
		}

		// reveal new slide image - animate clipPath element
		clipPathVisible.attr({
			'r': radius1,
			'cx': centerx,
		}).animate({'r': radius2}, duration, customMinaAnimation, function(){

			if( direction == 'next' ) {
				self.slides.filter('.prev-slide').removeClass('prev-slide scale-down');
				clipPathPrev.attr({
					'r': radius1,
					'cx': self.slider.data('centerx1'),
				});
				self.slides.eq(self.prevVisible).removeClass('visible').addClass('prev-slide');
			} else {
				self.slides.filter('.next-slide').removeClass('next-slide scale-down');
				clipPathNext.attr({
					'r': radius1,
					'cx': self.slider.data('centerx2'),
				});
				self.slides.eq(self.nextVisible).removeClass('visible').addClass('next-slide');
			}
			self.slides.eq(self.visibleIndex).removeClass('is-animating').addClass('visible').find('image').removeAttr('style');
			self.slides.filter('.move-up').removeClass('move-up');

			setTimeout(function(){
				self.slides.eq(self.visibleIndex).removeClass('content-reveal-left content-reveal-right');
				self.slides.eq(self.prevVisible).removeClass('content-hide-left content-hide-right');
				self.slides.eq(self.nextVisible).removeClass('content-hide-left content-hide-right');
				self.animating =  false;
			}, 100);
		});
	}

	//initialize the radial slider
	$('.cd-radial-slider-wrapper').each(function(){
		new radialSlider($(this));
	});

	/*
		convert a cubic bezier value to a custom mina easing
		http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
	*/
	function bezier(x1, y1, x2, y2, epsilon){
		//https://github.com/arian/cubic-bezier
		var curveX = function(t){
			var v = 1 - t;
			return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
		};

		var curveY = function(t){
			var v = 1 - t;
			return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
		};

		var derivativeCurveX = function(t){
			var v = 1 - t;
			return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
		};

		return function(t){

			var x = t, t0, t1, t2, x2, d2, i;

			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++){
				x2 = curveX(t2) - x;
				if (Math.abs(x2) < epsilon) return curveY(t2);
				d2 = derivativeCurveX(t2);
				if (Math.abs(d2) < 1e-6) break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0, t1 = 1, t2 = x;

			if (t2 < t0) return curveY(t0);
			if (t2 > t1) return curveY(t1);

			// Fallback to the bisection method for reliability.
			while (t0 < t1){
				x2 = curveX(t2);
				if (Math.abs(x2 - x) < epsilon) return curveY(t2);
				if (x > x2) t0 = t2;
				else t1 = t2;
				t2 = (t1 - t0) * .5 + t0;
			}

			// Failure
			return curveY(t2);

		};
	};

  var modalTrigger = $('.cd-modal-trigger'),
		transitionLayer = $('.cd-transition-layer'),
		transitionBackground = transitionLayer.children(),
		modalWindow = $('.cd-modal');

	var frameProportion = 1.78, //png frame aspect ratio
		frames = transitionLayer.data('frame'), //number of png frames
		resize = false;

	//set transitionBackground dimentions
	setLayerDimensions();
	$(window).on('resize', function(){
		if( !resize ) {
			resize = true;
			(!window.requestAnimationFrame) ? setTimeout(setLayerDimensions, 300) : window.requestAnimationFrame(setLayerDimensions);
		}
	});

	//open modal window
	modalTrigger.on('click', function(event){
		event.preventDefault();
		var modalId = $(event.target).attr('href');
		transitionLayer.addClass('visible opening');
		var delay = ( $('.no-cssanimations').length > 0 ) ? 0 : 800;
		setTimeout(function(){
			modalWindow.filter(modalId).addClass('visible');
			transitionLayer.removeClass('opening');
		}, delay);
	});

	//close modal window
	modalWindow.on('click', '.modal-close', function(event){
		event.preventDefault();
		transitionLayer.addClass('closing');
		modalWindow.removeClass('visible');
		transitionBackground.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
			transitionLayer.removeClass('closing opening visible');
			transitionBackground.off('webkitAnimationEnd oanimationend msAnimationEnd animationend');
		});
	});

	function setLayerDimensions() {
		var windowWidth = $(window).width(),
			windowHeight = $(window).height(),
			layerHeight, layerWidth;

		if( windowWidth/windowHeight > frameProportion ) {
			layerWidth = windowWidth;
			layerHeight = layerWidth/frameProportion;
		} else {
			layerHeight = windowHeight*1.2;
			layerWidth = layerHeight*frameProportion;
		}

		transitionBackground.css({
			'width': layerWidth*frames+'px',
			'height': layerHeight+'px',
		});

		resize = false;
	}
  particlesJS("particles-js", {"particles":{"number":{"value":95,"density":{"enable":false,"value_area":7584.407791103743}},"color":{"value":"#f6f6f6"},"shape":{"type":"circle","stroke":{"width":0,"color":"#f6f6f6"},"polygon":{"nb_sides":3},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5917504979872151,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":3,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":150.02125301084325,"color":"#f6f6f6","opacity":0.5500779277064253,"width":1},"move":{"enable":true,"speed":6,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"repulse"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});var count_particles, stats, update;
});
