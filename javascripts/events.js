"use strict";

const tmdb = require('./tmdb');
const dom = require('./dom');
const firebaseApi = require('./firebaseApi');

const pressEnter = () => {
	$(document).keypress((e) => {
		if (e.key === 'Enter') {
			console.log("inside enter");
			let searchText = $('#searchBar').val();
			let query = searchText.replace(" ", "%20");
			console.log(query);
			tmdb.searchMovies(query);
		}
	});

};

const myLinks = () => {
	$(document).click((e) => {
		if (e.target.id === 'navSearch'){
			$('#search').removeClass('hide');
			$('#myMovies').addClass('hide');
			$('#authScreen').addClass('hide');
		} else if (e.target.id === 'mine') {
			firebaseApi.getMovieList().then((results) =>{
				dom.clearDom('moviesMine');
				dom.domString(results, tmdb.getImgConfig(), 'moviesMine');
			}).catch((err) =>{
				console.log("error in getMovieList", err);
			});
			$('#search').addClass('hide');
			$('#myMovies').removeClass('hide');
			$('#authScreen').addClass('hide');
		} else if (e.target.id === 'authenticate') {
			$('#search').addClass('hide');
			$('#myMovies').addClass('hide');
			$('#authScreen').removeClass('hide');
		}
	});
};

const googleAuth = () => {
	$('#googleButton').click((e) => {
		firebaseApi.authenticateGoogle().then((result) => {
			console.log("auth", result);
		});
	});
};

const wishListEvents = () => {
	$('body').on('click', '.wishlist', (e) => {
		console.log("wishlist event", e);
		let mommyDiv = e.target.closest('.movie');

		let newMovie = {
			"title": $(mommyDiv).find('.title').html(),
			"overview": $(mommyDiv).find('.overview').html(),
			"poster_path": $(mommyDiv).find('.poster_path').attr('src').split('//').pop(),
			"rating": 0,
			"isWatched": false,
			"uid": ""
		};
		console.log("newMovie", newMovie);
		// firebaseApi.saveMovie().then().catch;
	});
};

module.exports = {pressEnter, myLinks, googleAuth, wishListEvents};