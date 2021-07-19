import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import Login from "./login";
import Loading from "./Loading";
import firebase from "firebase";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
	// we can think of 'Component' as the place at which we start routing
	// this will ask firebase if there is a user logged in right now
	// if there is 'user' will get that property, otherwise it will be a falsey value
	const [user, loading] = useAuthState(auth);

	// useEffect is used to trigger code at the user's lifecycles methods
	useEffect(() => {
		// there is an asynchronous aspect to this function
		if (user) {
			// here, we're tapping into firestore which is a noSQL structure database
			db.collection("users").doc(user.uid).set(
				{
					email: user.email,
					lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
					photoURL: user.photoURL,
				},
				{ merge: true }
			);
		}
	}, [user]);

	// the Loading component is a ui presentation component
	// this means I will always force the loading state
	if (loading) return <Loading />;
	// if there isn't a user, then return a login page
	if (!user) return <Login />;

	// when we hit this component, that's when the rest of the app loads
	return <Component {...pageProps} />;
}

export default MyApp;
