import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import { useCollection } from "react-firebase-hooks/firestore";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import Message from "./Message";
import { useRef, useState } from "react";
import firebase from "firebase";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";

function ChatScreen({ chat, messages }) {
	// console.log(messages);
	// console.log(chat);
	const [user] = useAuthState(auth);
	const [input, setInput] = useState("");
	const endOfMessageRef = useRef(null);
	const router = useRouter();
	// this will give us all the messages that we have in a given chat
	const [messagesSnapshot] = useCollection(
		db
			.collection("chats")
			.doc(router.query.id)
			.collection("messages")
			.orderBy("timestamp", "asc")
	);
	const [recipientSnapshot] = useCollection(
		db
			.collection("users")
			.where("email", "==", getRecipientEmail(chat.users, user))
	);

	const showMessages = () => {
		if (messagesSnapshot) {
			// this is what's happening when we render based on the client
			// as soon as the client is connected it will then go ahead and fetch the
			// realtime information
			return messagesSnapshot.docs.map((message) => (
				<Message
					key={message.id}
					user={message.data().user}
					message={{
						...message.data(),
						timestamp: message.data().timestamp?.toDate().getTime(),
					}}
				/>
			));
			// before we render the content for the client, we want to get the value that
			// the server generated imediately
		} else {
			return JSON.parse(messages).map((message) => (
				<Message
					key={message.id}
					user={message.user}
					message={message}
				/>
			));
		}
	};

	const scrollToBottom = () => {
		endOfMessageRef.current.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const sendMessage = (e) => {
		e.preventDefault();
		// when a user sends a message I want to update their last active or last seen to their
		// most recent activity
		// every time they send a message I'm going to go into user's document and update
		// their last seen
		// this is how we get realtime live seen functionality
		// then map the last seen status to the ui and update it
		db.collection("users").doc(user.uid).set(
			{
				lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true }
		);

		db.collection("chats").doc(router.query.id).collection("messages").add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: input,
			user: user.email,
			photoURL: user.photoURL,
		});

		setInput("");
		scrollToBottom();
	};

	const recipient = recipientSnapshot?.docs?.[0]?.data();
	// chat.users is what came in from the server previously and we want to combine
	// that with the user we have
	const recipientEmail = getRecipientEmail(chat.users, user);

	return (
		<Container>
			<Header>
				{recipient ? (
					<Avatar src={recipient?.photoURL} />
				) : (
					<Avatar>{recipientEmail[0]}</Avatar>
				)}
				<HeaderInformation>
					<h3>{recipientEmail}</h3>
					{recipientSnapshot ? (
						<p>
							Last active:{" "}
							{recipient?.lastSeen?.toDate() ? (
								<TimeAgo
									datetime={recipient?.lastSeen?.toDate()}
								/>
							) : (
								"Unavailable"
							)}
						</p>
					) : (
						<p>Loading Last Active . . .</p>
					)}
				</HeaderInformation>
				<HeaderIcons>
					<IconButton>
						<AttachFileIcon />
					</IconButton>
					<IconButton>
						<MoreVertIcon />
					</IconButton>
				</HeaderIcons>
			</Header>

			<MessageContainer>
				{showMessages()}
				<EndOfMessage ref={endOfMessageRef} />
			</MessageContainer>

			<InputContainer>
				<InsertEmoticonIcon />
				{/* every time the user types somthing into this input field, it will update the */}
				{/* memory in state */}
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button
					hidden
					disabled={!input}
					type="submit"
					onClick={sendMessage}
				>
					Send Message
				</button>
				<MicIcon />
			</InputContainer>
		</Container>
	);
}

export default ChatScreen;

const Container = styled.div``;

const Input = styled.input`
	flex: 1;
	outline: 0;
	border: none;
	border-radius: 10px;
	padding: 20px;
	background-color: whitesmoke;
	padding: 20px;
	margin-left: 15px;
	margin-right: 15px;
`;

const InputContainer = styled.form`
	display: flex;
	align-items: center;
	padding: 100px;
	position: sticky;
	bottom: 0;
	background-color: white;
	z-index: 100;
`;

const Header = styled.div`
	position: sticky;
	background-color: white;
	z-index: 100;
	top: 0;
	display: flex;
	padding: 11px;
	height: 80px;
	align-items: center;
	border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
	margin-left: 15px;
	flex: 1;

	> h3 {
		margin-bottom: 3px;
	}

	> p {
		font-size: 14px;
		color: grey;
	}
`;

const EndOfMessage = styled.div`
    margin-bottom: 50px;
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
	padding: 30px;
	background-color: #e5ded8;
	min-height: 90vh;
`;