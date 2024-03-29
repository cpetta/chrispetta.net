let navState = false;
let modelViewerLoaded = false;
let loadingBarWidth = 0;
let thumbnailClicked = -1; // will be used as the index to the array of model images, -1 represents the 3D model viewer, 0 through x are images.
let lastModelLoaded = null;
let projectIndex = 0;
let firstScroll = false;
let fadeInOnScrollQueue = 0;

const passive = detectPassive() ? {passive:true} : false;
let avifSupported = false; // avifSupport()

let imgs = []; // 2D Array
let imgLoaded = [];
let modelProjects = [];

const gotoTopBtn = document.getElementById("gotoTopBtn");
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const modelingSection = document.getElementById("modeling");
const modelingLabel = document.getElementById("modelingLabel");
const viewport = document.getElementById("viewer3d");
const viewerImg = document.getElementById("viewerImg");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenCloseBtn = document.getElementById("fullscreenCloseBtn");
const modelCopyright = document.getElementById("modelCopyright");
const preBtn = document.getElementById("previousBtnWrapper");
const nxtBtn = document.getElementById("nextBtnWrapper");
const loadingSpinner = document.getElementById("loadingSpinner");
const loadingBar = document.getElementById("loadingBar");
const webGLViewer = document.getElementById("webGLViewer");
const webGLViewerCloseBtn = document.getElementById("webGLViewerCloseBtn");
const modelViewer = document.getElementById("modelViewer");
const poster = document.getElementById("poster");
const title = document.getElementById('title');
const specs = document.getElementById('specs');
const description = document.getElementById('description');
const date = document.getElementById('date');
const size = document.getElementById('size');
const textureRez = document.getElementById('textureRez');
const verts = document.getElementById('verts');
const faces = document.getElementById('faces');
const mats = document.getElementById('mats');
const additionalOptionsContainer = document.getElementById('additionalOptionsContainer');

const fadeInObjects = window.document.querySelectorAll(".fadeInOnScroll");
const moreButtons = window.document.querySelectorAll(".moreButton");
const placeholderImgs = window.document.querySelectorAll(".placeholderImg");

/**
 * Array which contains all the information for a given model.
 */
const modelInfoTypingTextContainer = [
	new TypingText(specs, 619),
	new TypingText(title, 300),
	new TypingText(description, 600),
	new TypingText(date, 620),
	new TypingText(size, 620),
	new TypingText(textureRez, 620),
	new TypingText(verts, 620),
	new TypingText(faces, 620),
	new TypingText(mats, 620),
	new TypingText(additionalOptionsContainer, 301)
];

/**
 * Creates an object which can hold a DOM element and a setTimeout, used for controlling the typing animation
 * @param {Element} element The text element that will be animated
 * @param {Function} delay The amount of time to wait before starting to type
 */
function TypingText(element, delay) {
	this.elm = element;
	this.typer;
	this.typingDelay = delay;
}

/**
 * Detect if passive event listeners are supported.
 */
function detectPassive() {
	try {
		const options = {
		// This function will be called when the browser attempts to access the passive property.
		  get passive() {return false;}
		};
	  
		window.addEventListener("test", null, options);
		window.removeEventListener("test", null, options);
		return true;
	  }
	  catch(err) {
		return false;
	  }
}

/**
 * Detect if the AVIF image format is supported.
 */
function avifSupport(){
	let avif = new Image();
	avif.src = "data:image/avif;base64,AAAAFGZ0eXBhdmlmAAAAAG1pZjEAAACgbWV0YQAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAC8AAAAGwAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAARWlwcnAAAAAoaXBjbwAAABRpc3BlAAAAAAAAAAQAAAAEAAAADGF2MUOBAAAAAAAAFWlwbWEAAAAAAAAAAQABAgECAAAAI21kYXQSAAoIP8R8hAQ0BUAyDWeeUy0JG+QAACANEkA=";
	avif.onload=()=>{avifSupported = true};
}
avifSupport();

