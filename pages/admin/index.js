import AuthCheck from '../../components/AuthCheck'
import { collection, doc, orderBy, query, getDocs, serverTimestamp, setDoc } from '@firebase/firestore'
import { firestore, auth } from '../../lib/firebase'
import PostFeed from '../../components/PostFeed'
import { useContext, useEffect, useState } from 'react'
import { kebabCase, template } from 'lodash'
import { useRouter } from 'next/dist/client/router'
import { UserContext } from '../../lib/context'
import toast from 'react-hot-toast'

export default function AdminPostsPage(props) {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  )
}

function PostList() {
  const [posts, setPosts] = useState([])

  useEffect(async () => {
    const userDocRef = doc(firestore, 'users', auth.currentUser.uid)
    const postsRef = collection(userDocRef, 'posts')
    const queryRef = query(postsRef, orderBy('createdAt'))

    const temp = []

    const querySnapshot = await getDocs(queryRef)
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const data = doc.data()
      temp.push(data)
      setPosts(temp)
    })
  }, [])

  return (
    <>
      <h1>Manage your posts</h1>
      <PostFeed posts={posts} admin />
    </>
  )
}

function CreateNewPost() {
  const router = useRouter()
  const { username } = useContext(UserContext)
  const [title, setTitle] = useState('')

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title))

  // Validate length
  const isValid = title.length > 3 && title.length < 100

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault()
    const uid = auth.currentUser.uid
    const usersRef = collection(firestore, 'users')
    const userDocRef = doc(usersRef, uid)
    const postsRef = collection(userDocRef, 'posts')
    const post = doc(postsRef, slug)

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0
    }

    await setDoc(post, data)

    toast.success('Post created!')
  }

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='My Awesome Article!'
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type='submit' disabled={!isValid} className='btn-green'>
        Create New Post
      </button>
    </form>
  )
}
