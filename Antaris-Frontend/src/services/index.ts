// Frontend service boundary. Each adapter is intentionally backend-ready.
export const endpoints = {
  auth: { login:'/api/auth/login', sendOtp:'/api/auth/send-otp', verifyOtp:'/api/auth/verify-otp' },
  stations: { list:'/api/stations', detail:(id:string)=>`/api/stations/${id}` },
  predictions: { environment:'/api/predictions/environment', energy:'/api/predictions/energy', fuel:'/api/predictions/fuel', equipment:'/api/predictions/equipment' },
  user: { me:'/api/users/me' },
};
