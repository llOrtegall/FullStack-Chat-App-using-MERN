import { Avatar } from './Avatar.jsx'

// eslint-disable-next-line react/prop-types
export function Contact({ id, username, onClick, selected, online }) {
  return (
    <div key={id} onClick={() => onClick(id)}
      className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${(id === selected ? 'bg-blue-100' : '')}`}>
      {selected && (
        <div className='w-1 bg-blue-500 h-12 rounded-r-md'></div>
      )}
      <div className='flex gap-2 py-2 pl-4 items-center'>
        <Avatar online={online} username={username} userId={id} />
        <span className='text-gray-800 font-semibold'>
          {username}
        </span>
      </div>
    </div>
  )
}