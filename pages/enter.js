import { auth, googleAuthProvider, firestore } from "../lib/firebase";
import toast from "react-hot-toast";
import { UserContext } from "../lib/context";
import Loader from "../components/Loader";

import { useEffect, useState, useCallback, useContext } from "react";
import debounce from "lodash.debounce";

export default function EnterPage(props) {
	const { user, username } = useContext(UserContext);
	return (
		<main>
			{user ? (
				!username ? (
					<UsernameForm />
				) : (
					<SignOutButton />
				)
			) : (
				<SignInButton />
			)}
		</main>
	);
}

function SignInButton() {
	const signInWithGoogle = async () => {
		try {
			await auth.signInWithPopup(googleAuthProvider);
		} catch (err) {
			toast.error("Error: ", err);
		}
	};
	return (
		<button className="btn-google" onClick={signInWithGoogle}>
			<img src={"/google.jpg"} alt="" /> Sign in with Google
		</button>
	);
}
function SignOutButton() {
	return (
		<button onClick={() => auth.signOut(googleAuthProvider)}>Sign Out</button>
	);
}

function UsernameForm() {
	const [formValue, setFormValue] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [loading, setLoading] = useState(false);
	const { user, username } = useContext(UserContext);

	const onSubmit = async (ev) => {
		try {
			ev.preventDefault();

			const userDoc = firestore.doc(`users/${user.uid}`);
			const usernameDoc = firestore.doc(`usernames/${formValue}`);

			const batch = firestore.batch();
			batch.set(userDoc, {
				username: formValue,
				photoURL: user.photoURL,
				displayName: user.displayName,
			});
			batch.set(usernameDoc, { uid: user.uid });

			await batch.commit();
		} catch (err) {
			toast.error("Error: ", err);
		}
	};

	const onChange = async (ev) => {
		const val = ev.target.value.toLowerCase();
		const reg = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
		if (val.length < 3) {
			setFormValue(val);
			setLoading(false);
			setIsValid(false);
		}

		if (reg.test(val)) {
			setFormValue(val);
			setLoading(true);
			setIsValid(false);
		}
	};

	useEffect(() => {
		checkUsername(formValue);
	}, [formValue]);

	const checkUsername = useCallback(
		debounce(async (username) => {
			if (username.length >= 3) {
				const ref = firestore.doc(`usernames/${username}`);
				const { exists } = await ref.get();
				console.log("Firestore read executed!");
				setIsValid(!exists);
				setLoading(false);
			}
		}, 1000),
		[]
	);

	return (
		!username && (
			<section>
				<h3>Choose Username</h3>
				<form onSubmit={onSubmit}>
					<input
						name="username"
						placeholder="myname"
						value={formValue}
						onChange={onChange}
					/>
					<UsernameMessage
						username={formValue}
						isValid={isValid}
						loading={loading}
					/>
					<button type="submit" className="btn-green" disabled={!isValid}>
						Choose
					</button>

					<h3>Debug State</h3>
					<div>
						Username: {formValue}
						<br />
						Loading: {loading.toString()}
						<br />
						Username Valid: {isValid.toString()}
					</div>
				</form>
			</section>
		)
	);
}

function UsernameMessage({ username, isValid, loading }) {
	if (loading) {
		return (
			<p>
				<Loader show />
				Checking...
			</p>
		);
	} else if (isValid) {
		return <p className="text-success">{username} is available!</p>;
	} else if (username && !isValid) {
		return <p className="text-danger">That username is taken!</p>;
	} else {
		return <p></p>;
	}
}
