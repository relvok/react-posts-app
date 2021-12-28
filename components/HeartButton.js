import { firestore, auth, increment } from "../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
// Allows user to heart or like a post
export default function Heart({ postRef, postDoc }) {
	// Listen to heart document for currently logged in user
	const heartRef = postRef.collection("hearts").doc(auth.currentUser.uid);
	const [heartDoc] = useDocumentData(heartRef);

	// Create a user-to-post relationship
	const addHeart = async () => {
		console.log("add called", heartDoc);

		const uid = auth.currentUser.uid;
		const batch = firestore.batch();

		batch.update(postRef, { heartCount: increment(1) });
		batch.set(heartRef, { uid });

		await batch.commit();
	};

	// Remove a user-to-post relationship
	const removeHeart = async () => {
		console.log("remove called", heartDoc);
		const batch = firestore.batch();

		batch.update(postRef, { heartCount: increment(-1) });
		batch.delete(heartRef);

		await batch.commit();
	};

	return heartDoc ? (
		<FavoriteIcon
			style={{ color: "red", cursor: "pointer" }}
			onClick={removeHeart}
		>
			💔
		</FavoriteIcon>
	) : (
		<FavoriteBorderIcon
			style={{ color: "red", cursor: "pointer" }}
			onClick={addHeart}
		>
			💗
		</FavoriteBorderIcon>
	);
}
