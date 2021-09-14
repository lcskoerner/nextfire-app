import Image from 'next/image'
import googleLogo from '../public/images/google_logo.png'
import { firestore, signInWithGoogle, signOutFromGoogle } from '../lib/firebase'
import { useState, useContext, useEffect, useCallback } from 'react'
import { UserContext } from '../lib/context'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import debounce from 'lodash.debounce'

export default function EnterPage (props) {
  const { user, username } = useContext(UserContext)

  return (
    <main>
      {user
        ? !username ? <UsernameForm /> : <SignOutButton />
        : <SignInButton />}
    </main>
  )
}

// Sig in with Goggle button
function SignInButton () {
  return (
    <button className='btn-google' onClick={signInWithGoogle}>
      <Image
        src={googleLogo}
        quality={100}
      />
      &nbsp;Sign in with Google
    </button>
  )
}

// Sign out button
function SignOutButton () {
  return (
    <button onClick={() => signOutFromGoogle()}>
      Sign Out
    </button>
  )
}

function UsernameForm () {
  const [formValue, setFormValue] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, username } = useContext(UserContext)

  useEffect(() => {
    checkUsername(formValue)
  }, [formValue])

  const onChange = (e) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/
    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }

    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const userDoc = doc(firestore, `users/${user.uid}`)
    const usernameDoc = doc(firestore, `usernames/${formValue}`)

    const batch = writeBatch(firestore)
    batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName })
    batch.set(usernameDoc, { uid: user.uid })
    await batch.commit()
  }

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = doc(firestore, `usernames/${username}`)
        const refSnap = await getDoc(ref)
        const exists = refSnap.exists()
        console.log('Firestore read executed!')
        setIsValid(!exists)
        setLoading(false)
      }
    }, 500),
    []
  )

  return (
    !username && (
      <section>
        <h3>Choose username</h3>
        <form onSubmit={onSubmit}>

          <input type='text' placeholder='username' value={formValue} onChange={onChange} />
          <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
          <button type='submit' className='btn-green' disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>

        </form>
      </section>
    )
  )
}

function UsernameMessage ({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>
  } else if (isValid) {
    return <p className='text-success'>{username} is available!</p>
  } else if (username && !isValid) {
    return <p className='text-danger'>That username is taken!</p>
  } else {
    return <p />
  }
}
