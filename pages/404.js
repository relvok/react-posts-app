import Link from "next/link";

export default function Custom404() {
	return (
		<main className="card">
			<h1>404 - This page does not seem to exist...</h1>
			<iframe
				allowtransparency="true"
				src="https://giphy.com/embed/H7wajFPnZGdRWaQeu0"
				background="false"
				width="480"
				height="480"
				frameBorder="0"
				class="giphy-embed"
				allowFullScreen
			></iframe>

			<Link href="/">
				<button className="btn-blue">Go home</button>
			</Link>
		</main>
	);
}