window.addEventListener("load", init, passive?{once:true, passive:true}:false);
window.addEventListener("resize", resizeManager, passive);
document.body.addEventListener('mouseover', loadmv, {once:true});
document.body.addEventListener('touchmove', loadmv, {once:true});
document.body.addEventListener('scroll', loadmv, {once:true});
document.body.addEventListener('keydown', loadmv, {once:true});
hamburger.addEventListener("click", ()=>navToggle(false), passive);
preBtn.addEventListener("click", ()=>clickManager('previous'), passive);
nxtBtn.addEventListener("click", ()=>clickManager('next'), passive);
fullscreenBtn.addEventListener("click", fullscreenOpen, passive);
fullscreenCloseBtn.addEventListener("click", fullscreenClose, passive);
fullscreenCloseBtn.addEventListener("click", fullscreenClose, passive);
webGLViewerCloseBtn.addEventListener("click", closeModelViewer, passive);

for (const elm of nav.children) {
	elm.addEventListener("click", ()=>navToggle(true), passive);
}

for(const moreButton of moreButtons) {
	moreButton.addEventListener('click', moreButtonClickHandler, passive);
}

function init() {
	resizeManager();
	createObserver();
	for(const placeholderImg of placeholderImgs) {
		placeholderImg.style.display = "none";
	}
	
	fetch('3DProjects/3DProjects.json')
	.then(response => response.json())
	.then(data => modelProjects = data)
	.then(modelProjects => {
		imgs = new Array(modelProjects.length);
		imgLoaded = new Array(modelProjects.length);
		modelProjects.forEach(prepareProjects); 
	});
}

/**
 * load modelviewer script when the user interacts with the page.
 * This defered loading increases page load speed and interactive time.
 */
 function loadmv () {
	if (!modelViewerLoaded) {
		modelViewerLoaded = true;
		loadScript('js/model-viewer.min.js', true);
	}
}

/**
 * Applies css styles to the navigation when the screen is resized
 */
async function resizeManager() {
	navState = false;
	if(window.innerWidth >= 1265) {
		nav.style.transition = "0s";
		nav.style.maxHeight = "408px";
	}
	else {
		navToggle(true);
		setTimeout(() => {nav.style.transition = "0.2s ease-out";}, 10); // setTimeout is required, otherwise it will animate oddly on a resize
	}
}

/**
 *  Toggle the mobile version of the nav from closed to open and vice versa
 * @param {boolean} closeNav if true is passed, close the mobile nav regardless of what position it's in
 */
function navToggle(closeNav = false) {
	if ((navState || closeNav) && window.innerWidth <= 1265) { // If mobile nav is not already open
		nav.style.maxHeight = "0px";
		setTimeout(() => {hamburger.classList.add("navClosed")},201); // using setTimeout here to allow the proper animation to play. avoiding an animation delay on the top bar
		hamburger.classList.remove("navOpen");
		navState = false;
	}
	else {
		nav.style.maxHeight = "408px";
		hamburger.classList.add("navOpen");
		hamburger.classList.remove("navClosed");
		navState = true;
	}
}

/**
 * Create the intersection observer object which is used to lazy load images and apply the fadeIn css style when an element becomes visible on the screen
 */
function createObserver() {
	let observer;
	const options = {
		root: null,
		rootMargin: "0px",
		threshold: 0.4
	}
	observer = new IntersectionObserver(handleIntersect, options);
	for (const element of fadeInObjects) {
		observer.observe(element);
	}
	observer.observe(modelingSection);
	observer.observe(modelingLabel);
	observer.observe(viewport);
	observer.observe(nav);
}

/**
 * handleIntersect is run when the intersection observer passes an intersection threshold
 * @param {*} entries item that the observer is observing
 * @param {*} observer IntersectionObserver object
 */
function handleIntersect(entries, observer) {
	for (const entry of entries) {
		if(entry.isIntersecting) {
			if(entry.target.classList.contains("fadeInOnScroll")) {
				queueFadeInOnScroll(entry.target.classList);
				observer.unobserve(entry.target);
			}
			if(entry.target === nav) {
				if(firstScroll) {
					gotoTopBtn.classList.remove("zoomIn");
					gotoTopBtn.classList.add("zoomOut");

				}
			}
		}
		else if(entry.target === nav) {
			firstScroll = true;
			gotoTopBtn.classList.remove("zoomOut");
			gotoTopBtn.classList.add("zoomIn");
		}
	}
}

