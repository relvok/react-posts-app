import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import toast from "react-hot-toast";

export async function getServerSideProps({ query }) {
	// JSON serializable data
	let user = null;
	let posts = null;
	try {
		const { username } = query;

		const userDoc = await getUserWithUsername(username);

		if (userDoc) {
			user = userDoc.data();
			const postsQuery = userDoc.ref
				.collection("posts")
				.where("published", "==", true)
				.orderBy("createdAt", "desc")
				.limit(5);
			posts = (await postsQuery.get()).docs.map(postToJSON);

			return {
				props: { user, posts }, // will be passed to the page component as props
			};
		} else {
			// If no user, short circuit to 404 page
			if (!userDoc) {
				return {
					notFound: true,
				};
			}
		}
	} catch (err) {
		toast.error("Error: ", err.message);
		return {
			props: { user, posts },
		};
	}
}

export default function UserProfilePage({ user, posts }) {
	return (
		<main>
			<UserProfile user={user} />
			<PostFeed posts={posts} />
		</main>
	);
}
