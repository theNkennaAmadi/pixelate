import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The Content class handles the pixelation effect
export class Content {
    // DOM elements
    DOM = {
        el: null,
        canvas: null,
        inner: null
    };
    // the image source/url
    imageSrc;
    // canvas image
    img;
    // the image ratio
    imgRatio;
    // canvas context
    ctx;
    // The pixelation factor values determine the level of
    // pixelation at each step of the effect.
    // To make the effect more prominent, we start with
    // smaller values initially to keep the big blocks
    // visible for a longer time.
    // Towards the end we don't add many values as
    // we want the sharpening up to happen quickly here.
    pxFactorValues = [4, 9, 20, 50, 100];
    pxIndex = 0;

    /**
     * Constructor for the Content class.
     * Accepts a DOM element representing the content element.
     */
    constructor(DOM_el) {
        // Initialize DOM elements
        this.DOM.el = DOM_el;
        this.DOM.inner = this.DOM.el.querySelector('img');

        // Extract the image source
        this.imageSrc = this.DOM.inner.src

        // Create a canvas element and append it to the dom element
        this.DOM.canvas = document.createElement('canvas');
        this.DOM.el.appendChild(this.DOM.canvas);

        // Get the 2D rendering context of the canvas
        this.ctx = this.DOM.canvas.getContext('2d');

        // Create a new Image object and load the image source
        this.img = new Image();
        this.img.src = this.imageSrc;

        // Once the image is loaded, perform necessary calculations and rendering
        this.img.onload = () => {
            const imgWidth = this.img.width;
            const imgHeight = this.img.height;
            this.imgRatio = imgWidth / imgHeight;
            this.setCanvasSize();
            this.render();
            // Set up event listeners and triggers
            this.initEvents();
        };
    }

    /**
     * Sets up event listeners and the GSAP scroll triggers.
     * Handles resize events and triggers the pixelation
     * effect when the image enters the viewport.
     */
    initEvents() {
        // Resize event handler
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.render();
        });

        // Trigger pixelation effect when reaching the
        // specific starting point:
        ScrollTrigger.create({
            trigger: this.DOM.el,
            start: 'top 50%',
            markers: false,
            onEnter: () => {
                this.animatePixels();
            },
            //once: true
        });

        // Add parallax effect to titles
        gsap.timeline({
            scrollTrigger: {
                trigger: this.DOM.el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        })
            .to(this.DOM.inner, {
                ease: 'none',
                yPercent: -100
            });

        // show canvasWrap when the element enters the viewport
        ScrollTrigger.create({
            trigger: this.DOM.el,
            start: 'top bottom',
            onEnter: () => {
                gsap.set(this.DOM.el, {
                    opacity: 1
                })
            },
            once: true
        });
    }

    /**
     * Sets the canvas size based on the dimensions
     * of the canvasWrap element.
     */
    setCanvasSize() {
        this.DOM.canvas.width = this.DOM.el.offsetWidth;
        this.DOM.canvas.height = this.DOM.el.offsetHeight;
    }

    /**
     * Renders the image on the canvas.
     * Applies the pixelation effect based on the pixel factor.
     */
    render() {
        const offsetWidth = this.DOM.el.offsetWidth;
        const offsetHeight = this.DOM.el.offsetHeight;
        // increase a bit to not have a gap in the end of the image
        // when we have big pizel sizes
        const w = offsetWidth + offsetWidth * 0.05;
        const h = offsetHeight + offsetHeight * 0.05;

        // Calculate the dimensions and position for rendering the image
        // within the canvas based on the image aspect ratio.
        let newWidth = w;
        let newHeight = h;
        let newX = 0;
        let newY = 0;

        // Adjust the dimensions and position if the image
        // aspect ratio is different from the canvas aspect ratio
        if (newWidth / newHeight > this.imgRatio) {
            newHeight = Math.round(w / this.imgRatio);
            // let's keep Y at 0 because we want the pixels to not
            // be cut off at the top. Uncomment if you want the
            // image to be centered.
            // newY = (h - newHeight) / 2;
        } else {
            newWidth = Math.round(h * this.imgRatio);
            newX = (w - newWidth) / 2;
        }

        // Get the pixel factor based on the current index
        let pxFactor = this.pxFactorValues[this.pxIndex];
        const size = pxFactor * 0.01;

        // Turn off image smoothing to achieve the pixelated effect
        this.ctx.mozImageSmoothingEnabled = size === 1 ? true : false;
        this.ctx.webkitImageSmoothingEnabled = size === 1 ? true : false;
        this.ctx.imageSmoothingEnabled = size === 1 ? true : false;

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.DOM.canvas.width, this.DOM.canvas.height);

        // Draw the original image at a fraction of the final size
        this.ctx.drawImage(this.img, 0, 0, w * size, h * size);

        // Enlarge the minimized image to full size
        this.ctx.drawImage(
            this.DOM.canvas,
            0,
            0,
            w * size,
            h * size,
            newX,
            newY,
            newWidth,
            newHeight
        );
    }

    /**
     * Animates the pixelation effect.
     * Renders the image with increasing pixelation factor at each step.
     */
    animatePixels() {
        if (this.pxIndex < this.pxFactorValues.length) {
            // Increase the pixelation factor and continue animating
            setTimeout(() => {
                // Render the image with the current pixelation factor
                this.render();
                this.pxIndex++;
                this.animatePixels();
            }, this.pxIndex === 0 ? 400 : 100); // The first time should be the longest.
        }
        else {
            this.pxIndex = this.pxFactorValues.length - 1;
        }
    }
}


// .content elements
const contentElems = [...document.querySelectorAll('[data-pixel-load]')]
contentElems.forEach(el => new Content(el));
