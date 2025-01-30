import { useState } from 'react';
import axios from 'axios';

function App() {
  const [domain, setDomain] = useState('');
  const [extension, setExtension] = useState('com');
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setPrices(null);
    setLoading(true);

    try {
      const response = await axios.get('https://domain-compare-price.onrender.com/compare', {
        params: { domain, extension },
      });

      setPrices({
        namecheap: response.data.namecheap,
        register365: response.data.register365,
      });
    } catch (err) {
      setError('Failed to fetch domain prices.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Domain Price Comparator</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter domain name"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border rounded-lg p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={extension}
          onChange={(e) => setExtension(e.target.value)}
          className="border rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="com">.com</option>
          <option value="net">.net</option>
          <option value="io">.io</option>
          <option value="org">.org</option>
          <option value="ie">.ie</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center mt-6">
          <svg
            className="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.972 7.972 0 014 12H0c0 2.21.896 4.21 2.344 5.657l1.656-1.366z"
            ></path>
          </svg>
          <p className="ml-4 text-blue-600 text-xl font-semibold">Fetching prices...</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-6">{error}</p>}

      {prices && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mt-6">
          <h2 className="text-2xl font-semibold mb-4">Prices for {domain}.{extension}</h2>
          <ul className="space-y-2">
            <li className="border-b pb-2">
              <strong>Namecheap:</strong> {prices.namecheap}{' '}
              <a
                href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}.${extension}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Buy on Namecheap
              </a>
            </li>
            <li className="border-b pb-2">
              <strong>Register365:</strong> {prices.register365}{' '}
              <a
                href={`https://www.register365.com/search/domain?keyword=${domain}&suffix=.${extension}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Buy on Register365
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
