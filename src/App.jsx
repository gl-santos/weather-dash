import { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState([]);
  const [input, setInput] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        const apiKey = import.meta.env.VITE_APP_API_KEY;
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error('City not found');
        const data = await res.json();
        processData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (city) fetchWeather();
  }, [city]);

  const processData = data => {
    const forecasts = [];
    if (data) {
      setCity(data.city.name);
      setCountry(data.city.country);

      for (let i = 0, j = 0; i < data.cnt; i += 8, j++) {
        const dayData = data.list[i];
        forecasts.push({
          key: j,
          date: formatDate(new Date(dayData.dt * 1000)),
          temp: `${Math.round(dayData.main.temp)}°C`,
          desc: capitalizeEachWord(dayData.weather[0].description),
          icon: `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`
        });
      }
    }
    setWeather(forecasts);
  };

  function formatDate(date) {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const oneDayInMilliseconds = 86400000;
    const currentDate = new Date()
    const forecastDate = new Date(date);
    let formattedDate = '';
  
    currentDate.setHours(0, 0, 0, 0);
    forecastDate.setHours(0, 0, 0, 0);

    if (forecastDate.getTime() === currentDate.getTime()) {
      formattedDate = 'Today';
    }
    else if (forecastDate.getTime() === (currentDate.getTime() + oneDayInMilliseconds)) {
      formattedDate = 'Tomorrow';
    }
    else if (forecastDate.getTime() > (currentDate.getTime() + oneDayInMilliseconds)) {
      formattedDate = weekday[date.getDay()];
    }

    return formattedDate;
  }

  function capitalizeEachWord(sentence) {
    if (typeof sentence !== 'string' || sentence === null || sentence.trim() === '') {
      return '';
    }

    const words = sentence.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) {
        return '';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return capitalizedWords.join(' ');
  }

  const fetchCity = () => {
    if (input.trim()) {
      setCity(encodeURI(input));
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Search Header */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Weather Finder</h1>
          <div className="flex mb-4">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What city do you want to search?"
              className="flex-1 border border-gray-300 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && fetchCity()}
            />
            <button
              onClick={fetchCity}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-r-lg font-semibold transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        {/* City Header */}
        {weather && weather.length > 0 && (
          <div className="mx-auto text-center bg-white rounded-lg shadow-md mb-6 p-4 pl-6">
            <span className="text-2xl font-semibold text-gray-800">{`Forecast for ${city}, ${country}`}</span>
          </div>
        )}

        {/* Forecast Grid */}
        {loading && <div className="text-center py-8">Loading forecast...</div>}
        {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
        {!loading && !error && weather.length === 0 && <div className="text-center py-8 text-gray-500">Enter a city to get started!</div>}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {weather.map(forecast => (
            <div key={forecast.key} className="bg-white rounded-xl border shadow-md p-6 text-center flex flex-col items-center space-y-2">
              <img src={forecast.icon} alt={forecast.desc} className="w-16 h-16" />
              <p className="text-2xl font-bold text-gray-800">{forecast.temp}</p>
              <p className="text-gray-600 capitalize">{forecast.desc}</p>
              <p className="text-sm text-gray-500">{forecast.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
