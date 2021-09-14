import Link from 'next/link'
import Image from 'next/image'
import { useContext } from 'react'
import { UserContext } from '../lib/context'

export default function Navbar () {
  const { user, username } = useContext(UserContext)
  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link href='/'>
            <a>
              <button className='btn-logo'>FEED</button>
            </a>
          </Link>
        </li>

        {/* user is signed-in and has usernames */}
        {username && (
          <>
            <li className='push-left'>
              <Link href='/admin'>
                <a>
                  <button className='btn-blue'>Write Posts</button>
                </a>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`}>
                <a>
                  <Image
                    src={user.photoURL}
                    width={40}
                    height={40}
                    quality={100}
                  />
                </a>
              </Link>
            </li>
          </>
        )}

        {/* {user is not signed OR has not created username} */}
        {!username && (
          <li>
            <Link href='/enter'>
              <button className='btn-blue'>Log in</button>
            </Link>
          </li>
        )}

      </ul>
    </nav>
  )
}
