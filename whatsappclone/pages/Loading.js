import { Circle } from "better-react-spinkit";

function Loading() {
	return (
		// when doing in-line styles we use camelCase as opposed to dashes in-between
		<center
			style={{ display: "grid", placeItems: "center", height: "100vh" }}
		>
			<div>
				<img
					src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
					alt=""
					// because we're not using style components, we need to do this for
					// serverside rendering
					style={{ marginBottom: 10 }}
					height={200}
				/>
				<Circle color="#3CBC2B" size={60} />
			</div>
		</center>
	);
}

export default Loading;
