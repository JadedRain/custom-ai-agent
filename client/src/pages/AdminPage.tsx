import { useAuth } from 'react-oidc-context';
import { useAdminUsers } from '../api/hooks';
import type { User, UserPreference } from '../api/client';

export default function AdminPage() {
  const auth = useAuth();
  const { data, isLoading, error } = useAdminUsers();

  const email = ((auth.user?.profile as Record<string, unknown>)?.email as string) || '';

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg">Please sign in to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if ((email || '').toLowerCase() !== 'loganfake@gmail.com') {
    return (
      <div className="min-h-screen green-bg-medium text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin</h1>
          <div className="green-bg-light green-border border rounded p-6">
            <p className="text-white text-lg">You are not authorized to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen green-bg-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 green-text-light">Admin — Users</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4 mb-6">
            <p className="text-primary-50">Error: {error instanceof Error ? error.message : 'Failed to load users'}</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {data.users.map((u: { user: User; preference: UserPreference | null }) => (
              <div key={u.user.id} className="green-bg-medium green-border border rounded p-4 flex justify-between items-center">
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
