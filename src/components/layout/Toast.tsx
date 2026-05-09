
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../store/ToastContext';

export default function Toast() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast flex items-center gap-3 bg-surface-tertiary/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border border-separator pointer-events-auto"
        >
          {toast.variant === 'success' && <CheckCircle size={18} className="text-ios-green shrink-0" />}
          {toast.variant === 'error' && <AlertCircle size={18} className="text-ios-red shrink-0" />}
          {toast.variant === 'info' && <Info size={18} className="text-ios-blue shrink-0" />}
          <span className="text-sm text-white flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-ios-gray hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
