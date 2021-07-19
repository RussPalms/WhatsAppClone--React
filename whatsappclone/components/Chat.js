import styled from "styled-components";
import { Avatar } from "@material-ui/core";
import getRecipientEmail from "../utils/getRecipientEmail";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";

// these props that we pass in, we can destructure it to  get the id, and the user
function Chat({ id, users }) {
	const router = useRouter();
	// console.log(id, users);
	const [user] = useAuthState(auth);
	// this will cross-reference the user's collection on the database with the email of the
	// person who is the recipient
	const [recipientSnapshot] = useCollection(
		db
			.collection("users")
			.where("email", "==", getRecipientEmail(users, user))
	);
	// we're goingt to have this trigger once a user enters a chat row
	const enterChat = () => {
		// we're going to push the user to the chat page
		// the backticks are used for string interpolation which gives me access to
		// variables within a string
		router.push(`/chat/${id}`);
	};
	// this will be the recipient document
	// we use "?" or optional chaining for asychronous functions
	// we use this to protect ourselves and prevent any breaches
	const recipient = recipientSnapshot?.docs?.[0]?.data();
	const recipientEmail = getRecipientEmail(users, user);
	// console.log(recipientEmail);

	return (
		<Container onClick={enterChat}>
			{/* if I have the recipient data, then render the user's avatar wiht the source as the recipient photo URL*/}
			{recipient ? (
				<UserAvatar src={recipient?.photoURL} />
			) : (
				<UserAvatar>{recipientEmail[0]}</UserAvatar>
			)}
			{/* here we expect to see the user's avatar and a p tag which will have 
            the recipient's email*/}
			<p>{recipientEmail}</p>
		</Container>
	);
}

export default Chat;

const Container = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 15px;
	/* this is going to help if a user has a super long email and this will break it into a
    new line */
	word-break: break-word;

	:hover {
		background-color: #e9eaeb;
	}
`;

const UserAvatar = styled(Avatar)`
	margin: 5px;
	margin-right: 15px;
`;
