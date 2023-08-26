import { useContext } from "react";
import { RegisterAndLoginForm } from "./components/RegisterAndLoginForm";
import { UserContext } from "./UserContext";
import { Chat } from "./components/Chat";

export function Routes() {
  const { username, id } = useContext(UserContext)

  if (username) {
    return (
      <Chat />
    )
  }

  return (
    <RegisterAndLoginForm />
  )
}