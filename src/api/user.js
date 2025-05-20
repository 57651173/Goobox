import request from '@/utils/request'

export const register = (data) => request.post('/common/user/register', data)

export const login = (data) => request.post('/common/user/login', data)

export const logout = () => request.post('/common/user/logout')

export const getUserInfo = () => request.get('/common/user/info')

// 获取验证码
export const getCaptcha = () => request.get('/common/user/captcha')

// 发送短信验证码
export const sendSmsCaptcha = (phone) => request.post('/common/user/send-sms', { phone })