/**
 * Add a script tag to an html file. Called by the intersection observer to lazy load modelviewer.js
 * @param {string} scriptSrc Path to a javascript file, equivalent to the src of a <script> tag
 * @param {boolean} module If true is passed, will set script type to module
 */
async function loadScript(scriptSrc, module = false) {
	let script = document.createElement('script');
	script.src = scriptSrc;
	if(module) {
		script.type = "module";
	}
	else {
		script.setAttribute("nomodule", "");
	}
	script.setAttribute("async", "");
	script.setAttribute("defer", "");
	document.body.appendChild(script);
}

/**
 * When a model project is clicked, load the modelviewer UI and any assets related to the clicked item
 * @param {sting} clicked The uniqueName of a model project from the 3DProjects.json file
 */
async function modelProjectManager(clicked) {
	if(clicked != lastModelLoaded) {
		lastModelLoaded = clicked;
		// modelProjects will evaluate false when the JSON file containing all the information hasn't been loaded yet
		if(modelProjects) {
			fadeIn(webGLViewer, true, 'grid');
			if(thumbnailClicked != -1) { // If the last thumbnail clicked was not the modelviewer
				fadeOut(imgs[projectIndex][thumbnailClicked]);
			}
			fadeIn(modelViewer);
			// When a new project is being loaded, default to the model viewer
			thumbnailClicked = -1;

			const uniqueName = (element) => {return element.uniqueName === clicked}
			projectIndex = modelProjects.findIndex(uniqueName);

			// Set the 3D model poster as it's loading to the low rez screenshot.
			poster.style.backgroundImage = `url('3DProjects/${modelProjects[projectIndex].folder}/images/thumbnails/${modelProjects[projectIndex].thumbnails[0]}')`;

			if(projectIndex !== -1) {
				removeModelInfo();
				startTypingNewModelInfo();
				loadNewModelIntoModelViewer();
				additionalOptionsContainer.style.display = "flex";
				setTimeout(()=>{modelViewer.setAttribute("auto-rotate", "")}, 1300);
			}
		}
		else { // if modelProjects is false, try again after the specified time to see if the JSON file has finished loading.
			setTimeout(modelProjectManager(clicked), 100);
		}
	}
	// Fix for failure to scroll the model viewer into view when clicking on a project.
	// Delay the scroll for 2 frames to avoid attempting to scroll while the content is being repainted.
	setTimeout(() => {requestAnimationFrame(() => {webGLViewer.scrollIntoView()})}, 32);
}

/** Close the model project viewer
 * 
 */
function closeModelViewer() {
	fadeOut(webGLViewer);
	lastModelLoaded = null;
}
/**
 * Clear out the information for each item in the specs section of the viewer
 */
function removeModelInfo() {
	modelInfoTypingTextContainer.forEach((item, index) => {
		clearTimeout(item.typer); // This fixes a bug where multiple typing animations could overlap if the user clicks on a model project rapidly
		fadeOut(item.elm, false);
		if(index != 0) { // If not the title of each data section, e.g. the part of the page that says date, faces, vertices, etc
			item.elm.innerHTML = "";
		}
	});
}

/**
 * Add in the information for each of the specs for the model that was selected.
 */
function startTypingNewModelInfo() {
	modelInfoTypingTextContainer.forEach((element, index) => {
		element.typer = setTimeout(() => {
			if(index === 0) {
				fadeIn(specs, false);
			}
			else if(index === 9){
				addAdditionalOptions();
			}
			else {
				startTypeOut(element, Object.values(modelProjects[projectIndex])[index], 30);
			}
		}, element.typingDelay)
	});
}

/**
 * Loads or switches the model that is displayed in the modelviewer window.
 */
function loadNewModelIntoModelViewer() {
	modelViewer.removeAttribute("auto-rotate");
	modelViewer.showPoster();
	setTimeout(async () => { // Delay the loading of a model in order to avoid the framerate drop that comes with trying to load it.
		modelViewer.src =  `3DProjects/${modelProjects[projectIndex].folder}/${modelProjects[projectIndex].model}`;
		let checkLoad = setInterval(()=> {
			if(modelViewer.loaded) {
				modelViewer.resetTurntableRotation();
				modelViewer.cameraOrbit = modelProjects[projectIndex].initialOrbit;
				modelViewer.setAttribute("exposure", modelProjects[projectIndex].exposure);
				modelViewer.dismissPoster();
				clearInterval(checkLoad);
			}
		}, 50); // Interval
	}, 1100); // Timeout
	setTimeout(fadeIn(additionalOptionsContainer), 301);
}

