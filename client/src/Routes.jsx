import { useContext } from "react";
import Register from "./Register";
import { UserContext } from "./UserContext";

export default function Routes() {
  const { username } = useContext(UserContext);
  if (username) {
    return 'logging in' + username;
  }
  return (
    <Register />
  )
}