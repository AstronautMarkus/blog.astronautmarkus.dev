import { useEffect, useState } from 'react';
import axios from 'axios';

const isp_api_url = "https://ipapi.co/json/"
const flags_api_url = "https://flagsapi.com/";

function getClientIPData() {
  return axios.get(isp_api_url, { timeout: 5000 })
    .then(response => ({
      ip: response.data.ip,
      country: response.data.country_name,
      countryCode: response.data.country_code,
      region: response.data.region,
      regionName: response.data.region,
      city: response.data.city,
      zip: response.data.postal,
      lat: response.data.latitude,
      lon: response.data.longitude,
      timezone: response.data.timezone,
      isp: response.data.org,
      org: response.data.org,
      as: response.data.asn,
      status: 'success',
    }))
    .catch(() => ({ ip: 'Unknown' }));
}

async function postVisitor(apiUrl, country, ip_address, country_code, user_agent) {
  try {
    const response = await axios.post(
      `${apiUrl}/visitors`,
      { country, ip_address, country_code, user_agent },
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
          const user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
          postVisitor(apiUrl, data.country, data.ip, data.countryCode, user_agent).then(response => {
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
          setError('Error loading visitor data. Please try again later.');
        }
        setLoading(false);
      });

    return () => {
      source.cancel('Component unmounted');
    };
  }, [apiUrl]);

  return { visitorData, loading, error };
}

function formatDigitalCounter(count) {
  const str = String(count).padStart(4, '0');
  if (str.length <= 4) {
    return str.slice(0, 2) + str.slice(2);
  } else {
    const main = str.slice(0, str.length - 2);
    const last = str.slice(-2);
    return main + last;
  }
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
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">Total Visitors:</span>
            <div
              className="bg-black text-white font-mono text-2xl px-4 py-2 shadow-lg playstation-fonts select-none"
              style={{ borderRadius: 0, minWidth: '90px', textAlign: 'center' }}
            >
              {formatDigitalCounter(visitorData?.visitors_counter ?? 0)}
            </div>
          </div>
          
          {visitorData?.countries?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              {Array.from(
                new Map(
                  visitorData.countries.map(c => [c.country_code, c])
                ).values()
              ).map((country) => (
                <img
                  key={country.country_code}
                  src={`${flags_api_url}${country.country_code}/flat/64.png`}
                  alt={country.country}
                  title={country.country}
                  className="h-8"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VisitorStats;