const fetchCsrfToken = async () => {
  const response = await fetch('http://localhost:5000/csrf-token', {
      method: 'GET',
      credentials: 'include',
  });

  if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
  }

  const data = await response.json();
  console.log('Fetched CSRF Token:', data.csrf_token);
  return data.csrf_token;
};

const login = async (username, password) => {
  try {
      const csrfToken = await fetchCsrfToken();
      console.log(csrfToken);

      const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
          },
          credentials: 'include', // Include cookies in the request
          body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
          throw new Error(`Login failed ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);
  } catch (error) {
      console.error(error);
  }
};

// Example usage
login('test', 'test');