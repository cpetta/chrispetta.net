let navState = false;
let modelViewerLoaded = false;
let thumbnailClicked = -1;
let lastThumbnailClicked = -1;
let projectIndex = 0;

let loading = document.getElementById("loading");
let gotoTopBtn = document.getElementById("gotoTopBtn");
let nav = document.getElementById("nav");
let hamburger = document.getElementById("hamburger");
let modelingSection = document.getElementById("modeling");
let modelingLabel = document.getElementById("modelingLabel");
let viewport = document.getElementById("viewer3d");
let viewerImg = document.getElementById("viewerImg");
let fullscreenBtn = document.getElementById("fullscreenBtn");
let fullscreenCloseBtn = document.getElementById("fullscreenCloseBtn");
let modelCopyright = document.getElementById("modelCopyright");
let preBtn = document.getElementById("previousBtnWrapper");
let nxtBtn = document.getElementById("nextBtnWrapper");
let loadingSpinner = document.getElementById("loadingSpinner");
let loadingBar = document.getElementById("loadingBar");
let webGLViewer = document.getElementById("webGLViewer");
let modelViewer = document.getElementById("modelViewer");
let poster = document.getElementById("poster");
let title = document.getElementById('title');
let specs = document.getElementById('specs');
let description = document.getElementById('description');
let date = document.getElementById('date');
let size = document.getElementById('size');
let textureRez = document.getElementById('textureRez');
let verts = document.getElementById('verts');
let faces = document.getElementById('faces');
let mats = document.getElementById('mats');
let additionalOptionsContainer = document.getElementById('additionalOptionsContainer');

let fadeInObjects = []; // Array

/**
 * Array which contains all the information for a given model.
 */
let modelInfoTypingTextContainer = [
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

let imgs; // 2D Array
let imgLoaded;

Image.prototype.completedPercentage = 0;

let modelProjects;
fetch('3DProjects/3DProjects.json')
.then(response => response.json())
.then(data => modelProjects = data)
.then(modelProjects => {
	imgs = new Array(modelProjects.length);
	imgLoaded = new Array(modelProjects.length);
	modelProjects.forEach(prepareProjects); 
});

Image.prototype.load = async function(url){
	let thisImg = this;
	let xmlHTTP = new XMLHttpRequest();
	xmlHTTP.open('GET', url, true);
	xmlHTTP.responseType = 'arraybuffer';
	xmlHTTP.onloadstart = function() {
		thisImg.completedPercentage = 0;
	};
	xmlHTTP.onprogress = function(e) {
		thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100);
	};
	xmlHTTP.onload = function(e) {
		let blob = new Blob([this.response]);
		thisImg.src = window.URL.createObjectURL(blob);
	};
	xmlHTTP.send();
};
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

modelViewerLoaded = true;
fullscreenBtn.addEventListener("click", fullscreenOpen);
fullscreenCloseBtn.addEventListener("click", fullscreenClose);

window.addEventListener("load", () => {
	resizeManager();
	fadeInObjects = window.document.querySelectorAll(".fadeInOnScroll");
	createObserver();
});

window.addEventListener("resize", resizeManager);

/**
 * Applies css styles to the navigation when the screen is resized
 */
