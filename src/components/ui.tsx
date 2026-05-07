import { Loader2 } from 'lucide-react';
import type { ReactNode, FC } from 'react';

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-surface-400 text-sm">{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon?: FC<{ className?: string }>; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center">
          <Icon className="w-8 h-8 text-surface-500" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-surface-400 mt-1 max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'badge-neutral', PUBLISHED: 'badge-success', CANCELLED: 'badge-danger', COMPLETED: 'badge-primary',
    SCHEDULED: 'badge-warning', IN_PROGRESS: 'badge-warning', WALKOVER: 'badge-neutral',
    REGISTERED: 'badge-success', WITHDRAWN: 'badge-danger',
    PRESENT: 'badge-success', ABSENT: 'badge-danger', LATE: 'badge-warning', EXCUSED: 'badge-neutral',
    ACTIVE: 'badge-success',
  };
  return <span className={styles[status] || 'badge-neutral'}>{status}</span>;
}

export function Avatar({ src, name, size = 'md', className = '' }: { src?: string | null; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-semibold ${className}`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-surface-800 border border-surface-700 rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto z-10`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-700 text-surface-400">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; variant?: 'danger' | 'primary' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-surface-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}>{confirmText}</button>
      </div>
    </Modal>
  );
}

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-surface-800 rounded-xl p-1 border border-surface-700/50">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white hover:bg-surface-700'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