/**
 * Add thumbnails to the bottom of the model viewing section which can be clicked to display different screenshots or the 3D viewer.
 * @param {number} z Which thumbnail to add
 */
function addAdditionalOptions(z = 0) {
	if(z < modelProjects[projectIndex].thumbnails.length) {
		let link = document.createElement('a');
		let option = document.createElement('img');
		link.href = "#webGLViewer";
		link.appendChild(option)
		additionalOptionsContainer.appendChild(link);
		option.src = `3DProjects/${modelProjects[projectIndex].folder}/images/thumbnails/${modelProjects[projectIndex].thumbnails[z]}`;
		option.onclick = () => clickManager(z - 1);
		option.loading = "eager";
		fadeIn(option)
		z++
		setTimeout(() => addAdditionalOptions(z), 50);
		// update to add all right away but fade in at a different speeds
	}
}

/**
 *	ClickManager determines which full size image to display in the viewing area. 
 *	It's called when the user clicks on the next or previous buttons or when they click on a thumbnail.
 *	@param {*} number The array index of the full size image to load. 'next' and 'previous are also an option.
 */
function clickManager(number) {
	if(number == 'next' && thumbnailClicked < imgs[projectIndex].length - 1) {
		thumbnailClicked++;
	}
	else if(number == 'previous' && thumbnailClicked > -1) {
		thumbnailClicked--;
	}
	if(number != 'next' && number != 'previous') {
		thumbnailClicked = number - 1;
	}
	CanvasManager(thumbnailClicked);
	loadingManager(thumbnailClicked);
}

/**
 * Fade in or Fade out the modelviewer
 * @param {number} clicked if clicked is -1 fade in the modelviewer, otherwise, fade out
 */
function CanvasManager(clicked) {
	if(clicked === -1) {
		fadeIn(modelViewer);
	}
	else {
		fadeOut(modelViewer);
	}
}

/**
 * Manages the images in the 3D models section, if a render hasn't been loaded yet, load it, otherwise fade it in. fade out all other models
 * @param {number} clicked the thumbnail that was clicked
 */
function loadingManager(clicked) {
	imgs[projectIndex].forEach((item, index) =>	{
		if(index === clicked) {
			fadeIn(item);
		}
		else {
			fadeOut(item);
		}
	});

	// If the clicked item has already been loaded, and the clicked item isn't the modelviewer
	if(!imgLoaded[projectIndex][clicked] && clicked >= 0){
		loadAndAddImage(viewerImg, clicked);
		imgLoaded[projectIndex][clicked] = true;
	}
}

/**
 * Handler for modelProjects.forEach, adds an array to the images array, the new array contains the paths to all the images for a given model project
 * @param {*} item Each array item from the modelProjects array
 * @param {number} projIndex the index of each array item
 */
function prepareProjects(item, projIndex) {
	imgs[projIndex] = new Array(item.images.length);
	imgLoaded[projIndex] = new Array(item.images.length);
	item.images.forEach((innerItem, imageIndex) => prepareDisplayImgs(innerItem, imageIndex, projIndex));

	const element = document.getElementById(item.uniqueName);
	if(element) {
		element.addEventListener('click', () => modelProjectManager(item.uniqueName), passive);
	}
	else {
		console.error(`Missing link to 3D Model with uniqueName: ${item.uniqueName}`)
	}
}

/**
 * Creates an image object for all images that can be loaded in the 3D projects section
 * @param {*} item unused
 * @param {number} imageIndex The index of "images" from 3D projects.json
 * @param {number} projIndex The index of the 3D model project object from 3DProjects.json
 */
function prepareDisplayImgs(item, imageIndex, projIndex) {
	imgs[projIndex][imageIndex] = new Image ();
}

/**
 * load a 3D Model image and add it to a container element
 * @param {element} imgContainer the element that holds the image element
 * @param {number} number the index of the image to load, comes from the "images" array in 3DProjects.json
 */
