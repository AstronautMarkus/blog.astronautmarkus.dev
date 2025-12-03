import React, { useEffect, useState } from "react";
import axios from "axios";

function usePostStats(apiUrl, slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl || !slug) {
      setError('API_URL or slug is not defined');
      setLoading(false);
      return;
    }

    const source = axios.CancelToken.source();

    axios.get(`${apiUrl}/posts/${slug}`, {
      timeout: 5000,
      cancelToken: source.token,
    })
      .then((res) => {
        setPost(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          setError('Request cancelled');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timed out');
        } else {
          setError('Error fetching post stats');
        }
        setPost(null);
        setLoading(false);
      });

    return () => {
      source.cancel('Component unmounted');
    };
  }, [apiUrl, slug]);

  return { post, loading, error };
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

function PostStats({ API_URL, slug }) {
  const { post, loading, error } = usePostStats(API_URL, slug);

  return (
    <div className="bg-[#c5c1c0] shadow p-4 mb-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 playstation-fonts md:text-xl text-gray-900">
        <i className="hn hn-chart-bar-solid"></i>Post Stats
      </h3>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : error ? (
        <p className="text-lg text-red-600">{error}</p>
      ) : post ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">Title:</span>
            <span className="font-medium text-sm text-gray-900">{post.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">Views:</span>
            <div
              className="bg-black text-white font-mono text-2xl px-4 py-2 shadow-lg playstation-fonts"
              style={{ borderRadius: 0, minWidth: '90px', textAlign: 'center' }}
            >
              {formatDigitalCounter(post.views_count ?? 0)}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-lg">No data available.</p>
      )}
    </div>
  );
}

export default PostStats;