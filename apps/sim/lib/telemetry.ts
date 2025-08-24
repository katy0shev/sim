/**
 * Sim Telemetry
 *
 * This file can be customized in forked repositories:
 * - Set TELEMETRY_ENDPOINT in telemetry.config.ts to your collector
 * - Modify allowed event categories as needed
 * - Edit disclosure text to match your privacy policy
 *
 * Please maintain ethical telemetry practices if modified.
 */
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api'
import { env } from '@/lib/env'
import { isProd } from '@/lib/environment'
import { createLogger } from '@/lib/logs/console/logger'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)

const logger = createLogger('Telemetry')

export type TelemetryEvent = {
  name: string
  properties?: Record<string, any>
}

export type TelemetryStatus = {
  enabled: boolean
}

const TELEMETRY_STATUS_KEY = 'simstudio-telemetry-status'

let telemetryConfig = {
  endpoint: env.TELEMETRY_ENDPOINT || 'https://telemetry.simstudio.ai/v1/traces',
  serviceName: 'sim-studio',
  serviceVersion: '0.1.0',
}

if (typeof window !== 'undefined' && (window as any).__SIM_STUDIO_TELEMETRY_CONFIG) {
  telemetryConfig = { ...telemetryConfig, ...(window as any).__SIM_STUDIO_TELEMETRY_CONFIG }
}

let telemetryInitialized = false

/**
 * Gets the current telemetry status from localStorage
 */
export function getTelemetryStatus(): TelemetryStatus {
  if (typeof window === 'undefined') {
    return { enabled: true }
  }

  try {
    if (env.NEXT_TELEMETRY_DISABLED === '1') {
      return { enabled: false }
    }

    const stored = localStorage.getItem(TELEMETRY_STATUS_KEY)
    return stored ? JSON.parse(stored) : { enabled: true }
  } catch (error) {
    logger.error('Failed to get telemetry status from localStorage', error)
    return { enabled: true }
  }
}

/**
 * Sets the telemetry status in localStorage
 */
export function setTelemetryStatus(status: TelemetryStatus): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(TELEMETRY_STATUS_KEY, JSON.stringify(status))

    if (status.enabled && !telemetryInitialized) {
      initializeClientTelemetry()
    }
  } catch (error) {
    logger.error('Failed to set telemetry status in localStorage', error)
  }
}

/**
 * Disables telemetry
 */
export function disableTelemetry(): void {
  const currentStatus = getTelemetryStatus()
  if (currentStatus.enabled) {
    trackEvent('consent', 'opt_out')
  }

  setTelemetryStatus({ enabled: false })
  logger.info('Telemetry disabled')
}

/**
 * Enables telemetry
 */
export function enableTelemetry(): void {
  if (env.NEXT_TELEMETRY_DISABLED === '1') {
    logger.info('Telemetry disabled by environment variable, cannot enable')
    return
  }

  const currentStatus = getTelemetryStatus()
  if (!currentStatus.enabled) {
    trackEvent('consent', 'opt_in')
  }

  setTelemetryStatus({ enabled: true })
  logger.info('Telemetry enabled')

  if (!telemetryInitialized) {
    initializeClientTelemetry()
  }
}

/**
 * Initialize client-side telemetry without OpenTelemetry SDK
 * This approach uses direct event tracking instead of the OTel SDK
 * to avoid TypeScript compatibility issues while still collecting useful data
 */
function initializeClientTelemetry(): void {}

/**
 * Track a telemetry event
 */
export async function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): Promise<void> {}
