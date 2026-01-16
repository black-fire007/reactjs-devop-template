// import axios from "axios"
// export const api = axios.create({
//     baseURL: "https://api.escuelajs.co/api/v1/"
// })


// // configure the interceptor 
// api.interceptors.request.use((config) => {
//     let tokensData = JSON.parse(localStorage.getItem("tokens"));
//     // do this only when we have token stored in local storage
//     if (tokensData && tokensData.access_token) {
//         config.headers["Authorization"] = `Bearer ${tokensData.access_token}`;
//     }
//     return config;
// });

// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     async (error) => {
//         console.log("Error : ", error)
//         // 401 means it is unauthorized
//         if (error.response.status === 401) {
//             const authData = JSON.parse(localStorage.getItem("tokens"));

//             // 
//             const payload = {
//                 access_token: authData.access_token,
//                 refresh_token: authData.refresh_token,
//             };

//             let apiResponse = await axios.post(
//                 "https://api.escuelajs.co/api/v1/auth/refresh-token",
//                 payload
//             );
//             localStorage.setItem("tokens", JSON.stringify(apiResponse.data));
//             error.config.headers[
//                 "Authorization"
//             ] = `Bearer ${apiResponse.data.access_token}`;
//             return axios(error.config);
//         } else {
//             return Promise.reject(error);
//         }
//     }
// );

import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1/",
});

/* ============================
   REQUEST INTERCEPTOR
   ============================ */
api.interceptors.request.use(
  (config) => {
    const tokensData = JSON.parse(localStorage.getItem("tokens"));

    // Attach access token if available
    if (tokensData?.access_token) {
      config.headers.Authorization = `Bearer ${tokensData.access_token}`;
    }

    return config;
  },
  (error) => {
    // Standard error propagation
    throw error;
  }
);

/* ============================
   RESPONSE INTERCEPTOR
   ============================ */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response (network error)
    if (!error.response) {
      throw error;
    }

    // Handle Unauthorized error
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const authData = JSON.parse(localStorage.getItem("tokens"));

      // If refresh token is missing → logout
      if (!authData?.refresh_token) {
        localStorage.removeItem("tokens");
        throw error;
      }

      try {
        const payload = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
        };

        // Refresh token request
        const apiResponse = await axios.post(
          "https://api.escuelajs.co/api/v1/auth/refresh-token",
          payload
        );

        // Save new tokens
        localStorage.setItem("tokens", JSON.stringify(apiResponse.data));

        // Update Authorization header
        originalRequest.headers.Authorization =
          `Bearer ${apiResponse.data.access_token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clear tokens & propagate error
        localStorage.removeItem("tokens");
        throw refreshError;
      }
    }

    // IMPORTANT: Use throw instead of Promise.reject
    throw error;
  }
);
