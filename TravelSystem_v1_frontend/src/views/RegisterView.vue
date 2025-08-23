<template>
  <div class="register-page">
    <div class="wrapper">
      <div class="head">Travel</div>

      <div class="card">
        <div class="main">
          <div class="tab">
            Only email registration is supported in your region. One account is all you need to access all services.
          </div>

          <!-- 邮箱输入 -->
          <div class="input-box" :class="{ 'input-error': errors.email }">
            <span class="icon"><img src="../assets/icon/phone.svg" alt="email icon" /></span>
            <input 
              type="email" 
              placeholder="Email address" 
              v-model="email" 
              @input="validateEmail"
            />
          </div>
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>

          <!-- 用户名输入 -->
          <div class="input-box" :class="{ 'input-error': errors.username }">
            <span class="icon"><img src="../assets/icon/phone.svg" alt="username icon" /></span>
            <input 
              type="text" 
              placeholder="Username" 
              v-model="username" 
              @input="validateUsername"
            />
          </div>
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>

          <!-- 密码输入 -->
          <div class="input-box" :class="{ 'input-error': errors.password }">
            <span class="icon"><img src="../assets/icon/lock.svg" alt="lock icon" /></span>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Password" 
              v-model="password" 
              @input="validatePassword"
            />
            <span class="see" @click="showPassword = !showPassword">
              <img :src="showPassword ? eye : eyeclose" alt="toggle visibility" />
            </span>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>

          <!-- 确认密码输入 -->
          <div class="input-box" :class="{ 'input-error': errors.confirmPassword }">
            <span class="icon"><img src="../assets/icon/lock.svg" alt="lock icon" /></span>
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Confirm Password" 
              v-model="confirmPassword" 
              @input="validateConfirmPassword"
            />
            <span class="see" @click="showConfirmPassword = !showConfirmPassword">
              <img :src="showConfirmPassword ? eye : eyeclose" alt="toggle visibility" />
            </span>
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>

          <!-- 验证码 + 发送按钮 -->
          <div class="input-group">
            <div class="input-box" style="flex: 1" :class="{ 'input-error': errors.code }">
              <span class="icon"><img src="../assets/icon/send.svg" alt="send icon" /></span>
              <input 
                placeholder="Verification Code" 
                v-model="code" 
                @input="validateCode"
              />
            </div>
            <button 
              class="code-button" 
              @click="handleSendCode" 
              :disabled="isSending || !isEmailValid"
            >
              {{ isSending ? `${countdown}s` : 'Send Code' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.code">{{ errors.code }}</span>

          <!-- 协议勾选 -->
          <div class="agreement">
            <input 
              type="checkbox" 
              id="agree" 
              v-model="agree" 
              @change="clearError('agree')"
            />
            <label for="agree">
              I have read and agree to the
              <a href="#">《User Agreement》</a>
              and
              <a href="#">《Privacy Policy》</a>
            </label>
          </div>
          <span class="error-message" v-if="errors.agree">{{ errors.agree }}</span>

          <!-- 注册按钮 -->
          <button 
            class="submit" 
            @click="handleRegister" 
            :disabled="isRegistering"
          >
            <span v-if="!isRegistering">Register</span>
            <span v-else>Processing...</span>
          </button>

          <!-- 底部链接 -->
          <div class="footer-links">
            <span>Already have an account?</span>
            <a href="/login">Login</a>
          </div>

          <!-- 注册结果提示 -->
          <div class="result-message" :class="{ success: registerSuccess, error: !registerSuccess }">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import eye from '../assets/icon/eye.svg'
import eyeclose from '../assets/icon/eyeclose.svg'

const router = useRouter()

// 表单数据
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const agree = ref(false)

// 显示/隐藏密码
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 错误信息
const errors = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  agree: ''
})

// 提示信息
const message = ref('')
const registerSuccess = ref(false)

// 验证码发送状态
const isSending = ref(false)
const countdown = ref(0)
let timer = null

// 注册状态
const isRegistering = ref(false)

// 邮箱验证状态
const isEmailValid = ref(false)

// 使用 pinia 用户 store
const userStore = useUserStore()

// 清理定时器
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 验证邮箱
const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'Email is required'
    isEmailValid.value = false
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    isEmailValid.value = false
    return
  }
  
  errors.value.email = ''
  isEmailValid.value = true
}

// 验证用户名
const validateUsername = () => {
  if (!username.value) {
    errors.value.username = 'Username is required'
    return
  }
  
  if (username.value.length < 2) {
    errors.value.username = 'Username must be at least 2 characters'
    return
  }
  
  errors.value.username = ''
}

