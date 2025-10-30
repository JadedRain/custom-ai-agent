import toast from 'react-hot-toast';

export function showCustomToast() {
  toast.custom((t) => (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg min-w-[220px] flex flex-col items-center p-4 pt-8 relative">
      <div className="mb-2">Click the <span className='font-bold text-xl'>×</span> in the top right to close this toast.</div>
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