async function resizeManager() {
	navState = false;
	if(window.innerWidth >= 1100) {
		nav.style.transition = "0s";
		nav.style.maxHeight = "340px";
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
	if ((navState || closeNav) && window.innerWidth <= 1100) { // If mobile nav is not already open
		nav.style.maxHeight = "0px";
		setTimeout(() => {hamburger.classList.add("navClosed")},201); // using setTimeout here to allow the proper animation to play. avoiding an animation delay on the top bar
		hamburger.classList.remove("navOpen");
		navState = false;
	}
	else {
		nav.style.maxHeight = "340px";
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
	let options = {
		root: null,
		rootMargin: "0px",
		threshold: 0.4
	}
	observer = new IntersectionObserver(handleIntersect, options);
	fadeInObjects.forEach(async element => {
		await observer.observe(element);
	});
	observer.observe(modelingSection);
	observer.observe(modelingLabel);
	observer.observe(viewport);
}
/**
 * handleIntersect is run when the intersection observer passes an intersection threshold
 * @param {*} entries item that the observer is observing
 * @param {*} observer IntersectionObserver object
 */
async function handleIntersect(entries, observer) {
	entries.forEach(async (entry) => {
		if(entry.isIntersecting) {

			if(entry.target === modelingSection || entry.target === modelingLabel || entry.target === viewport) {
				loadScript('js/model-viewer.min.js', true);
				loadScript('js/model-viewer-legacy.js', false);
				observer.unobserve(modelingSection);
				observer.unobserve(modelingLabel);
				observer.unobserve(viewport);
			}

			entry.target.classList.remove("fadeInOnScroll");
			entry.target.classList.add("fadeInOnScroll2");
			observer.unobserve(entry.target);
		}
	})
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
	document.body.appendChild(script);
}
/**
 * When a model project is clicked, load the modelviewer UI and any assets related to the clicked item
 * @param {sting} clicked The uniqueName of a model project from the 3DProjects.json file
 */
async function modelProjectManager(clicked) {
	// modelProjects will evaluate false when the JSON file containing all the information hasn't been loaded yet
	if(modelProjects) {
		fadeIn(webGLViewer);
		if(lastThumbnailClicked != -1) { // If the last thumbnail clicked was not the modelviewer
			fadeOut(imgs[projectIndex][lastThumbnailClicked]);
		}
		fadeIn(modelViewer);
		// When a new project is being loaded, default to the model viewer
		thumbnailClicked = -1;
		lastThumbnailClicked = -1;

		const uniqueName = (element) => {return element.uniqueName === clicked}
		projectIndex = modelProjects.findIndex(uniqueName);

		// Set the 3D model poster as it's loading to the low rez screenshot.
		poster.style.backgroundImage = `url('3DProjects/${modelProjects[projectIndex].folder}/images/thumbnails/${modelProjects[projectIndex].thumbnails[0]}')`;

		if(projectIndex !== -1) {
			removeModelInfo();
			startTypingNewModelInfo();
			loadNewModelIntoModelViewer();
			additionalOptionsContainer.style.display = "flex"
		}
	}
	else { // if modelProjects is false, try again after the specified time to see if the JSON file has finished loading.
		setTimeout(modelProjectManager(clicked), 100);
	}
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
	modelViewer.showPoster(),
	setTimeout(async () => { // Delay the loading of a model in order to avoid the framerate drop that comes with trying to load it.
		modelViewer.src =  `3DProjects/${modelProjects[projectIndex].folder}/${modelProjects[projectIndex].model}`;
		let checkLoad = setInterval(()=> {
			if(modelViewer.loaded) {
				modelViewer.resetTurntableRotation();
				modelViewer.cameraOrbit = modelProjects[projectIndex].initialOrbit;
				modelViewer.setAttribute("exposure", modelProjects[projectIndex].exposure);
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
		option.classList.add("clickable");
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
	if(number == 'next' && lastThumbnailClicked < imgs[projectIndex].length - 1) {
		thumbnailClicked = lastThumbnailClicked + 1;
	}
	else if(number == 'previous' && lastThumbnailClicked > -1) {
		thumbnailClicked = lastThumbnailClicked - 1;
	}
	if(number != 'next' && number != 'previous') {
		thumbnailClicked = number - 1;
	}
	CanvasManager(thumbnailClicked);
	loadingManager(thumbnailClicked);
	lastThumbnailClicked = thumbnailClicked;
}
/**
 * Fade in or Fade out the modelviewer
 * @param {number} clicked if clicked is -1 fade in the modelviewer, otherwise, fade out
 */
function CanvasManager(clicked) {
	if(clicked === -1) {
		if(modelViewerLoaded) {
			fadeIn(modelViewer);
		}
	}
	else {
		if(modelViewerLoaded) {
			fadeOut(modelViewer);
		}
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
	imgs[projIndex] = new Array(item.length);
	imgLoaded[projIndex] = new Array(item.length);
	item.images.forEach((innerItem, imageIndex) => prepareDisplayImgs(innerItem, imageIndex, projIndex));
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
	img.load(`3DProjects/${modelProjects[projectIndex].folder}/images/${modelProjects[projectIndex].images[number]}`);
	
	let promiseToLoadImg = new Promise((resolve) => {
		let progress = 5;
		fadeIn(loadingBar);
		fadeIn(loadingSpinner);
		let checkProgress = setInterval(frame, 10);
		function frame() {
			progress = img.completedPercentage;
			if (progress >= 100) {
				clearInterval(checkProgress);
				fadeOut(loadingBar);
				fadeOut(loadingSpinner);
				resolve();
			} else {
				loadingBarUpdate(progress);
			}
		}
	});
	promiseToLoadImg.then(() => {
		fadeIn(img);
		imgContainer.appendChild(img);
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
	//fullscreenBtn.style.position = "fixed";
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
		//fullscreenBtn.style.position = "absolute";
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
function fadeOut(element, remove = true){
	element.style.opacity = 0;
	element.classList.remove("fadeOut");
	if(element.classList.contains("fadeIn")) {
		element.classList.add("fadeOut");
		element.classList.remove("fadeIn");
	}
	if(remove) {
		setTimeout(() => {element.style.display = "none";}, 300);
	}
}
/**
 * Animate the opacity of an element to fade in
 * @param {element} element DOM Element to be faded in 
 * @param {boolean} remove if set to false, will not change display to block
 */
function fadeIn(element, add = true){
	
	element.style.opacity = 1;
	element.classList.add("fadeIn");
	element.classList.remove("fadeOut");
	if(add) {
		element.style.display = "block";
	}
}