// 验证密码
const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Password is required'
    return
  }
  
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  
  errors.value.password = ''
}

// 验证确认密码
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password'
    return
  }
  
  if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }
  
  errors.value.confirmPassword = ''
}

// 验证验证码
const validateCode = () => {
  if (!code.value) {
    errors.value.code = 'Verification code is required'
    return
  }
  
  // 简单的验证码验证 (可根据实际需求调整)
  const codeRegex = /^[0-9]{6}$/
  if (!codeRegex.test(code.value)) {
    errors.value.code = 'Verification code must be 6 digits'
    return
  }
  
  errors.value.code = ''
}

// 清除错误
const clearError = (field) => {
  errors.value[field] = ''
}

// 发送验证码
const handleSendCode = async () => {
  validateEmail()
  if (!isEmailValid.value) return
  
  try {
    isSending.value = true
    countdown.value = 60
    
    // 调用 store 里的发送验证码方法
    const res = await userStore.sendCode(email.value)
    message.value = res.message
    registerSuccess.value = res.success
    
    // 倒计时逻辑
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isSending.value = false
      }
    }, 1000)
  } catch (error) {
    message.value = error.message || 'Failed to send verification code'
    registerSuccess.value = false
    isSending.value = false
  }
}

// 注册
const handleRegister = async () => {
  // 验证所有字段
  validateEmail()
  validateUsername()
  validatePassword()
  validateConfirmPassword()
  validateCode()
  
  if (!agree.value) {
    errors.value.agree = 'Please agree to the terms'
    return
  }
  
  // 检查是否有错误
  const hasErrors = Object.values(errors.value).some(error => error !== '')
  if (hasErrors) return
  
  try {
    isRegistering.value = true
    message.value = ''
    
    const res = await userStore.register({
      email: email.value,
      username: username.value,
      password: password.value,
      code: code.value
    })
    
    message.value = res.message
    registerSuccess.value = res.success
    
    if (registerSuccess.value) {
      // 注册成功后的处理，比如跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    message.value = error.message || 'Registration failed'
    registerSuccess.value = false
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  padding: 20px 0;
}

.register-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.wrapper {
  width: 432px;
  position: relative;
  z-index: 2;
}

.head {
  font-family: "Lobster Two", cursive;
  font-size: 48px;
  font-weight: 400;
  color: #08f;
  text-align: center;
  font-style: italic;
  margin: 16px 0;
}

.card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  padding: 12px;
  border-radius: 16px;
  display: flex;
  min-height: 420px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.main {
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  max-width: 408px;
  min-width: 300px;
  padding: 16px 16px 16px;
  display: flex;
  gap: 16px;
}

.tab {
  font-size: 12px;
  line-height: 140%;
  color: #a3a3a3;
  margin-bottom: 8px;
}

/* 输入框样式 */
.input-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
  gap: 8px;
  transition: border-color 0.3s;
}

.input-box.input-error {
  border-color: #ff4d4f;
}

.input-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background-color: transparent;
}

.input-box:focus-within {
  border: 2px solid #08f;
}

/* 错误信息 */
.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: -8px;
  height: 16px;
}

/* 图标样式 */
.icon {
  color: #999;
  font-size: 2px;
}

.icon img {
  width: 18px;
  height: 18px;
}

.see {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.see img {
  width: 18px;
  height: 18px;
}

/* 验证码按钮 */
.input-group {
  display: flex;
  gap: 10px;
}

.code-button {
  background: #fff;
  border: 1px solid #ccc;
  color: #000;
  border-radius: 8px;
  padding: 0 16px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.code-button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.code-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 注册按钮 */
.submit {
  background-color: #08f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit:hover:not(:disabled) {
  opacity: 0.9;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 协议勾选 */
.agreement {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  color: #666;
  gap: 6px;
  line-height: 1.4;
  margin-top: 8px;
}

.agreement input[type="checkbox"] {
  accent-color: #08f;
  margin-top: 2px;
}

.agreement a {
  color: #08f;
  text-decoration: none;
}

/* 底部链接 */
.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  gap: 8px;
  margin-top: 8px;
}

.footer-links span {
  color: #666;
}

.footer-links a {
  color: #08f;
  text-decoration: none;
  font-weight: 500;
}

/* 结果消息 */
.result-message {
  text-align: center;
  font-size: 14px;
  min-height: 20px;
}

.result-message.success {
  color: #52c41a;
}

.result-message.error {
  color: #ff4d4f;
}
</style>
