import toast from 'react-hot-toast';

export function showErrorToast(error: Error) {
  toast.custom((t) => (
    <div className="bg-red-800 text-white rounded-lg shadow-lg min-w-[260px] flex flex-col items-center p-4 pt-8 relative">
      <div className="mb-2 font-bold text-lg">An error occurred!</div>
      <div className="mb-2 text-sm break-words max-w-xs">{error.message}</div>
      <button
        className="absolute top-2 right-2 text-white bg-transparent hover:text-red-400 text-xl font-bold px-2 py-1 rounded focus:outline-none"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  ));
}
