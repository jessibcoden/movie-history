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

module.exports = {setKey, authenticateGoogle, getMovieList};