import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { getStorage, TaskEvent } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBeXQkHZfRbNlwcYv6XA_MxA3lEfOaivPA',
  authDomain: 'nextfire-d9511.firebaseapp.com',
  projectId: 'nextfire-d9511',
  storageBucket: 'nextfire-d9511.appspot.com',
  messagingSenderId: '248193295412',
  appId: '1:248193295412:web:402f89405b588700b81661'
}

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

export const fromMillis = Timestamp.fromMillis

export async function signInWithGoogle() {
  return await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function signOutFromGoogle() {
  return await signOut(auth)
}

export async function getUserWithUserName(username) {
  const usersRef = collection(firestore, 'users')
  const collectionQuery = query(usersRef, where('username', '==', username), limit(1))
  const querySnapshot = await getDocs(collectionQuery)
  const userDoc = querySnapshot.docs[0]
  return userDoc
}

export function postToJson(doc) {
  const data = doc.data()
  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.createdAt.toMillis()
  }
}
