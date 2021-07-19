import styled from "styled-components";
// IconButton turns any icon into a button
import { Avatar, Button, IconButton } from "@material-ui/core";
// import { Chat, MoreVert, Search } from "@material-ui/icons";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";

function Sidebar() {
	// this will keep a realtime mapping of the user's authentication
	const [user] = useAuthState(auth);
	// this will go to our firestore database, queries the user arrays, checks where
	// the user's email is seen and should give us all of the chats
	const userChatRef = db
		.collection("chats")
		.where("users", "array-contains", user.email);
	// now we map it to a realtime listener
	const [chatsSnapshot] = useCollection(userChatRef);

	const createChat = () => {
		// we want to promt the user so we'll do this
		const input = prompt(
			"Please enter an email address for the user you wish to chat with"
		);
		// if there is no input then I want to stop the code from executing with any
		// validation errors
		if (!input) return null;
		// I want to make sure the email is valid and I want to check if the chat already exists
		// this is going to tell us if the email is valid or not
		if (
			EmailValidator.validate(input) &&
			!chatAlreadyExists(input) &&
			input !== user.email
		) {
			// if the email is valid, then I need to push this into the database
			// we need to add the chat into the DB 'chats' collection if it doesn't already exist
			// and is valid
			db.collection("chats").add({
				// here we add the users that are a part of the chat
				// every single chat will have a user's object in it which will be an array
				// this input is the input that we get when a user starts a new chat
				users: [user.email, input],
			});
		}
	};

	const chatAlreadyExists = (recipientEmail) =>
		// this is going to go through the chats that exists and find inside the users array
		// if the user is found with the recipientEmail which is the one we type into the
		// input field and if the length is greater than zero this will return some kind of
		// element
		!!chatsSnapshot?.docs.find((chat) =>
			chat
				.data()
				.users.find((user) => user === recipientEmail?.length > 0)
		);

	return (
		// these containers will translate to a div with the styles I defined
		<Container>
			<Header>
				{/* when I click the user's avatar it should log me out */}
				<UserAvatar
					src={user.photoURL}
					onClick={() => auth.signOut()}
				/>
				<IconsContainer>
					<IconButton>
						<ChatIcon />
					</IconButton>
					<IconButton>
						<MoreVertIcon />
					</IconButton>
				</IconsContainer>
			</Header>

			<Search>
				<SearchIcon />
				<SearchInput placeholder="Search in chats" />
			</Search>

			<SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

			{/* list of chats */}
			{/* for every chat I'm going to pass in a Chat element */}
			{chatsSnapshot?.docs.map((chat) => (
				<Chat key={chat.id} id={chat.id} users={chat.data().users} />
			))}
		</Container>
	);
}

export default Sidebar;
// the backticks is where we put our CSS
const Container = styled.div`
	flex: 0.45;
	border-right: 1px solid whitesmoke;
	height: 100vh;
	min-width: 200px;
	max-width: 350px;
	overflow-y: scroll;

	::-webkit-scrollbar {
		display: none;
	}

	-ms-overflow-style: none; // IE and Edge
	scrollbar-width: none; // Firefox
`;

const Search = styled.div`
	display: flex;
	align-items: center;
	padding: 20px;
	border-radius: 2px;
`;

const SidebarButton = styled(Button)`
	/* this will expand it so that it takes up the entire length */
	width: 100%;
	/* this will increase the specificity/priority of the rule */
	&&& {
		border-top: 1px solid whitespace;
		border-bottom: 1px solid whitespace;
	}
`;

const SearchInput = styled.input`
	/* this gets rid of the blue outline when the area is clicked */
	outline-width: 0;
	/* this will take out the surrounding black border */
	border: none;
	/* this will make is so that the element will take up the entire width of the container */
	flex: 1;
`;

const Header = styled.div`
	/* starting to use flexbox to align our components to where we want them to be*/
	display: flex;
	/* sticky keeps the container in its place when the page is scrolling */
	position: sticky;
	top: 0;
	background-color: white;
	/* the z-index keep the contained items otop of everything else when we get overflow*/
	z-index: 1;
	/* justify-content speces our elements out */
	justify-content: space-between;
	/* this aligns the items centrally */
	align-items: center;
	padding: 15px;
	height: 80px;
	/* this gives us the border right below our container */
	border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
	cursor: pointer;
	/* when you hover over the element it applies those styles */
	:hover {
		opacity: 0.8;
	}
`;

const IconsContainer = styled.div``;
