import { useAuth } from 'react-oidc-context';
import { useAdminUsers } from '../api/hooks';
import type { User, UserPreference } from '../api/client';

export default function AdminPage() {
  const auth = useAuth();
  const { data, isLoading, error } = useAdminUsers();

  const email = ((auth.user?.profile as Record<string, unknown>)?.email as string) || '';

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin</h1>
          <div className="bg-primary-600/50 border border-primary-500 rounded p-6">
            <p className="text-primary-50 text-lg">Please sign in to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if ((email || '').toLowerCase() !== 'loganfake@gmail.com') {
    return (
      <div className="min-h-screen bg-primary-700 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin</h1>
          <div className="bg-primary-600/50 border border-primary-500 rounded p-6">
            <p className="text-primary-50 text-lg">You are not authorized to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin — Users</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="error-bg border rounded p-4 mb-6">
            <p className="text-primary-50">Error: {error instanceof Error ? error.message : 'Failed to load users'}</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {data.users.map((u: { user: User; preference: UserPreference | null }) => (
              <div key={u.user.id} className="card-bg rounded p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{u.user.username || u.user.email || `User ${u.user.id}`}</div>
                  <div className="text-sm text-neutral-300">{u.user.email || 'No email'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-200">Build preference</div>
                  <div className="font-medium">{u.preference ? u.preference.build_type : 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
