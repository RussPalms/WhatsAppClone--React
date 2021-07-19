import Head from "next/head";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import ChatScreen from "../../components/ChatScreen";
import Sidebar from "../../components/Sidebar";
import { auth, db } from "../../firebase";
import getRecipientEmail from "../../utils/getRecipientEmail";

// this is where serverside rendering will come in
function Chat({ chat, messages }) {
	const [user] = useAuthState(auth);
    console.log(chat)
    console.log(messages);

	return (
		<Container>
			{/* the Head will allow us to change the title of the page that we're in */}
			<Head>
				<title>Chat with {getRecipientEmail(chat.users, user)}</title>
			</Head>
			<Sidebar />
			<ChatContainer>
				<ChatScreen chat={chat} messages={messages} />
			</ChatContainer>
		</Container>
	);
}

export default Chat;

// before the user sees the page, we're going to fetch a bunch of props on this server
// we're basically pre-fetching the data so that the browser had the data available,
// because it's cached
// context allows you to access things like the params of the url, the root url, and things
// like that when you're on the server
export async function getServerSideProps(context) {
	// we need to prep the chat and the messages beforehand
	const ref = db.collection("chats").doc(context.query.id);

	// PREP the messages on the server
	const messagesRes = await ref
		.collection("messages")
		.orderBy("timestamp", "asc")
		.get();

	const messages = messagesRes.docs
		.map((doc) => ({
			id: doc.id,
			// we're going to have the doc data spread out
			// this will simplify the array that we send accross to the client
			...doc.data(),
		}))
		.map((messages) => ({
			// get all the properties of the messages
			...messages,
			// whenever you have to stringify a timestamp to send from an API to a client,
			// you lose the timestamp datatype
			// so when you send data from the server, you need to manipulate it
			// getTime will retrieve a unix timestamp which is a number that represents the time
			// in whatever timezone you're at
			timestamp: messages.timestamp.toDate().getTime(),
		}));

	// PREP the chats
	const chatRes = await ref.get();
	// this will create an object for the chat
	const chat = {
		id: chatRes.id,
		...chatRes.data(),
	};

	// console.log(chat, messages);

	return {
		props: {
			messages: JSON.stringify(messages),
			chat: chat,
		},
	};
}
const Container = styled.div`
	display: flex;
`;

const ChatContainer = styled.div`
	flex: 1;
	overflow: scroll;
	height: 100vh;
	/* this will hide the scrollbar across browsers*/
	::-webkit-scrollbar {
		display: none;
	}
	-ms-overflow-style: none; // ID and Edge
	scrollbar-width: none; //Firefox
`;
