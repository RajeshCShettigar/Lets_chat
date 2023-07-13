import {createContext, useEffect, useState} from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    axios.get('https://chat-app-6j5k.onrender.com/profile').then(response => {
      setId(response.data.userId);
      setUsername(response.data.username);
      console.log(JSON.stringify(response));
    }).catch(err => {
      console.log(err);
      //alert(err);
    })}, []);

  return (
    <UserContext.Provider value={{username, setUsername, id, setId}}>
      {children}
    </UserContext.Provider>
  );
}