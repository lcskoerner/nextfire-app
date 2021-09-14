import Link from 'next/link'
import Metatags from '../../components/Metatags'
import AuthCheck from '../../components/AuthCheck'
import ImageUploader from '../../components/ImageUploader'
import { useState } from 'react'
import { useRouter } from 'next/dist/client/router'
import { firestore, auth } from '../../lib/firebase'
import { useForm } from 'react-hook-form'
import { useDocumentData } from '../../lib/hooks'
import ReactMarkdown from 'react-markdown'
import { serverTimestamp, collection, doc, getDoc, updateDoc } from '@firebase/firestore'
import toast from 'react-hot-toast'
import styles from '../../styles/Admin.module.css'

export default function AdminPostEdit({ }) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}

function PostManager() {
  const [preview, setPreview] = useState(false)

  const router = useRouter()
  const { slug } = router.query

  const usersRef = collection(firestore, 'users')
  const userRef = doc(usersRef, auth.currentUser.uid)
  const postsRef = collection(userRef, 'posts')
  const postRef = doc(postsRef, slug)

  const [post] = useDocumentData(postRef)

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${ post.username }/${ post.slug }`}>
              <button className='btn-blue'>Live view</button>
            </Link>

          </aside>
        </>
      )}
    </main>
  )
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, formState, reset, watch } = useForm({ defaultValues, mode: 'onChange' })

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp()
    })

    reset({ content, published })

    toast.success('Post updated successfully!')

  }

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className='card'>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>

        <ImageUploader />

        <textarea name='content' {...register('content', {
          maxLength: { value: 20000, message: 'content is too long' },
          minLength: { value: 10, message: 'content is too short' },
          required: { value: true, message: 'content is required' }
        })}></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} name='published' type='checkbox' {...register('published')} />
          <label>Published</label>
        </fieldset>

        <button type='submit' className='btn-green' disabled={!isDirty || !isValid}>
          Save Changes
        </button>

      </div>

    </form>
  )
}
