<template>
  <div class="login-page">
    <div class="wrapper">
      <div class="head">Travel</div>

      <div class="card">
        <div class="main">
          <!-- 登录方式切换 -->
          <div class="tab">
            <span 
              :class="{ active: mode === 'password' }" 
              @click="switchMode('password')"
            >
              Password Login
            </span>
            <span 
              :class="{ active: mode === 'code' }" 
              @click="switchMode('code')"
            >
              Code Login
            </span>
          </div>

          <div class="info">Only login via email is supported in your region.</div>

          <!-- 手机号 / 邮箱 -->
          <div class="input-box" :class="{ 'input-error': errors.identifier }">
            <span class="icon"><img src="@/assets/icon/phone.svg" alt="phone icon" /></span>
            <input 
              :placeholder="mode === 'password' ? 'Email address' : 'Email address'" 
              v-model="identifier" 
              @input="validateIdentifier"
            />
          </div>
          <span class="error-message" v-if="errors.identifier">{{ errors.identifier }}</span>

          <!-- 密码登录模式 -->
          <template v-if="mode === 'password'">
            <div class="input-box" :class="{ 'input-error': errors.password }">
              <span class="icon"><img src="@/assets/icon/lock.svg" alt="lock icon" /></span>
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
          </template>

          <!-- 验证码登录模式 -->
          <template v-else>
            <div class="input-group">
              <div class="input-box" style="flex: 1" :class="{ 'input-error': errors.code }">
                <span class="icon"><img src="@/assets/icon/send.svg" alt="send icon" /></span>
                <input 
                  placeholder="Verification Code" 
                  v-model="code" 
                  @input="validateCode"
                />
              </div>
              <button 
                class="code-button" 
                @click="handleSendCode" 
                :disabled="isSending || !isIdentifierValid"
              >
                {{ isSending ? `${countdown}s` : 'Send Code' }}
              </button>
            </div>
            <span class="error-message" v-if="errors.code">{{ errors.code }}</span>
          </template>

          <!-- 协议勾选 -->
          <div class="agreement">
            <input 
              type="checkbox" 
              id="agree" 
              v-model="agree" 
              @change="clearError('agree')"
            />
            <label for="agree">
              By signing up or logging in, you consent to Our 
              <a href="#">Terms of Use</a> and
              <a href="#">Privacy Policy</a>.
            </label>
          </div>
          <span class="error-message" v-if="errors.agree">{{ errors.agree }}</span>

          <!-- 登录按钮 -->
          <button 
            class="submit" 
            @click="handleLogin" 
            :disabled="isLoggingIn"
          >
            <span v-if="!isLoggingIn">Login</span>
            <span v-else>Logging in...</span>
          </button>

          <!-- 底部链接 -->
          <div class="footer-links">
            <a href="/forgot">Forgot password?</a>
            <a href="/register">Register</a>
          </div>

          <!-- 登录结果提示 -->
          <div class="result-message" :class="{ success: loginSuccess, error: !loginSuccess && message }">
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
import { useUserStore } from '../../stores/userStore'
import eye from '@/assets/icon/eye.svg'
import eyeclose from '@/assets/icon/eyeclose.svg'

const router = useRouter()
const userStore = useUserStore()

// 登录模式：password / code
const mode = ref('password')
const identifier = ref('')
const password = ref('')
const code = ref('')
const agree = ref(false)
const showPassword = ref(false)

// 错误信息
const errors = ref({
  identifier: '',
  password: '',
  code: '',
  agree: ''
})

// 提示信息
const message = ref('')
const loginSuccess = ref(false)

// 验证码发送状态
const isSending = ref(false)
const countdown = ref(0)
let timer = null

// 登录状态
const isLoggingIn = ref(false)

// 标识符验证状态
const isIdentifierValid = ref(false)

// 清理定时器
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 切换登录模式
const switchMode = (newMode) => {
  mode.value = newMode
  // 清空相关字段和错误
  if (newMode === 'password') {
    code.value = ''
    errors.value.code = ''
  } else {
    password.value = ''
    errors.value.password = ''
  }
  message.value = ''
}

// 验证标识符（手机号/邮箱）
const validateIdentifier = () => {
  if (!identifier.value) {
    errors.value.identifier = 'Phone number or email is required'
    isIdentifierValid.value = false
    return
  }

  if (mode.value === 'code') {
    // 手机号验证
    const phoneRegex = /^[0-9]{10,15}$/
    if (!phoneRegex.test(identifier.value)) {
      errors.value.identifier = 'Please enter a valid phone number'
      isIdentifierValid.value = false
      return
    }
  } else {
    // 邮箱或手机号验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{10,15}$/
    if (!emailRegex.test(identifier.value) && !phoneRegex.test(identifier.value)) {
      errors.value.identifier = 'Please enter a valid phone number or email'
      isIdentifierValid.value = false
      return
    }
  }

  errors.value.identifier = ''
  isIdentifierValid.value = true
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
  validateIdentifier()
  if (!isIdentifierValid.value) return

  try {
    isSending.value = true
    countdown.value = 60
    
    // 调用 store 里的发送验证码方法
    const res = await userStore.sendCode(identifier.value)
    message.value = res.message
    loginSuccess.value = res.success
    
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
    loginSuccess.value = false
    isSending.value = false
  }
}

// 登录逻辑
const handleLogin = async () => {
  // 验证所有必填字段
  validateIdentifier()
  
  if (mode.value === 'password') {
    validatePassword()
  } else {
    validateCode()
  }
  
  if (!agree.value) {
    errors.value.agree = 'Please agree to the terms'
    return
  }
  
  // 检查是否有错误
  const hasErrors = Object.values(errors.value).some(error => error !== '')
  if (hasErrors) return

  try {
    isLoggingIn.value = true
    message.value = ''
    
    let success = false
    if (mode.value === 'password') {
      success = await userStore.loginWithPassword(identifier.value, password.value)
    } else {
      success = await userStore.loginWithCode(identifier.value, code.value)
    }
    
    if (success) {
      loginSuccess.value = true
      message.value = 'Login successful!'
      // 登录成功后跳转
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      loginSuccess.value = false
      message.value = 'Login failed. Please check your credentials.'
    }
  } catch (error) {
    loginSuccess.value = false
    message.value = error.message || 'Login failed. Please try again.'
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  padding: 20px 0;
}

.login-page::before {
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

.info {
  font-size: 12px;
  line-height: 140%;
  color: #a3a3a3;
  margin-bottom: 8px;
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
  display: flex;
  justify-content: space-around;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.tab span {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 16px;
  transition: all 0.3s;
}

.tab .active {
  color: #08f;
  background-color: #e6f0ff;
  font-weight: 500;
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

/* 登录按钮 */
.submit {
  background-color: #08f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-top: 8px;
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
  justify-content: space-between;
  font-size: 14px;
  margin-top: 8px;
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