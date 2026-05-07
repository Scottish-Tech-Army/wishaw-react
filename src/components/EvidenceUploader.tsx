import { useState } from 'react'
import { useAppStore } from '../store/appStore'

interface EvidenceUploaderProps {
  userId: string
  moduleId: string
  subBadgeId: string
}

export function EvidenceUploader({ userId, moduleId, subBadgeId }: EvidenceUploaderProps) {
  const submitEvidence = useAppStore((state) => state.submitEvidence)
  const [links, setLinks] = useState('')
  const [message, setMessage] = useState('')

  return (
    <form
      className="uploader"
      onSubmit={(event) => {
        event.preventDefault()
        const form = event.currentTarget
        const imageInput = form.elements.namedItem('images') as HTMLInputElement
        const docInput = form.elements.namedItem('docs') as HTMLInputElement

        submitEvidence({
          userId,
          moduleId,
          subBadgeId,
          links: links
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          imageNames: Array.from(imageInput.files ?? []).map((file) => file.name),
          fileNames: Array.from(docInput.files ?? []).map((file) => file.name),
        })

        setMessage('Evidence submitted for admin review.')
        form.reset()
        setLinks('')
      }}
    >
      <label>
        Evidence links (one per line)
        <textarea value={links} onChange={(event) => setLinks(event.target.value)} placeholder="https://..." rows={3} />
      </label>
      <label>
        Upload images
        <input name="images" type="file" accept="image/*" multiple />
      </label>
      <label>
        Upload documents
        <input name="docs" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" multiple />
      </label>
      <button type="submit" className="button">
        Submit Evidence
      </button>
      {message ? <p className="success-text">{message}</p> : null}
    </form>
  )
}
