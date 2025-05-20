import axios from 'axios';
import { message as antMessage } from 'ant-design-vue';
import { Modal as antModal } from 'ant-design-vue';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';


const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // axios 会自动处理对象的 stringify，如果 Content-Type 是 application/json
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('responseData ---------', response);
    if (response.status === 204) {
      return null;
    }

    const code = parseInt(response.data.code);
    const message = response.data.message;

    if(code !== 2000){
      if([5008,5012,5013].includes(code)){
        // 注意：router 的使用也可能需要在 setup 上下文，或者从外部传入 router 实例
        // 如果 store 和 router 是全局导入并初始化的，这里可能暂时没问题，但需留意
        antModal.confirm({
          title: t('error.reLogin'), // 这里也可以考虑使用 i18n 键
          content: message,
          onOk: () => {
            // store.dispatch('auth/resetToken').then(() => {
            //   router.push('/login');
            // });
            // TODO: Handle re-login logic, ensure store and router are accessible
            console.warn("Re-login logic needs to be connected to store and router properly.")
            useRouter().push('/login');
          }
        });
      }else{
        antMessage.error(message);
      }
      // 使用 message 或一个通用的回退
      return Promise.reject(new Error(message || 'Request failed'));
    }else{
      return response.data; // 通常 axios 在这里返回 response.data 已经足够
    }
  },
  (error) => {
    // 使用一个通用的回退错误消息
    antMessage.error(error.response?.data?.message || error.message || 'Request failed');
    return Promise.reject(error);
  }
);

export default apiClient;

// 原来的 fetch 版本 request 函数，现在未使用
/*
export async function request(endpoint, options = {}) {
  const { method = 'GET', data, headers = {}, ...restOptions } = options;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
    config.body = JSON.stringify(data);
  }

  let fullUrl = `${BASE_URL}${endpoint}`;
  if (method === 'GET' && data) {
    const queryParams = new URLSearchParams(data);
    fullUrl += `?${queryParams.toString()}`;
  }

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || `HTTP error! Status: ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    if (response.status === 204) {
      return null; 
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text(); 
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}
*/



