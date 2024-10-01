import { FaMicrosoft } from "react-icons/fa";
import "./SignInPage.css";

function SignInPage({ onLogin }) {
  return (
    <div className="sign-in-page">
      <h1>Welcome to Your To-Do App</h1>
      <p>Please sign in with your Microsoft account to continue.</p>
      <button onClick={onLogin} className="sign-in-button">
        <FaMicrosoft /> Sign in with Microsoft
      </button>
    </div>
  );
}

export default SignInPage;
