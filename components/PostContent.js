import Link from "next/link";
import ReactMarkdown from "react-markdown";
import HeartButton from "./HeartButton";
import AuthCheck from "./AuthCheck";

// UI component for main post content
export default function PostContent({ post, postRef }) {
	const createdAt =
		typeof post?.createdAt === "number"
			? new Date(post.createdAt)
			: post.createdAt.toDate();

	return (
		<div className="card">
			<h1>{post?.title}</h1>
			<span className="text-sm">
				Written by{" "}
				<Link href={`/${post.username}/`}>
					<a className="text-info">@{post.username}</a>
				</Link>{" "}
				on {createdAt.toISOString()}
			</span>
			<ReactMarkdown>{post?.content}</ReactMarkdown>
			<div className="flex center">
				<AuthCheck
					fallback={
						<Link href="/enter">
							<button>💗 Sign Up</button>
						</Link>
					}
				>
					<HeartButton postRef={postRef} postDoc={post} />
				</AuthCheck>
				<strong>{post.heartCount || 0}</strong>
			</div>
		</div>
	);
}
