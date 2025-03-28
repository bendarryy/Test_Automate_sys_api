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

export default apiClient;
