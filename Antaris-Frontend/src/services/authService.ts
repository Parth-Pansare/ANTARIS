export type AuthProvider='password'|'google'|'microsoft'|'government';
export async function beginAuthentication(provider:AuthProvider,email?:string){await new Promise(r=>setTimeout(r,650));if(provider==='password'&&!email)return{success:false,requiresOtp:false,message:'Enter your mission email.'};return{success:true,requiresOtp:true};}
export async function verifyOtp(otp:string){await new Promise(r=>setTimeout(r,450));return otp==='123456';}
