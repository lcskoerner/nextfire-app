import { collection, increment, writeBatch, doc } from "@firebase/firestore"
import { auth, firestore } from "../lib/firebase"
import { useDocument } from "../lib/hooks"

export default function HeartButton({ postRef }) {
  const heartsRef = collection(postRef, 'hearts')
  const heartRef = doc(heartsRef, auth.currentUser.uid)
  const [heartDoc] = useDocument(heartRef)

  const addHeart = async () => {
    const uid = auth.currentUser.uid
    const batch = writeBatch(firestore)

    batch.update(postRef, { heartCount: increment(1) })
    batch.set(heartRef, { uid })

    await batch.commit()
  }

  const removeHeart = async () => {
    const batch = writeBatch(firestore)

    batch.update(postRef, { heartCount: increment(-1) })
    batch.delete(heartRef)

    await batch.commit()
  }

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>❤️ Heart</button>
  )

}
