var isMobile = new Object();
isMobile.Android = function () {
	return navigator.userAgent.match(/Android/i);
};

isMobile.BlackBerry = function () {
	return navigator.userAgent.match(/BlackBerry/i);
};
isMobile.iOS = function () {
	return navigator.userAgent.match(/iPhone|iPad|iPod/i);
};

isMobile.iPad = function () {
	return navigator.userAgent.match(/iPad/i);
};
isMobile.Opera = function () {
	return navigator.userAgent.match(/Opera Mini/i);
};
isMobile.Windows = function () {
	return navigator.userAgent.match(/IEMobile/i);
};

isMobile.Firefox = function () {
	return navigator.userAgent.match(/Firefox/gi);
};
isMobile.InternetExplorer = function () {
	return navigator.userAgent.match(/MSIE/gi);
};
isMobile.Opera = function () {
	return navigator.userAgent.match(/Opera/gi);
};
isMobile.Safari = function () {
	return navigator.userAgent.match(/Safari/gi);
};
isMobile.any = function () {
	return (
		isMobile.Android() ||
		isMobile.BlackBerry() ||
		isMobile.iOS() ||
		isMobile.Opera() ||
		isMobile.Windows()
	);
};
if (isMobile.any() && isMobile.iPad() == null) {
	//return;
}

var ua = window.navigator.userAgent;
var is_ie = /MSIE|Trident/.test(ua);

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

var winWT = $(window).innerWidth();
var winHT = $(window).innerHeight();

var disableScrolling = function () {
	var x = window.scrollX;
	var y = window.scrollY;
	window.onscroll = function () { window.scrollTo(x, y); };
}
var enableScrolling = function () {
	window.onscroll = function () { };
}
window.onbeforeunload = function () {
	//window.scrollTo(0, 0);
}

$(window).on('load', function () {
	//window.scrollTo(0, 0);
});


