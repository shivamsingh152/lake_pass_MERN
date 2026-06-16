export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button 
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default" 
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className={`relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-white rounded-t-lg sm:rounded-t-xl">
          <h3 className="text-lg font-semibold text-slate-900 pr-4">{title}</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded flex-shrink-0" 
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
