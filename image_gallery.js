(function(win, doc){
    if(win.addEventListener)return;     //No need to polyfill

    function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
    function addEvent(on, fn, self){
        return (self = this).attachEvent('on' + on, function(e){
            var e = e || win.event;
            e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
            e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
            fn.call(self, e);
        });
    }
    function addListen(obj, i){
        if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
        else obj.addEventListener = addEvent;
        return obj;
    }

    addListen([doc, win]);
    if('Element' in win)win.Element.prototype.addEventListener = addEvent;          //IE8
    else{                                                                           //IE < 8
        doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});      //Make sure we also init at domReady
        docHijack('getElementsByTagName');
        docHijack('getElementById');
        docHijack('createElement');
        addListen(doc.all); 
    }
})(window, document);

function ImageGallery(selector) {
    this.selector = selector;
    this.imageContainer = null;
    this.modalContainer = null;
    this.closeButton = null;
    this.prevButton = null;
    this.nextButton = null;
    this.images = [];
    this.currentIndex = 0;
    this.isGalleryOpen = false;
    this.init();
}

ImageGallery.prototype = {
    init: function() {
        var images = document.querySelectorAll(this.selector + ' img'), image, length, i;
        if (images) {
            length = images.length;
            for (i = 0; i < length; i++) {
                image = images[i];
                if (image.tagName == "IMG" && image.src) {
                    this.images.push(image.src);
                    image.setAttribute("data-slide-pos", this.images.length-1);
                }
            };
        }
        if (this.images.length) {
            this.setModal();
            this.populateConfig();
            this.setHandlers();
        }
    },
    setModal: function() {
        var container = document.createElement('div'), body = document.querySelector('body'), imageHTML = '';
        for (var i = 0; i < this.images.length; i++) {
            imageHTML += '<li class="slide"><img src="' + this.images[i] + '"></img></li>';
        }
        container.innerHTML += '<div class="prev">&#10094;</div><div class="next">&#10095;</div><div class="close">x</div><div class="inner"><ul class="slides">'+ imageHTML +'</ul></div>';
        container.className = 'modal';
        if (!container.style.opacity) {
            container.className += ' hidden';
        }
        body.appendChild(container);
        this.slides = document.querySelector('.modal .inner .slides');
        this.modalContainer = container;
    },
    populateConfig: function() {
        var closeSelector = ".modal .close",
            prevSelector = ".modal .prev",
            nextSelector = ".modal .next";

        this.closeButton = document.querySelector(closeSelector);
        this.prevButton = document.querySelector(prevSelector);
        this.nextButton = document.querySelector(nextSelector);
        this.imageContainer = document.querySelector(this.selector);
    },
    setHandlers: function() {
        this.imageContainer.addEventListener('click', this, false);
    },
    handleEvent: function(e) {
        var target = e.target, pos, body = document.querySelector('body');

        if (target.tagName == "IMG" && target.src) {
            pos = target.getAttribute("data-slide-pos");
            if (pos != -1) {
                this.currentIndex = pos;
                this.openGallery();
                this.imageContainer.removeEventListener('click', this, false);
                this.closeButton.addEventListener('click', this, false);
                this.prevButton.addEventListener('click', this, false);
                this.nextButton.addEventListener('click', this, false);
                window.addEventListener("keydown", this, false);
            }
        } else if (target.tagName == "DIV" && target.className == "close") {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(this.closeGallery.bind(this));
            } else {
                this.closeGallery();
            }
        } else if (target.tagName == "DIV" && target.className == "prev") {
            this.slideLeft();
        } else if (target.tagName == "DIV" && target.className == "next") {
            this.slideRight();
        } else if (this.isGalleryOpen && e.keyCode && e.keyCode == 37) {
            this.slideLeft();
        } else if (this.isGalleryOpen && e.keyCode && e.keyCode == 39) {
            this.slideRight();
        }
    },
    openGallery: function() {
        var moveLeft = this.currentIndex * 100 * -1;
        this.slides.style.transform = 'translateX(' + moveLeft + '%)';
        this.modalContainer.style.display = "block";
        this.checkButtonVisibility();
        this.isGalleryOpen = true;
    },
    closeGallery: function() {
        this.modalContainer.style.display = "none";
        this.prevButton.style.display = "none";
        this.nextButton.style.display = "none";
        this.closeButton.removeEventListener('click', this, false);
        this.prevButton.removeEventListener('click', this, false);
        this.nextButton.removeEventListener('click', this, false);
        window.removeEventListener("keydown", this, false);
        this.imageContainer.addEventListener('click', this, false);
        this.isGalleryOpen = false;
    },
    slideLeft: function() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            var moveLeft = this.currentIndex * 100 * -1;
            this.slides.style.transform = 'translateX(' + moveLeft + '%)';
            this.checkButtonVisibility();
        }
    },
    slideRight: function() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            var moveLeft = this.currentIndex * 100 * -1;
            this.slides.style.transform = 'translateX(' + moveLeft + '%)';
            this.checkButtonVisibility();
        }
    },
    checkButtonVisibility: function() {
        if (this.currentIndex == 0) {
            this.prevButton.style.display = "none";
            this.nextButton.style.display = "block";
        } else if (this.currentIndex == this.images.length - 1) {
            this.nextButton.style.display = "none";
            this.prevButton.style.display = "block";
        } else {
            this.prevButton.style.display = "block";
            this.nextButton.style.display = "block";
        }
    }
}
