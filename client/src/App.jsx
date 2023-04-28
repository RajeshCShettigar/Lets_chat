import axios from "axios";
import RegisterLogin from "./pages/RegisterLogin";
import {useContext} from "react";
import {UserContext} from "./context/UserContext";
import Chat from "./pages/Chat";

function App() {
  axios.defaults.withCredentials = true;
  const {username, id} = useContext(UserContext);
  if (username) {
    return <Chat />;
  }
  return (
    <RegisterLogin/>
  );
}

export default App
