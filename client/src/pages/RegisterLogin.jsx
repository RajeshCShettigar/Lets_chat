import { useContext, useState} from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

const RegisterLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const [error, setError] = useState(null); 

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const type = isLoginOrRegister === "register" ? "register" : "login";
    const url=`http://localhost:9000/${type}`;
    if(username!==""||password!==""){
    const data = JSON.stringify({ username, password });
    await axios
      .post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        //console.log(res);
        const result = res.data;
        console.log(result);
        if (res.status === 200||201) {
          setLoggedInUsername(username);
          setId(result);
        } else if(res.status==404){
          setError("User not found");
        }
      }).catch((err)=>{
        alert(err);
        setError(err);
      })
    }else{
      setError("Username or password is empty");
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col bg-white rounded-md shadow-md">
      <h1 className="text-3xl text-center w-full mb-4 mt-4 font-bold text-blue-600">LetsChat</h1>
      <div className="flex items-center justify-center p-6">
        <form className="w-64 mx-auto mb-4" onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username"
            className="block w-full rounded-sm p-2 mb-3 border"
            minlength="6" maxlength="12"
            required
            title="Username must be 6-12 characters long"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="block w-full rounded-sm p-2 mb-3 border"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
            required
            title="Password must contain at least one digit, one lowercase letter, one uppercase letter"
          />
          <button className="bg-blue-600 text-white block w-full rounded-sm p-2 hover:bg-blue-700">
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
          <div>
            {error && <p className="text-center text-red-500">{error}</p>}
          </div>
          <div className="text-center mt-2">
            {isLoginOrRegister === "register" && (
              <div>
                Already a member?
                <button
                  className="ml-1"
                  onClick={() => setIsLoginOrRegister("login")}
                >
                  <span className="text-blue-500 hover:text-blue-700">
                  Login
                  </span>
                </button>
              </div>
            )}
            {isLoginOrRegister === "login" && (
              <div>
                Dont have an account?
                <button
                  className="ml-1"
                  onClick={() => setIsLoginOrRegister("register")}
                >
                  <span className="text-blue-500 hover:text-blue-700">
                  Register
                  </span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default RegisterLogin;
