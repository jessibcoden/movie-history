(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

const tmdb = require('./tmdb');
const firebaseApi = require('./firebaseApi');

const apiKeys = () => {
	// promise
	return new Promise((resolve, reject) => {
		$.ajax('./db/apiKeys.json').done((data) => {
			resolve(data.apiKeys);
		}).fail((error) => {
			reject(error);
		});
	});
};

const retrieveKeys = () => {
	apiKeys().then((results) => {
		tmdb.setKey(results.tmdb.apiKey);
		firebaseApi.setKey(results.firebaseKeys);
		firebase.initializeApp(results.firebaseKeys);
	}).catch((error) => {
		console.log("error in retrieve keys", error);
	});
};

module.exports = {retrieveKeys};
},{"./firebaseApi":4,"./tmdb":6}],2:[function(require,module,exports){
"use strict";

const domString = (movieArray, imgConfig, divName, search) => {
	console.log("movie Array", movieArray);
	let domString = '';
	for(let i = 0; i < movieArray.length; i++) {
		if(i % 3 === 0){
			domString += 	`<div class="row">`;
		}
		domString +=		`<div class="movie col-sm-6 col-md-4">`;
		domString +=			`<div class="thumbnail">`;

		if(!search){
			domString +=				`<button class="btn btn-default" data-firebase-id="${movieArray[i].id}">X</button>`;
			}

			domString +=				`<img class="poster_path" src="${imgConfig.base_url}/w342/${movieArray[i].poster_path}" alt="">`;
			domString +=				 `<div class="caption">`;
			domString +=				     `<h3 class="title">${movieArray[i].title}</h3>`;
			domString +=				     `<p class="overview">${movieArray[i].overview}</p>`;

		if(search){

			domString +=				     `<p><a class="btn btn-primary review" role="button">Review</a>`;
			domString +=					 `<a class="btn btn-default wishlist" role="button"> Wishlist</a></p>`;
		} else {
			domString +=					`<p>Rating: ${movieArray[i].rating}</p>`;
		}
		domString +=				      	`</div>`;
		domString +=				    `</div>`;
		domString +=				  `</div>`;
		
		if(i % 3 === 2){
			domString += `</div>`;
		}
	}
	printToDom(domString, divName);
};

const printToDom = (strang, divName) => {
	$(`#${divName}`).append(strang);
};

const clearDom = (divName) => {
	$(`#${divName}`).empty();
};

module.exports = {domString, clearDom};
},{}],3:[function(require,module,exports){
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
				dom.domString(results, tmdb.getImgConfig(), 'moviesMine', false);
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
		let mommyDiv = e.target.closest('.movie');
		let newMovie = {
			"title": $(mommyDiv).find('.title').html(),
			"overview": $(mommyDiv).find('.overview').html(),
			"poster_path": $(mommyDiv).find('.poster_path').attr('src').split('//').pop(),
			"rating": 0,
			"isWatched": false,
			"uid": ""
		};
		firebaseApi.saveMovie(newMovie).then((results) => {
			$(mommyDiv).remove();			
		}).catch((err) => {
			console.log("error in saveMOvie", err);
		});
	});
};

const reviewEvents = () => {
	$('body').on('click', '.review', (e) => {
		let mommyDiv = e.target.closest('.movie');
		let newMovie = {
			"title": $(mommyDiv).find('.title').html(),
			"overview": $(mommyDiv).find('.overview').html(),
			"poster_path": $(mommyDiv).find('.poster_path').attr('src').split('//').pop(),
			"rating": 0,
			"isWatched": true,
			"uid": ""
		};
		firebaseApi.saveMovie(newMovie).then((results) => {
			$(mommyDiv).remove();		
		}).catch((err) => {
			console.log("error in saveMOvie", err);
		});
	});
};

let init = () =>{
	myLinks();
	googleAuth();
	pressEnter();
	wishListEvents();
	reviewEvents();
};

module.exports = {init};
},{"./dom":2,"./firebaseApi":4,"./tmdb":6}],4:[function(require,module,exports){
"use strict";

let firebaseKey = '';
let userUid = '';

const setKey = (key) => {
	firebaseKey = key;
};

//Firebase: GOOGLE - Use input credentials to authenticate user.
let authenticateGoogle = () => {
	return new Promise((resolve, reject) => {
	  var provider = new firebase.auth.GoogleAuthProvider();
	  firebase.auth().signInWithPopup(provider)
	    .then((authData) => {
	    	userUid = authData.user.uid;
	        resolve(authData.user);
	    }).catch((error) => {
	        reject(error);
	    });
	});
};

// GO INTO FIREBASE, DATABASE, RULES and change it to the following:
// {
//   "rules": {
//     ".read": "true",
//     ".write": "true",
//       "movies": {
//         ".indexOn": "uid"
//       }
//   }
// }

const getMovieList = () => {
	let movies = [];
	return new Promise ((resolve, reject) => {
		$.ajax(`${firebaseKey.databaseURL}/movies.json?orderBy="uid"&equalTo="${userUid}"`).then((fbMovies) => {
			if(fbMovies != null){
			Object.keys(fbMovies).forEach((key) => {
			// Object.keys returns an array
				fbMovies[key].id = key;   
				// Previous line translates to fbMovies["movies0"].id = "movies0"
				movies.push(fbMovies[key]);
			});
		}
			resolve(movies);
		}).catch((err) => {
			reject(err);
		});
	});
};

const saveMovie = (movie) => {
	movie.uid = userUid;
	return new Promise((resolve, reject) => {
		$.ajax({
			method: "POST",
			url: `${firebaseKey.databaseURL}/movies.json`,
			data: JSON.stringify(movie)
		}).then((result) => {
			resolve(result);
		}).catch((error) => {
			reject(error);
		});
	});
};

module.exports = {setKey, authenticateGoogle, getMovieList, saveMovie};
},{}],5:[function(require,module,exports){
"use strict";

let events = require('./events');
let apiKeys = require('./apiKeys');

apiKeys.retrieveKeys();
events.init();

},{"./apiKeys":1,"./events":3}],6:[function(require,module,exports){
"use strict";

let tmdbKey;
let imgConfig;
const dom = require('./dom');

const searchTMDB = (query) => {
	// promise search movies
	return new Promise((resolve, reject) => {
		$.ajax(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&language=en-US&page=1&include_adult=false&query=${query}`).done((data) => {
			resolve(data.results);
		}).fail((error) => {
			reject(error);
		});
	});
};

const tmdbCongifuration = () => {
	return new Promise ((resolve, reject) => {
		$.ajax(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`).done((data) => {
			resolve(data.images);
		}).fail((error) => {
			reject(error);
		});
	});
};

const getConfig = () => {
	tmdbCongifuration().then((results) => {
		imgConfig = results;
		console.log("imconfig", imgConfig);
	}).catch((error) => {
		console.log("error in getConfig", error);
	});
};

const searchMovies = (query) => {
	console.log("firebase apps?", firebase.apps);

	//execute searchTMDB
	searchTMDB(query).then((data) => {
		showResults(data);
		console.log(data);
	}).catch((error) => {
		console.log("error in search Movies", error);
	});
};

const setKey = (apiKey) => {
	// sets tmdbKey
	tmdbKey = apiKey;
	getConfig();
	console.log(tmdbKey);
};

const showResults = (movieArray) => {
	dom.clearDom('searchResults');
	dom.domString(movieArray, imgConfig, 'searchResults', true);
};

const getImgConfig = () => {
	return imgConfig;
};

module.exports = {setKey, searchMovies, getImgConfig};
},{"./dom":2}]},{},[5]);
