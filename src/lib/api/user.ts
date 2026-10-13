export async function getCurrentUser(token: string) {
  const response = await fetch('/api/user/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
} 