async function loadAndAddImage(imgContainer, number) {
	let img = imgs[projectIndex][number];
	let projectFolder = modelProjects[projectIndex].folder;
	let imageSrc;

	if(avifSupported) {
		imageSrc = modelProjects[projectIndex].avifImages[number];
	}
	else {
		imageSrc = modelProjects[projectIndex].images[number];
	}
	
	const modelImg = `3DProjects/${projectFolder}/images/${imageSrc}`;
	loadingBarWidth = 0;
	await Promise.all([
		fetchImg(modelImg)
		.then((url) => {img.src = url}),
		startLoadingBarUpdate()
	]).then(() => {
		imgContainer.appendChild(img);
		fadeIn(img);
	});
}

/**
 * Asynchronously loads an image from the provided source.
 * @param {sting} src file path to the image that should be fetched
 * @returns {Promise} Blob URL that can be added to a src attribute of an image
 */
async function fetchImg(src) {
	return new Promise(async (resolve) => {
		let response = await fetch(src);
		const reader = response.body.getReader();
		const contentLength = +response.headers.get('Content-Length');
		let receivedLength = 0; // received that many bytes at the moment
		let chunks = []; // array of received binary chunks (comprises the body)

		let blob = await imgStreamReader();
		resolve(window.URL.createObjectURL(blob));

		/**
		 * Helper function that reads the data stream of the fetched image
		 * @returns {Blob} Blob image data
		 */
		function imgStreamReader() {
			return  reader.read().then(({value, done}) => {
				if (done) {
					return new Blob(chunks);
				  }
				chunks.push(value);
				receivedLength += value.length;
				loadingBarWidth = parseInt((receivedLength / contentLength) * 100);
				return imgStreamReader();
			})
		}
	});
}

/**
 * Open the fullscreen view for the model viewer
 * @todo apply styles through css classes rather than through javascript
 */
function fullscreenOpen() {
	let elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
	viewport.classList.add("fullscreenViewer3d");
	viewport.style.width = `${window.innerWidth}px`;
	viewport.style.minWidth = "100%";
	viewport.classList.remove("defaultViewer3D");
	fullscreenBtn.style.display = "none";
	fullscreenCloseBtn.style.display = "flex";
	nxtBtn.style.position = "fixed";
	preBtn.style.position = "fixed";
	modelCopyright.style.position = "fixed";
	document.body.style.overflow = "hidden";
	gotoTopBtn.style.display = "none";
}

/**
 * Close the fullscreen view for the model viewer, returns the view to it's initial state
 * @todo apply styles through css classes rather than through javascript
 */
function fullscreenClose() {

	function fullscreenCloseHelper() {
		viewport.classList.add("defaultViewer3D");
		viewport.style.width = "";
		viewport.style.minWidth = "";
		viewport.classList.remove("fullscreenViewer3d");
		fullscreenBtn.style.display = "initial";
		fullscreenCloseBtn.style.display = "none";
		nxtBtn.style.position = "absolute";
		preBtn.style.position = "absolute";
		modelCopyright.style.position = "absolute";
		document.body.style.overflow = "auto";
		gotoTopBtn.style.display = "flex";
	}

	if (document.exitFullscreen) {
		fullscreenCloseHelper();
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) { /* Firefox */
		fullscreenCloseHelper();
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
		fullscreenCloseHelper();
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) { /* IE/Edge */
		fullscreenCloseHelper();
		document.msExitFullscreen();
	}
	else {
		fullscreenCloseHelper();
	}
}

/**
 * Update the width of the loading bar based on the progress
 * @param {number} width the current % width of the loading bar can range between 0% and 100% 
 */
function loadingBarUpdate(width) {
	loadingBar.style.width = `calc(${width}% - 32px - 10px`;
}

/**
 * starts a periodic update to the loading bar based on the value of the global variable loadingBarWidth. Ends when loadingBarWidth >= 100
 * @returns {Promise}
 * @todo make this function accept a loading bar object that will allow it to be reused in more areas.
 */
