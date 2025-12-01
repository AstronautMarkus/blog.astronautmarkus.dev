import { useEffect, useState } from 'react';
import axios from 'axios';

const isp_api_url = "http://ip-api.com/json/"

function getClientIPData() {
  return axios.get(isp_api_url, { timeout: 5000 })
    .then(response => ({
      ip: response.data.query,
      country: response.data.country,
      countryCode: response.data.countryCode,
      region: response.data.region,
      regionName: response.data.regionName,
      city: response.data.city,
      zip: response.data.zip,
      lat: response.data.lat,
      lon: response.data.lon,
      timezone: response.data.timezone,
      isp: response.data.isp,
      org: response.data.org,
      as: response.data.as,
      status: response.data.status,
    }))
    .catch(() => ({ ip: 'Unknown' }));
}

// New function to POST visitor data
async function postVisitor(apiUrl, country, ip_address) {
  try {
    const response = await axios.post(
      `${apiUrl}/visitors`,
      { country, ip_address },
      { timeout: 5000 }
    );
    console.log('POST response:', response.data);
    return response;
  } catch (error) {
    console.log('POST error:', error.response?.data || error.message);
    return null;
  }
}

// Custom hook for visitor registration
function useRegisterVisitor(apiUrl) {
  useEffect(() => {
    if (!apiUrl) return;

    const lastVisitRaw = localStorage.getItem('last_visit');
    let shouldRegister = true;

    if (lastVisitRaw) {
      try {
        const lastVisit = JSON.parse(lastVisitRaw);
        const lastTime = new Date(lastVisit.visit_time).getTime();
        const now = Date.now();
        // 24 hours = 86400000 ms
        if (now - lastTime < 86400000) {
          shouldRegister = false;
        }
      } catch (e) {
        console.error('Error parsing last_visit from localStorage', e);
      }
    }

    if (shouldRegister) {
      getClientIPData().then(data => {
        if (data.ip !== 'Unknown' && data.country) {
          postVisitor(apiUrl, data.country, data.ip).then(response => {
            if (response && response.status === 201 && response.data.last_visitor) {
              localStorage.setItem(
                'last_visit',
                JSON.stringify({ visit_time: response.data.last_visitor.visit_time })
              );
            } else if (response && response.status === 200) {
              localStorage.setItem(
                'last_visit',
                JSON.stringify({ visit_time: new Date().toISOString() })
              );
            }
          });
        }
      });
    }
  }, [apiUrl]);
}

export function useVisitorStats(apiUrl) {
  const [visitorData, setVisitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) {
      setError('API_URL is not defined');
      setLoading(false);
      return;
    }

    const source = axios.CancelToken.source();

    axios.get(`${apiUrl}/visitors`, {
      timeout: 5000,
      cancelToken: source.token,
    })
      .then((response) => {
        setVisitorData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          setError('Request cancelled');
        } else if (error.code === 'ECONNABORTED') {
          setError('Request timed out');
        } else {
          setError('Error fetching visitor data');
        }
        setLoading(false);
      });

    return () => {
      source.cancel('Component unmounted');
    };
  }, [apiUrl]);

  return { visitorData, loading, error };
}

function VisitorStats({ apiUrl }) {
  useRegisterVisitor(apiUrl);

  const { visitorData, loading, error } = useVisitorStats(apiUrl);

  return (
    <div className="bg-[#c5c1c0] shadow p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 playstation-fonts md:text-xl text-gray-900">
        <i className="hn hn-globe-americas-solid"></i>Visitors Stats
      </h3>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-600">{error}</p>
      ) : (
        <p className="text-lg">
          Total Visitors: <strong>{visitorData?.visitors_counter ?? 'N/A'}</strong>
        </p>
      )}
    </div>
  );
}

export default VisitorStats;