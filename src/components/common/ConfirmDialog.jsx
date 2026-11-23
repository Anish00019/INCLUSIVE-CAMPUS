import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', tone = 'danger', loading }) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading} type="button">
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid place-items-center h-10 w-10 rounded-full bg-amber-50 text-amber-700 shrink-0"><AlertTriangle className="h-5 w-5" aria-hidden="true" /></span>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </Modal>
  );
}