async function startLoadingBarUpdate() {
	new Promise((resolve) => {
		fadeIn(loadingBar);
		let ls = setTimeout(()=>{fadeIn(loadingSpinner)}, 200);
		let checkProgress = setInterval(frame, 10);
		function frame() {
			if (loadingBarWidth >= 100) {
				clearInterval(checkProgress);
				clearInterval(ls)
				fadeOut(loadingBar);
				fadeOut(loadingSpinner);
				resolve();
			} else {
				loadingBarUpdate(loadingBarWidth);
			}
		}
	});
}

/**
 * Start typing out the element that's passed in to textTypingObj
 * @param {element} textTypingObj the element which will contain the typed out text
 * @param {string} txt The text to add to element which will be shown on the page
 * @param {number} speed The speed to type the text out
 */
async function startTypeOut(textTypingObj, txt, speed) { 
	fadeIn(textTypingObj.elm);
	if(txt.length < 50) {
		textTypingObj.typer = setTimeout(() => typeLetter(textTypingObj, txt, speed), speed);
	}
	else {
		textTypingObj.elm.innerHTML = txt;
	}
}

/**
 * Recursively add the next letter from a string to the given element 
 * @param {element} elm element to add a letter to
 * @param {string} txt string which contains the letter that will be added
 * @param {number} speed delay between each letter being typed
 * @param {number} i index of the current letter being typed
 */
async function typeLetter(elm, txt, speed, i = 0) {
	if (i < txt.length) {
		elm.elm.innerHTML += txt.charAt(i);
		i++;
		elm.typer = setTimeout(() => typeLetter(elm, txt, speed, i), speed);
	}
}

/**
 * Animate the opacity of an element to fade out
 * @param {element} element DOM Element to be faded out 
 * @param {boolean} remove if set to false, will not set element to display none
 */
function fadeOut(element, remove = true) {
	element.style.opacity = 0;
	element.classList.remove("fadeOut");
	element.classList.add("fadeOut");
	if(element.classList.contains("fadeIn")) {
		element.classList.remove("fadeIn");
	}
	if(remove) {
		setTimeout(() => {
			if(element.classList.contains("fadeOut")) {
				element.style.display = "none";
			}
		}, 300);	
	}
}

/**
 * Animate the opacity of an element to fade in
 * @param {element} element DOM Element to be faded in 
 * @param {boolean} remove if set to false, will not change display to block
 */
function fadeIn(element, add = true, displayType = "block") {
	element.style.opacity = 1;
	element.classList.add("fadeIn");
	element.classList.remove("fadeOut");
	if(add) {
		element.style.display = displayType;
	}
}

/**
 * Takes the classlist of an element, applys the fadeInOnScroll2 class. (causing a fadein animation)
 * @param {DOMTokenList} element classlist of the element
 */
 function queueFadeInOnScroll(element) {
	let delay = fadeInOnScrollQueue * 50;
	// If more than 10 animations are queued, start new animations with a shorter delay.
	if(delay > 1400) delay = fadeInOnScrollQueue * 10;
	setTimeout(() => {
		element.remove("fadeInOnScroll");
		element.add("fadeInOnScroll2");
		fadeInOnScrollQueue--;
	}, delay);
	fadeInOnScrollQueue++;
}

/**
 * Change the max height of an element to show more.
 * @param {string} id the ID of the text element to show more.
 */
function showMore(element) {
	if(element.classList.contains("showMore")) {
		element.classList.remove("showMore");
	}
	else {
		element.classList.add("showMore");
	}
}

function moreButtonClickHandler(event) {
	const et = event.target;
	let content;
	if(et.classList.contains("moreButton")) {
		content = et.childNodes[1].classList;
	}
	else if(et.classList.contains("moreButtonContent") || et.classList.contains("lessButtonContent")) {
		content = event.target.classList;
	}

	if(content.contains("moreButtonContent")) {
		content.remove("moreButtonContent")
		content.add("lessButtonContent")
	}
	else if(content.contains("lessButtonContent")) {
		content.remove("lessButtonContent")
		content.add("moreButtonContent")
	}
	if(et.previousElementSibling != null) {
		if (et.previousElementSibling.classList.contains("showMoreHidden")) {
			showMore(et.previousElementSibling);
		}
	}
	if(et.parentElement.previousElementSibling != null) {
		if (et.parentElement.previousElementSibling.classList.contains("showMoreHidden")) {
			showMore(et.parentElement.previousElementSibling);
		}
	}
}