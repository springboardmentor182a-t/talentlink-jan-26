const [stats, setStats] = useState({});

useEffect(() => {
  axios.get('http://127.0.0.1:8000/dashboard/stats')
    .then(res => setStats(res.data));
}, []);