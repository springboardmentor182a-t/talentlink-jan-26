const [stats, setStats] = useState({});

// 1. Get the Base URL from the .env file
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

useEffect(() => {
  // 2. Use backticks (`) to combine the Base URL with the specific endpoint
  axios.get(`${API_URL}/dashboard/stats`)
    .then(res => setStats(res.data))
    .catch(err => console.error("Error fetching stats:", err));
}, []);