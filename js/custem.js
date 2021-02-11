let ModelViewerLoaded = false;
let ThumpnailClicked = -1;
let LastThumpnailClicked = -1;
let fullscreen = false;
let ProjectIndex = 0;

let loading = document.getElementById("loading");
let gotoTopBtn = document.getElementById("gotoTopBtn");
let nav = document.getElementById("nav");
let hamburg = document.getElementById("hamburg");
let modelingSection = document.getElementById("modeling");
let modelingLabel = document.getElementById("modelingLabel");
let viewport = document.getElementById("viewer3d");
//let loadBtn = document.getElementById("loadBtn");
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

let fadeInObjs = []; // Array

let modelInfo = [
	new Elm(specs),
	new Elm(title),
	new Elm(description),
	new Elm(date),
	new Elm(size),
	new Elm(textureRez),
	new Elm(verts),
	new Elm(faces),
	new Elm(mats),
	new Elm(additionalOptionsContainer)
];

let imgs; // 2D Array
let imgLoaded;

Image.prototype.completedPercentage = 0;

let ModelProjects;
fetch('3DProjects/3DProjects.json')
.then(response => response.json())
.then(data => ModelProjects = data)
.then(ModelProjects => {
	imgs = new Array(ModelProjects.length);
	imgLoaded = new Array(ModelProjects.length);
	ModelProjects.forEach(prepareProjects); 
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

function Elm(element, typer = null) {
	this.elm = element;
	this.typer = typer;
}

//loadBtn.addEventListener("click", function() {ModelViewerLoaded = true;});
ModelViewerLoaded = true;
fullscreenBtn.addEventListener("click", fullscreenToggle)
fullscreenCloseBtn.addEventListener("click", fullscreenClose)

window.addEventListener("load", () => {
	fadeInObjs = window.document.querySelectorAll(".fadeInOnScroll");
	createObserver();
});

async function init() {
	await Promise.all([
		resizeManager()
	]);
	
}

function createObserver() {
	let observer;

	let options = {
		root: null,
		rootMargin: "0px",
		threshold: 0.4
	}

	observer = new IntersectionObserver(handleIntersect, options);
	fadeInObjs.forEach(async element => {
		await observer.observe(element);
	});
	observer.observe(modelingSection);
	observer.observe(modelingLabel);
	observer.observe(viewport);
}

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

async function modelProjectManager(clicked) {
	if(hasValue(ModelProjects)) {
		fadeIn(webGLViewer);
		
		// Clear/Reset each item in the specs section of the viewer.
		modelInfo.forEach((item, index) => {
			clearTimeout(item.typer);
			fadeOut2(item.elm);
			if(index != 0) { // if not specs
				item.elm.innerHTML = "";
			}
		});

		if(LastThumpnailClicked != -1) {
			fadeOut(imgs[ProjectIndex][LastThumpnailClicked]);
		}
		fadeIn(modelViewer);
		//fadeIn(loadBtn);

		ThumpnailClicked = -1;
		LastThumpnailClicked = -1;
		//ModelViewerLoaded = false; // Future update, don't reload the viewer, use fadein/fadeout

		ProjectIndex = findIndex(clicked);

		poster.style.backgroundImage = `url('3DProjects/${ModelProjects[ProjectIndex].folder}/images/thumbnails/${ModelProjects[ProjectIndex].thumbnails[0]}')`;
		//console.log(ModelProjects[ProjectIndex].thumbnails[0]);

		if(hasValue(ProjectIndex)) {
			await Promise.all([
				modelInfo[0].typer = setTimeout(async () => fadeIn2(specs), 619),			
				modelInfo[1].typer = setTimeout(async () => startTypeOut(modelInfo[1], ModelProjects[ProjectIndex].projectTitle, 30), 300),
				modelInfo[2].typer = setTimeout(async () => startTypeOut(modelInfo[2], ModelProjects[ProjectIndex].description, 1), 600),
				modelInfo[3].typer = setTimeout(async () => startTypeOut(modelInfo[3], ModelProjects[ProjectIndex].date, 30), 620),
				modelInfo[4].typer = setTimeout(async () => startTypeOut(modelInfo[4], ModelProjects[ProjectIndex].size, 30), 620),
				modelInfo[5].typer = setTimeout(async () => startTypeOut(modelInfo[5], ModelProjects[ProjectIndex].textureRez, 30), 620),
				modelInfo[6].typer = setTimeout(async () => startTypeOut(modelInfo[6], ModelProjects[ProjectIndex].verts, 30), 620),
				modelInfo[7].typer = setTimeout(async () => startTypeOut(modelInfo[7], ModelProjects[ProjectIndex].faces, 30), 620),
				modelInfo[8].typer = setTimeout(async () => startTypeOut(modelInfo[8], ModelProjects[ProjectIndex].mats, 30), 620),
				
				// The line below delays the loading of a model in order to avoid the framerate drop that comes with trying to load it.
				modelViewer.showPoster(),
				setTimeout(async () => {

					modelViewer.src =  `3DProjects/${ModelProjects[ProjectIndex].folder}/${ModelProjects[ProjectIndex].model}`;
					let checkload = setInterval(()=> {
						if(modelViewer.loaded) {
							modelViewer.resetTurntableRotation();
							modelViewer.cameraOrbit = ModelProjects[ProjectIndex].initialOrbit;
							modelViewer.setAttribute("exposure", ModelProjects[ProjectIndex].exposure);
							clearInterval(checkload);
						}
					}, 50);

				}, 1100),
				setTimeout(fadeIn(additionalOptionsContainer), 301),
				modelInfo[9].typer = setTimeout(async () => addAdditionalOptions(), 400)
			]);

			additionalOptionsContainer.style.display = "flex"
			function addAdditionalOptions(z = 0) {
				if(z < ModelProjects[ProjectIndex].thumbnails.length) {
					let link = document.createElement('a');
					let option = document.createElement('img');
					link.href = "#webGLViewer";
					link.appendChild(option)
					additionalOptionsContainer.appendChild(link);
					option.src = `3DProjects/${ModelProjects[ProjectIndex].folder}/images/thumbnails/${ModelProjects[ProjectIndex].thumbnails[z]}`;
					option.classList.add("clickable");
					option.onclick = () => clickManager(z - 1);
					option.loading = "eager";
					fadeIn(option)
					z++
					setTimeout(() => addAdditionalOptions(z), 50);
					// update to add all right away but fade in at a different speeds
				}
			}
		}
	}
	else {
		setTimeout(modelProjectManager(clicked), 100);
	}
}

function hasValue(x) {
	if(x !== undefined && x !== null && x !== '') {
		return true;
	} else {
		return false;
	}
}

function findIndex(name) {
	for (let i = 0; i < ModelProjects.length; i++) {
		if (name === ModelProjects[i].uniqueName) {
			return i;
		}
	}
	throw "Index not found.";
}

function clickManager(number) {
	if(number == 'next' && LastThumpnailClicked < imgs[ProjectIndex].length - 1) {
		ThumpnailClicked = LastThumpnailClicked + 1;
	}
	else if(number == 'previous' && LastThumpnailClicked > -1) {
		ThumpnailClicked = LastThumpnailClicked - 1;
	}
	if(number != 'next' && number != 'previous') {
		ThumpnailClicked = number - 1;
	}
	CanvasManager(ThumpnailClicked);
	loadingManager(ThumpnailClicked);
	LastThumpnailClicked = ThumpnailClicked;
}

function CanvasManager(clicked) {
	if(clicked === -1) {
		if(ModelViewerLoaded) {
			fadeIn(modelViewer);
		}
		else {
			//fadeIn(loadBtn);
		}
	}
	else {
		if(ModelViewerLoaded) {
			fadeOut(modelViewer);
		}
		//fadeOut(loadBtn);
	}
}

function loadingManager(clicked) {
	for(let i = 0; i < imgs[ProjectIndex].length; i++)	{
		let img = imgs[ProjectIndex][i];
		if(i === clicked) {
			fadeIn(img);
		}
		else {
			fadeOut(img);
		}
	}

	if(!imgLoaded[ProjectIndex][clicked] && clicked >= 0){
		loadAndAddImage(viewerImg, clicked);
		imgLoaded[ProjectIndex][clicked] = true;
	}
}

function prepareProjects(item, projIndex, ary) {
	imgs[projIndex] = new Array(item.length);
	imgLoaded[projIndex] = new Array(item.length);
	item.images.forEach((innerItem, imageIndex) => prepareDisplayImgs(innerItem, imageIndex, projIndex));
}

function prepareDisplayImgs(item, imageIndex, projIndex) {
	imgs[projIndex][imageIndex] = new Image ();
}

function loadAndAddImage(imgContainer, number) {
	let img = imgs[ProjectIndex][number];
	img.load(`3DProjects/${ModelProjects[ProjectIndex].folder}/images/${ModelProjects[ProjectIndex].images[number]}`);
	
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

function fullscreenToggle() {
	if (fullscreen) {
		fullscreenClose();
	}
	else {
		fullscreenOpen();
	}
}

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
	viewport.classList.remove("defautViewer3D");
	//fullscreenBtn.style.position = "fixed";
	fullscreenBtn.style.display = "none";
	fullscreenCloseBtn.style.display = "flex";
	nxtBtn.style.position = "fixed";
	preBtn.style.position = "fixed";
	modelCopyright.style.position = "fixed";
	document.body.style.overflow = "hidden";
	gotoTopBtn.style.display = "none";
	fullscreen = true;
}

function fullscreenClose() {

	function fullscreencloseHelper() {
		viewport.classList.add("defautViewer3D");
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
		fullscreen = false;
	}

	if (document.exitFullscreen) {
		fullscreencloseHelper();
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		fullscreencloseHelper();
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		fullscreencloseHelper();
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		fullscreencloseHelper();
		document.msExitFullscreen();
	}
	else {
		fullscreencloseHelper();
	}
}

function loadingBarUpdate(width) {
	loadingBar.style.width = `calc(${width}% - 32px - 10px`;
}

async function startTypeOut(elm, txt, speed, i = 0) { 
	fadeIn(elm.elm);
	if(txt.length < 50)
	elm.typer = setTimeout(async () => await typeOut(elm, txt, speed, i), speed);
	else
		elm.elm.innerHTML = txt;
}

async function typeOut(elm, txt, speed, i) {
	if (i < txt.length) {
		elm.elm.innerHTML += txt.charAt(i);
		i++;
		elm.typer = setTimeout(async () => await typeOut(elm, txt, speed, i), speed);
	}
}

function fadeOut(obj){
	obj.style.opacity = 0;
	obj.classList.remove("fadeOut");
	if(obj.classList.contains("fadeIn")) {
		obj.classList.add("fadeOut");
		obj.classList.remove("fadeIn");
	}
	setTimeout(() => {obj.style.display = "none";}, 300);
}

function fadeIn(obj){
	obj.style.display = "block";
	obj.style.opacity = 1;
	obj.classList.add("fadeIn");
	obj.classList.remove("fadeOut");
}

function fadeOut2(obj){
	obj.style.opacity = 0;
	obj.classList.remove("fadeOut");
	if(obj.classList.contains("fadeIn")) {
		obj.classList.add("fadeOut");
		obj.classList.remove("fadeIn");
	}
}

function fadeIn2(obj){
	obj.style.opacity = 1;
	obj.classList.add("fadeIn");
	obj.classList.remove("fadeOut");
}
async function resizeManager() {
	navstate = false;
	if(window.innerWidth >= 1100) {
		nav.style.transition = "0s";
		nav.style.maxHeight = "340px";
	}
	else {
		navtoggle(true);
		setTimeout(() => {nav.style.transition = "0.2s ease-out";}, 10); // Settimeout is required, otherwise it will animate oddly on a resize.
	}
}

let navState = false;
function navtoggle(closeNav = false) {
	if ((navState || closeNav) && window.innerWidth <= 1100) { // If mobile nav is not already open.
		nav.style.maxHeight = "0px";
		setTimeout(() => {hamburg.classList.add("navclosed")},201); // using settimeout here to allow the proper animation to play. avoiding an animation delay on the top bar.
		hamburg.classList.remove("navopen");
		navState = false;
	}
	else {
		nav.style.maxHeight = "340px";
		hamburg.classList.add("navopen");
		hamburg.classList.remove("navclosed");
		navState = true;
	}
}