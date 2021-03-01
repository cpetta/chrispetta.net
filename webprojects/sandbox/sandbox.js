// Register the ServiceWorker
/*
navigator.serviceWorker.register('service-worker.js', {
  scope: '.'
}).then(function(registration) {
  console.log('The service worker has been registered ', registration);
});
*/
function drawContent(processedData) {				
	let a,b,c;
	let content = document.getElementById("content");
	let selectYear = document.getElementById("selectYear").value;
	let selectFirstSecond = document.getElementById("selectFirstSecond").value;
	
	// This line clears out content, which will allow it to be rewritten.
	content.innerHTML = "";
	
	for(a = 0; a < processedData.length; a++) {
		
		// Get data from sandbox JSON
		let articleData = processedData[a];
		
		if(articleData.year == selectYear || selectYear == 0) {
			// Add all the cards to each of the created articles.
			if(selectFirstSecond == 0 || selectFirstSecond == 1) {
				let firstYearArticle = createArticle(articleData, "1st");
				content.appendChild(firstYearArticle);
				drawCards(articleData.firstYear, firstYearArticle);
			}
			if(selectFirstSecond == 0 || selectFirstSecond == 2) {
				let secondYearArticle = createArticle(articleData, "2nd");
				content.appendChild(secondYearArticle);
				drawCards(articleData.secondYear, secondYearArticle);
			}
		}
	}
}

function drawCards(cardArray, parentContainer) {
	let search = document.getElementById("search").value;
	let searchre = new RegExp(`${search.toLowerCase()}`);
	let match = false;

	for(b = 0; b < cardArray.length; b++) {
		let cardData = cardArray[b]
		match = false;
		for(c = 0; c < 3; c++) {
		
			if(searchre == "//" || searchre.test(cardData[c].toLowerCase())) {
				match = true;
			}
		}
		if(match) {
			let card = createCard(cardData);
			parentContainer.lastChild.appendChild(card);
		}
	}
}

function createArticle(articleData, studentYear) {

	//Create article for holding the year and card information.
	let article = document.createElement("article");
	article.setAttribute("id", `${studentYear}year${articleData.year}`);
	
	// Create h1 for holding the year
	let year = document.createElement("h1");
	year.innerText = `${studentYear} Year - ${articleData.year}`;
	article.appendChild(year);
	
	// Create flexbox <div> used for holding all cards.
	let cardContainer = document.createElement("div");
	cardContainer.setAttribute("class", "box");
	article.appendChild(cardContainer)
	
	return article;
}

function createCard(cardData) {
	// Unique Data
	const url = cardData[schemea.url];
	const title = `${cardData[schemea.firstName]} ${cardData[schemea.lastName]} <br /> ${cardData[schemea.subTitle]}`;
	const image = cardData[schemea.image];
	
	// Main Container
	let sandboxItemLink = document.createElement("a");
	sandboxItemLink.setAttribute("href", `${url}`);
	sandboxItemLink.setAttribute("class", "si");
	
	// Title
	let sandboxItemTitle = document.createElement("div");
	sandboxItemTitle.setAttribute("class", "sit")
	sandboxItemTitle.innerHTML = title;
	
	// Background
	let sandboxItemBackground = document.createElement("div");
	sandboxItemBackground.setAttribute("class", "sibi");
	if(image != "")
	{
		sandboxItemBackground.setAttribute("style", `background-image: url(${image});`)
	}
	// Element Hierarchy
	sandboxItemLink.appendChild(sandboxItemTitle);
	sandboxItemLink.appendChild(sandboxItemBackground);
	
	return sandboxItemLink;
}

function determineSort() {
	let sortSelect = document.getElementById("selectSort");
	switch(sortSelect.value) {
	
	case "none":
		drawContent(data);
	break;
	
	case "firstname":
		drawContent(sortCards(data, fnobjsort));
	break;
	
	case "lastname":
		drawContent(sortCards(data, lnobjsort));
	break;
	}
}

function sortCards(data, sortType) {
	let sortedData = JSON.parse(JSON.stringify(data));
	
	let i;
	for(i = 0; i < sortedData.length; i++) {
		sortedData[i].firstYear.sort(sortType)
		sortedData[i].secondYear.sort(sortType)
	}
	return sortedData;
}

function fnobjsort(a, b) {
  if ( a[schemea.firstName] < b[schemea.firstName] ){
	return -1;
  }
  if ( a[schemea.firstName] > b[schemea.firstName] ){
	return 1;
  }
  return 0;
}

function lnobjsort(a, b) {
  if ( a[schemea.lastName] < b[schemea.lastName] ){
	return -1;
  }
  if ( a[schemea.lastName] > b[schemea.lastName] ){
	return 1;
  }
  return 0;
}

function getListOfYears() {
	let years = "";
	let i;
	for(i = 0; i < data.length; i++) {
		years = years.concat(`${data[i].year},`)
	}
	years = years.split(",")
	years.pop(); // Removes the last item from the array (which is blank because of the way it's created.
	return years;
}
function drawYearOptions() {
	let i;
	let years = getListOfYears();
	let yearOption;
	
	// Create <option>
	for(i = 0; i < years.length; i++) {
		let yearOption = document.createElement("option");
		yearOption.setAttribute("value", years[i]);
		yearOption.innerText = years[i];
		document.getElementById("selectYear").appendChild(yearOption);
	}
	
}