import Cookies from 'js-cookie'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'

/**
 * Giải mã an toàn phần payload của JWT mà không cần thư viện bên ngoài.
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  if (!token || typeof token !== 'string') return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Base64Url sang Base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Kiểm tra xem token JWT đã hết hạn chưa.
 * @param token chuỗi JWT
 * @param bufferSeconds độ lệch giây an toàn trước khi token thực sự hết hạn (mặc định 10s)
 */
export function isTokenExpired(token: string, bufferSeconds = 10): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    // Nếu không decode được payload nhưng token có giá trị, coi như không hợp lệ/hết hạn
    return true
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= currentTimeInSeconds + bufferSeconds
}

/**
 * Lấy token đã lưu từ localStorage hoặc Cookie.
 * Tự động loại bỏ giá trị rác như "null", "undefined".
 * Tự động đồng bộ giữa localStorage và Cookies nếu một bên bị thiếu.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null

  let token = localStorage.getItem(TOKEN_KEY)
  const cookieToken = Cookies.get(TOKEN_KEY)

  // Kiểm tra tính hợp lệ sơ bộ của token string
  const isValidStr = (str?: string | null): str is string =>
    Boolean(str && str !== 'null' && str !== 'undefined' && str.trim().length > 10)

  if (!isValidStr(token) && isValidStr(cookieToken)) {
    token = cookieToken
    localStorage.setItem(TOKEN_KEY, cookieToken)
  } else if (isValidStr(token) && !isValidStr(cookieToken)) {
    Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/' })
  }

  if (!isValidStr(token)) {
    return null
  }

  return token.trim()
}

/**
 * Xóa sạch toàn bộ thông tin phiên đăng nhập khỏi localStorage và Cookies.
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    Cookies.remove(TOKEN_KEY, { path: '/' })
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu phiên đăng nhập:', error)
  }
}

/**
 * Lấy token hợp lệ và còn hạn sử dụng.
 * Nếu token đã hết hạn hoặc không hợp lệ, tự động xóa auth data và trả về null.
 */
export function getValidAuthToken(): string | null {
  const token = getStoredToken()
  if (!token) {
    return null
  }

  if (isTokenExpired(token)) {
    clearAuthData()
    return null
  }

  return token
}

/**
 * Lưu thông tin phiên đăng nhập thống nhất (token + user).
 */
export function setAuthSession(accessToken: string, userInfo: any): void {
  if (typeof window === 'undefined') return

  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    Cookies.set(TOKEN_KEY, accessToken, { expires: 7, path: '/' })
  }

  if (userInfo) {
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
  }
}

/**
 * Kiểm tra xem người dùng hiện tại có phiên đăng nhập hợp lệ hay không.
 */
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false

  const validToken = getValidAuthToken()
  if (!validToken) return false

  const userInfo = localStorage.getItem(USER_KEY)
  if (!userInfo) return false

  try {
    JSON.parse(userInfo)
    return true
  } catch {
    clearAuthData()
    return false
  }
}