$(document).ready(function () {
	var navWT = $("nav").innerWidth();
	$('nav a').each(function () {
		$(this).on('click', function () {
			var currSection = '#' + $(this).attr('refLink');
			$('html, body').animate({
				scrollTop: $(currSection).offset().top
			}, 300);
			//$('nav a').removeClass('active_link');
			//$('this').addClass('active_link');

		});
	});

	function getTargetTop(elem) {
		var id = elem.attr("href");
		var offset = 60;
		return $(id).offset().top - offset;
	}


	$(window).scroll(function (e) {
		isSelected($(window).scrollTop())
	});

	var sections = $('nav a[href^="#"]');

	function isSelected(scrolledTo) {

		var threshold = 100;
		var i;

		for (i = 0; i < sections.length; i++) {
			var section = $(sections[i]);
			var target = getTargetTop(section);

			if (scrolledTo > target - threshold && scrolledTo < target + threshold) {
				sections.removeClass("active_link");
				section.addClass("active_link");
			}

		};
	}

	function closeMenuOnMobile() {
		$('nav a').on('click', function () {
			var navWT = $(window).innerWidth();
			if (navWT <= 1279) {
				closeNavForMob();
			}

		});
	}
	closeMenuOnMobile();
	$(window).resize(function () {
		var navWT = $(window).innerWidth();
		if (navWT >= 1280) {
			gsap.to("nav", 0.5, { right: 0 + "px", ease: Power2.easeInOut, });
			//gsap.set(".nav_overlay", { display: "block", });
			$('#nav-icon1').addClass("open");
			return;
		}
		navWT = $("nav").innerWidth();
		closeNavForMob();
		closeMenuOnMobile();
	});

	/* $('nav a[href^="#"]').on('click',function (e) {
		 e.preventDefault();
		 var target = this.hash;
		 var $target = $(target);
		 $('html, body').stop().animate({
			  'scrollTop': $target.offset().top
		 }, 900, 'swing', function () {
			  // window.location.hash = target;
		 });
	}); */

	$(".nav_overlay").click(function () {
		$("#nav-icon1").trigger("click");
	})
	$("#nav-icon1").click(function () {
		//$(this).toggleClass('open');
		if ($(this).hasClass("open")) {
			$(this).removeClass("open");
			closeNavForMob();
		} else {
			$(this).addClass("open");
			gsap.set(".nav_overlay", { display: "block", });
			gsap.to(".nav_overlay", 0.5, { opacity: 0.8, ease: Power2.easeInOut, });
			gsap.to("nav", 0.5, { right: 0, ease: Power2.easeInOut, });
		}
	});

	function closeNavForMob() {
		if (navWT >= 1280) {
			return;
		}
		var navWT = $("nav").innerWidth();
		gsap.to(".nav_overlay", 0.5, { opacity: 0, ease: Power2.easeInOut, });
		gsap.to("nav", 0.5, { right: -navWT + "px", ease: Power2.easeInOut, });
		gsap.set(".nav_overlay", { display: "none", });
		$('#nav-icon1').removeClass("open");
	}
	//closeNavForMob();
	function stickyNav() {
		if ($(window).scrollTop() >= 100) {
			$('header').addClass('sticky');
		}
		else {
			$('header').removeClass('sticky');
		}
	}
	$(window).on('scroll', function () {
		//stickyNav();
	});

	$('.test_slider_con').slick({
		slidesToShow: 2,
		slidesToScroll: 1,
		dots: false,
		arrows: false,
		autoplay: false,
		infinite: false,
		speed: 400,
		responsive: [
			{
				breakpoint: 767,
				settings: {
					slidesToShow: 1,
					dots: true,
					infinite: true,
				}
			}
		]
	});

	$('.adv_slider_panel').slick({
		centerMode: true,
		centerPadding: '30%',
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		autoplay: false,
		infinite: true,
		speed: 400,
		responsive: [
			{
				breakpoint: 1023,
				settings: {
					slidesToShow: 1,
					centerPadding: '10%',
					dots: true,
					arrows: false,
				}
			},
			{
				breakpoint: 500,
				settings: {
					slidesToShow: 1,
					centerPadding: '5%',
					dots: true,
					arrows: false,
				}
			}
		]
	});
	$('.popup-youtube').magnificPopup({
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});

	/*===========================================================*/
	/*===========================================================*/
	mobileOnlySlider(".adv_blurb_con", false, true, 767);

	function mobileOnlySlider($slidername, $dots, $arrows, $breakpoint) {
		var slider = $($slidername);
		var settings = {
			mobileFirst: true,
			dots: $dots,
			arrows: $arrows,
			responsive: [
				{
					breakpoint: $breakpoint,
					settings: "unslick"
				}
			]
		};

		slider.slick(settings);

		$(window).on("resize", function () {
			if ($(window).width() > $breakpoint) {
				return;
			}
			if (!slider.hasClass("slick-initialized")) {
				return slider.slick(settings);
			}
		});
	} // Mobile Only Slider

	/*===========================================================*/
	/*===========================================================*/
	var popupThumbArr = $('.adv_blurb_con').find('.blurb');
	console.log(popupThumbArr.length);
	$(popupThumbArr).each(function(){
		$(this).on('click', function(){
			if($(this).html()==''){
				return;
			}else{
				var thumbImgSrc = $(this).find('img').attr('src');
				var thumbTitle = $(this).find('p').text();
				var thumbDesc = $(this).find('.desc').text();
				openPopup(thumbImgSrc, thumbTitle, thumbDesc);
			}
		});
	});
	$('.popup_con .close').on('click', function(){
		closePopup();
	});
	$('.popup_hld .overlay').on('click', function(){
		closePopup();
	});
	function openPopup(tumbImgSrc, title, desc){
		var popupImg = $('.popup_con').find('img');
		var popupTitle = $('.popup_con').find('h4');
		var popupDesc = $('.popup_con').find('p');
		popupImg.attr('src', '');
		popupTitle.text('');
		popupDesc.text('');
		popupImg.attr('src', tumbImgSrc);
		popupTitle.append(title);
		popupDesc.append(desc);
		$('.popup_hld').fadeIn();
		$('html').css('overflow-y', 'hidden');
	}
	function closePopup(){
		$('.popup_hld').fadeOut();
		$('html').css('overflow-y', 'auto');
	}
	

});

