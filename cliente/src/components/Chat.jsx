import { useContext, useEffect, useRef, useState } from 'react'
import { Avatar } from './Avatar'
import { Logo } from './Logo';
import { UserContext } from '../UserContext'
import { uniqBy } from 'lodash'
import axios from 'axios';
import { Contact } from './Contact';

export function Chat() {

  const [ws, setWs] = useState(null)
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const { id } = useContext(UserContext)
  const divUnderMessages = useRef();

  useEffect(() => {
    connecToWs()
  }, [])

  function connecToWs() {
    const ws = new WebSocket('ws://localhost:4040')
    setWs(ws)
    ws.addEventListener('message', handleMessage)
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconected. Trying to reconnect');
        connecToWs();
      }, 1000);
    });
  }

  function showOnLinePeople(peopleArray) {
    const people = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    })
    setOnlinePeople(people)
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data)
    if ('online' in messageData) {
      showOnLinePeople(messageData.online)
    } else if ('text' in messageData) {
      setMessages(prev => ([...prev, { ...messageData }]));
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText
    }));
    setNewMessageText('');
    setMessages(prev => ([...prev, {
      text: newMessageText,
      sender: id,
      recipient: selectedUserId,
      _id: Date.now(),
    }]));
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then(res => {
        setMessages(res.data);
      })
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id))
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      })
      setOfflinePeople(offlinePeople)
    })
  }, [onlinePeople])



  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messageWithOutDupes = uniqBy(messages, '_id');

  return (
    <section className="flex h-screen">
      <div className="bg-white w-1/3">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
          <Contact
            key={userId} id={userId} online={true}
            username={onlinePeopleExclOurUser[userId]}
            onClick={() => setSelectedUserId(userId)}
            selected={userId === selectedUserId} />
        ))}
        {Object.keys(offlinePeople).map(userId => (
          <Contact
            key={userId} id={userId} online={false}
            username={offlinePeople[userId].username}
            onClick={() => setSelectedUserId(userId)}
            selected={userId === selectedUserId} />
        ))}
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className='flex h-full flex-grow items-center justify-center'>
              <div className='text-gray-400'>&larr; Select a person from de sidebar</div>
            </div>
          )}
          {!!selectedUserId && (
            <div className='relative h-full'>
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messageWithOutDupes.map(msn => (
                  <div key={msn._id} className={(msn.sender === id ? 'text-right pr-2' : 'text-left')}>
                    < div
                      className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (msn.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700')}>
                      {msn.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input type="text"
              value={newMessageText}
              onChange={ev => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-sm p-2" />
            <button type='submit' className="bg-blue-500 p-2 rounded-md  text-white ">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div >
    </section >
  );
}