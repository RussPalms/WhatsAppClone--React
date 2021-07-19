// this function's purpose is to take in an array which will be the user that is logged in
// and return the string value of the recipient
const getRecipientEmail = (users, userLoggedIn) =>
	// this will filter down the array
	users?.filter((userToFilter) => userToFilter !== userLoggedIn?.email)[0];

export default getRecipientEmail;
