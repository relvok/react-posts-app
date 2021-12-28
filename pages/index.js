import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";
import Metatags from "../components/Metatags";
import { useState } from "react";
import toast from "react-hot-toast";

// Max post to query per page
const LIMIT = 4;

export async function getServerSideProps(context) {
	try {
		const postsQuery = firestore
			.collectionGroup("posts")
			.where("published", "==", true)
			.orderBy("createdAt", "desc")
			.limit(LIMIT);

		const posts = (await postsQuery.get()).docs.map(postToJSON);
		console.log("server side posts", posts);
		return {
			props: { posts }, // will be passed to the page component as props
		};
	} catch (err) {
		console.log("ssr error: ", err.message);
		toast.error(err.message);
		return {
			props: {},
		};
	}
}

export default function Home(props) {
	const [posts, setPosts] = useState(props.posts);
	console.log("props.posts", props.posts);
	const [loading, setLoading] = useState(false);

	const [postsEnd, setPostsEnd] = useState(false);

	const getMorePosts = async () => {
		setLoading(true);
		const last = posts[posts.length - 1];

		const cursor =
			typeof last.createdAt === "number"
				? fromMillis(last.createdAt)
				: last.createdAt;

		const query = firestore
			.collectionGroup("posts")
			.where("published", "==", true)
			.orderBy("createdAt", "desc")
			.startAfter(cursor)
			.limit(LIMIT);

		const newPosts = (await query.get()).docs.map((doc) => doc.data());

		setPosts(posts.concat(newPosts));
		setLoading(false);

		if (newPosts.length < LIMIT) {
			setPostsEnd(true);
		}
		console.log("posts in home function", posts);
	};
	return (
		<main>
			<Metatags
				title="Home Page"
				description="Get the latest posts on our site"
			/>

			<PostFeed posts={posts} />

			{!loading && !postsEnd && (
				<button onClick={getMorePosts}>Load more</button>
			)}

			<Loader show={loading} />

			{postsEnd && "You have reached the end!"}
		</main>
	);
}
