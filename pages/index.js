import Loader from '../components/Loader'
import PostFeed from '../components/PostFeed'
import { useState } from 'react'
import { firestore, postToJson, fromMillis } from '../lib/firebase'
import {
  collectionGroup,
  query,
  where,
  limit,
  orderBy,
  getDocs,
  startAfter
} from '@firebase/firestore'

// Max post to query per page
const LIMIT = 1

export async function getServerSideProps(context) {
  const postsQuery = query(collectionGroup(firestore, 'posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT))

  const posts = (await getDocs(postsQuery)).docs.map(postToJson)

  return {
    props: { posts }
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts)
  const [loading, setLoading] = useState(false)

  const [postsEnd, setPostsEnd] = useState(false)

  const getMorePosts = async () => {
    setLoading(true)
    const last = posts[posts.length - 1]

    const cursor = typeof last.createdAt === 'number'
      ? fromMillis(last.createdAt)
      : last.createdAt

    const q = query(collectionGroup(firestore, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT))

    const newPosts = (await getDocs(q)).docs.map(doc => doc.data())

    setPosts(posts.concat(newPosts))
    setLoading(false)

    if (newPosts.length < LIMIT) {
      setPostsEnd(true)
    }
  }

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}
