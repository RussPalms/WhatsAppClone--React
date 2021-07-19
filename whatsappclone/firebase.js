import firebase from "firebase";

const firebaseConfig = {
	apiKey: "AIzaSyDe-_bhGl0BDU5YcBIumvSVE7DCMR2EDKM",
	authDomain: "whatsapp-clone--react.firebaseapp.com",
	projectId: "whatsapp-clone--react",
	storageBucket: "whatsapp-clone--react.appspot.com",
	messagingSenderId: "971767945715",
	appId: "1:971767945715:web:ac56be522f04dfcf3d9a86",
};

//   setting up access to firebase
//  initialize the app
//  because we're using firebase authentication we need to protect ourselves by creating
//  a fast refresh mechanism
//  we don't want to reinitialize the app a second time if we don't need to
// this basically says if we've already initilized it, then go ahead and initilize the app
// otherwise initialize a new one with the config
const app = !firebase.apps.length
	? firebase.initializeApp(firebaseConfig)
	: firebase.app();

// this will give me the firestore instance for our database
const db = app.firestore();
// this will get my authenticaiton instance
const auth = app.auth();
// this will get our provider
const provider = new firebase.auth.GoogleAuthProvider();

// this will allow us to have access to our firebase modules inside of our application
export { db, auth, provider };
