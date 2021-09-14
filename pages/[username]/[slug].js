import { collection, collectionGroup, getDocs, getDoc, doc } from '@firebase/firestore'
import { firestore, getUserWithUserName, postToJson } from '../../lib/firebase'
import PostContent from '../../components/PostContent'
import { useDocumentData } from '../../lib/hooks'
import HeartButton from '../../components/HeartButton'
import AuthCheck from '../../components/AuthCheck'
import Link from 'next/link'

export async function getStaticProps({ params }) {
  const { username, slug } = params
  const userDoc = await getUserWithUserName(username)

  let post
  let path

  if (userDoc) {
    const userRef = userDoc.ref
    const postRef = doc(collection(userRef, 'posts'), slug)
    const postDoc = await getDoc(postRef)
    post = postToJson(postDoc)
    path = postRef.path
  }

  return {
    props: { post, path },
    revalidate: 5000
  }
}

export async function getStaticPaths() {
  const snapshot = await getDocs(collectionGroup(firestore, 'posts'))

  const paths = snapshot.docs.map(doc => {
    const { slug, username } = doc.data()
    return {
      params: { username, slug }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export default function PostPage(props) {
  const postRef = doc(firestore, props.path)
  const [realtimePost] = useDocumentData(postRef)

  const post = realtimePost || props.post

  return (
    <main>

      <section>
        <PostContent post={post} />
      </section>

      <aside className='card'>
        <p>
          <strong>{post.heartCount || 0} ❤️</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href='/enter'>
              <button>❤️ Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  )
}
