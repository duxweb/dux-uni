import type {
  Dict,
  UniAppContext,
  UniAuthProvider,
  UniAuthRequestOptions,
  UniAuthState,
  UniCheckResult,
  UniLoginResult,
  UniLogoutResult,
} from '../types'

export interface SimpleAuthProviderOptions {
  path?: {
    login?: string
    check?: string
    logout?: string
  }
  method?: {
    login?: string
    check?: string
    logout?: string
  }
  route?: {
    login?: string
    index?: string
  }
  permissionKey?: string
}

function normalizeMethod(method?: string) {
  return (method || 'GET').toUpperCase()
}

async function request<T>(
  context: UniAppContext,
  url: string,
  options: {
    method?: string
    data?: Dict
    auth?: UniAuthState | null
  },
) {
  const method = normalizeMethod(options.method)
  return await context.request.request<T>({
    url,
    method,
    data: method === 'GET' || method === 'HEAD' ? undefined : options.data,
    query: method === 'GET' || method === 'HEAD' ? options.data : undefined,
    headers: options.auth?.token
      ? { Authorization: options.auth.token }
      : undefined,
  })
}

function normalizeAuthState(
  auth: UniAuthState | undefined,
  options?: SimpleAuthProviderOptions,
): UniAuthState | undefined {
  if (!auth) {
    return auth
  }

  const permissionKey = options?.permissionKey
  if (!permissionKey || typeof auth.permissions !== 'undefined') {
    return auth
  }

  const mappedPermissions = (auth as Dict)[permissionKey]
  if (typeof mappedPermissions === 'undefined') {
    return auth
  }

  return {
    ...auth,
    permissions: mappedPermissions as UniAuthState['permissions'],
  }
}

export function simpleAuthProvider(options?: SimpleAuthProviderOptions): UniAuthProvider {
  const routeLogin = options?.route?.login || '/pages/auth/login'
  const routeIndex = options?.route?.index || '/pages/home/index'

  return {
    async login(params: Dict, context: UniAppContext, requestOptions?: UniAuthRequestOptions): Promise<UniLoginResult> {
      try {
        const response = await request<{ message?: string; data?: UniAuthState }>(
          context,
          requestOptions?.path || options?.path?.login || '/login',
          {
            method: requestOptions?.method || options?.method?.login || 'POST',
            data: params,
          },
        )
        return {
          success: true,
          message: response.data?.message,
          redirectTo: routeIndex,
          data: normalizeAuthState(response.data?.data, options),
        }
      }
      catch (error) {
        return {
          success: false,
          message: (error as Error).message,
        }
      }
    },
    async logout(params: Dict | undefined, context: UniAppContext, requestOptions?: UniAuthRequestOptions): Promise<UniLogoutResult> {
      const path = requestOptions?.path || options?.path?.logout
      if (path) {
        try {
          await request(context, path, {
            method: requestOptions?.method || options?.method?.logout || 'POST',
            data: params,
            auth: context.session.getAuth(),
          })
        }
        catch {
          // Ignore logout transport errors and clear the local session anyway.
        }
      }

      return {
        success: true,
        redirectTo: routeLogin,
      }
    },
    async check(params: Dict | undefined, context: UniAppContext, auth: UniAuthState | null, requestOptions?: UniAuthRequestOptions): Promise<UniCheckResult> {
      const path = requestOptions?.path || options?.path?.check
      if (!path) {
        return {
          success: Boolean(auth?.token),
          logout: !auth?.token,
          data: auth || undefined,
        }
      }

      try {
        const response = await request<{ message?: string; data?: UniAuthState }>(
          context,
          path,
          {
            method: requestOptions?.method || options?.method?.check || 'GET',
            data: params,
            auth,
          },
        )
        return {
          success: true,
          message: response.data?.message,
          data: normalizeAuthState(response.data?.data, options),
        }
      }
      catch (error) {
        return {
          success: false,
          logout: true,
          message: (error as Error).message,
        }
      }
    },
    can(permission, _context, auth) {
      const permissions = auth?.permissions
      if (!permissions) {
        return true
      }
      if (Array.isArray(permissions)) {
        return permissions.includes(permission)
      }
      return permissions[permission] !== false
    },
    async onError(error) {
      if (error.status === 401) {
        return {
          logout: true,
          redirectTo: routeLogin,
        }
      }
    },
  }
}
