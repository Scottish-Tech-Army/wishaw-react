import { useRef, useState } from "react";
import "../../../portal.css";
import { useBadgeCatalogueContext } from "../../../context/BadgeCatalogueContext";
import { useBadgeCatalogue } from "../../../hooks/useBadgeCatalogue";
import { useAuth } from "../../../context/AuthContext";
import { useEvidenceSubmissions } from "../../../hooks/useEvidenceSubmissions";
import { submitEvidence } from "../../../api/index";
import type { EvidenceSubmissionDto } from "../../../api/types";

type SubmissionStatus = "idle" | "submitting" | "submitted";

export default function EvidenceSubmission() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const { refreshBadges } = useBadgeCatalogueContext();
  const { data: catalogue } = useBadgeCatalogue(studentId);
  const { data: submissions, loading: submissionsLoading, refresh } = useEvidenceSubmissions(studentId);

  const badgeOptions = catalogue?.badges ?? [];

  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBadge = badgeOptions.find((b) => b.id === selectedBadgeId);
  const unearnedSubs = selectedBadge?.subBadges.filter((s) => !s.earned) ?? [];
  const selectedSub = unearnedSubs.find((s) => String(s.id) === selectedSubId);

  function handleFile(f: File) {
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !selectedBadge || !selectedSub || !file) return;

    setStatus("submitting");

    try {
      await submitEvidence(studentId, selectedSub.id, notes, file);
      refresh();
      refreshBadges();
      setStatus("submitted");
      setSelectedBadgeId("");
      setSelectedSubId("");
      setNotes("");
      setFile(null);
    } catch {
      setStatus("idle");
    }
  }

  function resetForm() {
    setStatus("idle");
  }

  const canSubmit = !!selectedBadge && !!selectedSub && !!file;

  return (
    <div className="ev-page">
      <div className="ev-page__header">
        <h1 className="ev-page__title">📤 Submit Evidence</h1>
        <p className="ev-page__subtitle">
          Upload proof of a completed challenge or sub-badge for your coach to review and approve.
        </p>
      </div>

      <div className="ev-layout">
        {/* ── Submission form ── */}
        <div className="ev-form-col">
          <section className="ev-card">
            {status === "submitted" ? (
              <div className="ev-success">
                <span className="ev-success__icon">🎉</span>
                <h2 className="ev-success__title">Evidence Submitted!</h2>
                <p className="ev-success__body">
                  Your coach will review it and award your badge once approved.
                  You'll be notified when a decision is made.
                </p>
                <button className="ev-btn ev-btn--primary" onClick={resetForm}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form className="ev-form" onSubmit={handleSubmit}>
                <h2 className="ev-card__title">New Submission</h2>

                {/* Step 1 — Pick badge */}
                <div className="ev-field">
                  <label className="ev-label" htmlFor="badge-select">
                    <span className="ev-label__step">1</span> Choose Badge
                  </label>
                  <select
                    id="badge-select"
                    className="ev-select"
                    value={selectedBadgeId}
                    onChange={(e) => { setSelectedBadgeId(e.target.value); setSelectedSubId(""); }}
                  >
                    <option value="">— Select a badge —</option>
                    {badgeOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.icon} {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2 — Pick sub-badge */}
                <div className="ev-field">
                  <label className="ev-label" htmlFor="sub-select">
                    <span className="ev-label__step">2</span> Choose Challenge
                  </label>
                  <select
                    id="sub-select"
                    className="ev-select"
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    disabled={!selectedBadgeId}
                  >
                    <option value="">— Select a challenge —</option>
                    {unearnedSubs.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.icon} {s.name} (+{s.xpReward} XP)
                      </option>
                    ))}
                  </select>
                  {selectedBadge && unearnedSubs.length === 0 && (
                    <p className="ev-field__hint ev-field__hint--success">
                      ✅ You've earned all challenges for this badge!
                    </p>
                  )}
                </div>

                {/* Selected challenge info */}
                {selectedSub && (
                  <div className="ev-challenge-info">
                    <span className="ev-challenge-info__icon">{selectedSub.icon}</span>
                    <div>
                      <p className="ev-challenge-info__name">{selectedSub.name}</p>
                      <p className="ev-challenge-info__criteria">{selectedSub.criteria}</p>
                    </div>
                    <span className="ev-challenge-info__xp">+{selectedSub.xpReward} XP</span>
                  </div>
                )}

                {/* Step 3 — Upload file */}
                <div className="ev-field">
                  <label className="ev-label">
                    <span className="ev-label__step">3</span> Upload Evidence
                  </label>
                  <div
                    className={`ev-dropzone${dragOver ? " ev-dropzone--over" : ""}${file ? " ev-dropzone--has-file" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="ev-dropzone__input"
                      accept="image/*,video/*,.pdf,.mp4,.mov"
                      onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                    />
                    {file ? (
                      <>
                        <span className="ev-dropzone__file-icon">📎</span>
                        <span className="ev-dropzone__file-name">{file.name}</span>
                        <span className="ev-dropzone__file-size">{(file.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          className="ev-dropzone__remove"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        >
                          ✕ Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="ev-dropzone__icon">📁</span>
                        <span className="ev-dropzone__label">Drag & drop or <u>browse</u></span>
                        <span className="ev-dropzone__hint">Images, video, or PDF — max 50 MB</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Step 4 — Notes */}
                <div className="ev-field">
                  <label className="ev-label" htmlFor="ev-notes">
                    <span className="ev-label__step">4</span> Notes <span className="ev-label__optional">(optional)</span>
                  </label>
                  <textarea
                    id="ev-notes"
                    className="ev-textarea"
                    rows={3}
                    placeholder="Describe what you did, when, and any extra context for your coach…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                  />
                  <span className="ev-field__count">{notes.length}/500</span>
                </div>

                <button
                  type="submit"
                  className={`ev-btn ev-btn--primary ev-btn--full${status === "submitting" ? " ev-btn--loading" : ""}`}
                  disabled={!canSubmit || status === "submitting"}
                >
                  {status === "submitting" ? "Submitting…" : "📤 Submit for Approval"}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* ── Previous submissions ── */}
        <div className="ev-history-col">
          <section className="ev-card">
            <h2 className="ev-card__title">My Submissions</h2>
            {submissionsLoading ? (
              <div className="ev-skeleton-list">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="ev-skeleton-item" />
                ))}
              </div>
            ) : submissions === null || submissions.length === 0 ? (
              <p className="ev-empty">No submissions yet. Submit your first evidence above!</p>
            ) : (
              <ul className="ev-submissions">
                {submissions.map((s: EvidenceSubmissionDto) => (
                  <li key={s.id} className={`ev-submission ev-submission--${s.status}`}>
                    <span className="ev-submission__icon">{s.subBadgeIcon}</span>
                    <div className="ev-submission__body">
                      <span className="ev-submission__sub">{s.subBadgeName}</span>
                      <span className="ev-submission__badge">{s.badgeName}</span>
                      <span className="ev-submission__file">📎 {s.fileName}</span>
                      {s.notes && <span className="ev-submission__notes">"{s.notes}"</span>}
                    </div>
                    <div className="ev-submission__meta">
                      <span className={`ev-submission__status ev-submission__status--${s.status}`}>
                        {s.status === "pending" && "⏳ Pending"}
                        {s.status === "approved" && "✅ Approved"}
                        {s.status === "rejected" && "❌ Rejected"}
                      </span>
                      <span className="ev-submission__date">{s.submittedAt}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
