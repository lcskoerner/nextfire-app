import Image from 'next/image'

export default function UserProfile ({ user }) {
  return (
    <div className='box-center'>
      <div>
        {user &&
          <Image
            src={user?.photoURL}
            width={180}
            height={180}
            className='card-img-center'
          />}
      </div>
      <p>
        <i>@{user?.username}</i>
      </p>
      <h1>{user?.displayName}</h1>
    </div>
  )
}
