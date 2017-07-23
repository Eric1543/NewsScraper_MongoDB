$(document).on("click", "#savedArticles", function(){
	document.location.href='/saved';
});

$(document).on("click", "#allArticles", function(){
	document.location.href='/';
});

$(document).on("click", "#scrapeButton", function(){
	$.ajax({
		method: "post",
		url: "/scrape"
	}).done(function(){
		alert("Scrape complete");
		console.log("Scrape complete");
		document.location.href='/';
	})
});