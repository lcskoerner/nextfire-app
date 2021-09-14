import { useState, useEffect } from 'react'
import { firestore, auth } from '../lib/firebase'
import { onSnapshot, doc, getDoc } from '@firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'

export function useUserData() {
  const [user] = useAuthState(auth)
  const [username, setUsername] = useState(null)

  useEffect(async () => {
    // turn off realtime subscription
    let unsubscribe
    if (user) {
      const ref = doc(firestore, 'users', user.uid)
      unsubscribe = onSnapshot(ref, (doc) => {
        setUsername(doc.data()?.username)
      })
    } else {
      setUsername(null)
    }

    return () => unsubscribe()
  }, [user])

  return {
    user,
    username
  }
}

export function useDocumentData(postRef) {
  const [realtimePost, setRealtimePost] = useState(null)

  useEffect(async () => {
    const unsub = onSnapshot(postRef, (doc) => {
      const data = doc.data()
      setRealtimePost(data)
    })

    return () => unsub()
  }, [])

  return [realtimePost]
}

export function useDocument(docRef) {
  const [document, setDocument] = useState(null)

  useEffect(async () => {
    const unsub = onSnapshot(docRef, (doc) => {
      setDocument(doc)
    })

    return () => unsub()
  }, [])

  return [document]
}
