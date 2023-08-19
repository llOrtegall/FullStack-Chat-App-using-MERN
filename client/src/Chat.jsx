import { useContext, useEffect, useState } from "react"
import { UserContext } from "./UserContext";
import { Avatar } from "./Avatar"
import { Logo } from "./Logo"

export function Chat() {

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectUserId, setSelectUserId] = useState(null);
  const { username, id } = useContext(UserContext);

  console.log(ws)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4040')
    setWs(ws);
    ws.addEventListener('message', handleMessage)
  }, [])

  function showOnlinePeopple(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    });
    setOnlinePeople(people)
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData) {
      showOnlinePeopple(messageData.online);
    }
  }

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id]

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 ">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
          <div key={userId} onClick={() => setSelectUserId(userId)}
            className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${userId === selectUserId ? "bg-blue-400" : ''}`}>
            {userId === selectUserId && (
              <div className="border-b border-gray-100 w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-900 font-semibold">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          mensajes para leccionar personas
        </div>
        <div className="flex gap-2">
          <input type="text" className="bg-white border rounded-md p-2 flex-grow"
            placeholder="Escribe tú mensaje" />
          <button className="bg-blue-500 p-2 rounded-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div >
  )
}