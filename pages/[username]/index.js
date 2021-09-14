import UserProfile from '../../components/UserProfile'
import PostFeed from '../../components/PostFeed'
import { getUserWithUserName, postToJson } from '../../lib/firebase'
import { collection, getDocs, orderBy, query as q, where, limit } from '@firebase/firestore'

export async function getServerSideProps ({ query }) {
  const { username } = query

  const userDoc = await getUserWithUserName(username)

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return {
      notFound: true
    }
  }

  let user = null
  let posts = null

  if (userDoc) {
    user = userDoc.data()
    const userRef = userDoc.ref
    const postsRef = q(collection(userRef, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), limit('5'))

    const querySnapshot = await getDocs(postsRef)
    posts = querySnapshot.docs.map(postToJson)
  }

  return {
    props: { user, posts }
  }
}

export default function UserProfilePage ({ user, posts }) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  )
}
