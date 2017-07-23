// Navigates to saved articles in MongoDB by redirecting to express server route 
$(document).on("click", "#savedArticles", function(){
	document.location.href='/saved';
});

// Navigates to all scraped articles in MongoDB by redirecting to express server route
$(document).on("click", "#allArticles", function(){
	document.location.href='/';
});

// Scrape new articles, then notify the user it's done and redirect to the home page
$(document).on("click", "#scrapeButton", function(){
	$.ajax({
		method: "post",
		url: "/scrape"
	}).done(function(){
		alert("Scrape complete");
		document.location.href='/';
	})
});