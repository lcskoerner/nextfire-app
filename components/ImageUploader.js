import { ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage'
import Loader from '../components/Loader'
import { auth, storage } from '../lib/firebase'
import { useState } from 'react'

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(false)
  const [downloadURL, setDownloadURL] = useState(null)

  const uploadFile = async (e) => {
    const file = Array.from(e.target.files)[0]
    const extension = file.type.split('/')[1]

    const filename = `${ auth.currentUser.uid }/${ Date.now() }.${ extension }`
    const storageRef = ref(storage, `uploads/${ filename }`)
    setUploading(true)

    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(pct)
      },
      (error) => {
        console.error(error)
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setDownloadURL(downloadURL)
          setUploading(false)
        })
      }
    )

  }

  return (
    <div className='box'>
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className='btn'>
            📷 Upload Img
            <input type='file' onChange={uploadFile} accept='image/x-png,image/gif,image/jpeg' />
          </label>
        </>
      )}

      {downloadURL && <code className='upload-snippet'>{`![alt](${ downloadURL })`}</code>}
    </div>
  )
}
