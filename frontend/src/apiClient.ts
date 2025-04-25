// apiClient.ts
import axios from 'axios';

// إعدادات الـ CSRF لتتوافق مع إعدادات Django
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

// يمكنك أيضاً تحديد الـ baseURL إن كان كل الـ endpoints موجودة في نفس المضيف
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  function getCookie(name: string | string[]) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default apiClient;
