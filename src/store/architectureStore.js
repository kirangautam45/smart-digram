import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { temporal } from 'zundo'


const defaultArchitecture = `architecture-beta

group client(cloud)[Client Apps]
group auth(cloud)[Auth Service]
group db(cloud)[Database Layer]
group monitor(cloud)[Monitoring]

service web_app(server)[Web App] in client
service mobile_app(server)[Mobile App] in client
service desktop_app(server)[Desktop Client] in client
service api_client(server)[API Client] in client

service api_gateway(server)[API Gateway] in auth
service login_service(server)[Login Service] in auth
service token_service(server)[Token Service] in auth
service otp_service(server)[OTP Service] in auth

service user_db(database)[User DB] in db
service token_store(database)[Token Store] in db
service otp_store(azure-firewall)[OTP Store] in db
service session_store(database)[Session Store] in db



service log_service(disk)[Log Service] in monitor
service audit_service(cosmos-db)[Audit Service] in monitor
service alert_service(server)[Alert Service] in monitor
service metrics_service(disk)[Metrics Service] in monitor



web_app:b -- l:api_gateway
web_app:r -- l:api_gateway
mobile_app:r -- l:api_gateway



api_gateway:R -- L:login_service
login_service:R -- L:token_service
login_service:B -- T:otp_service



login_service:R -- L:user_db
token_service:R -- L:token_store
otp_service:R -- L:otp_store
token_service:B -- T:session_store



login_service:B -- T:log_service
token_service:B -- T:metrics_service
otp_service:B -- T:audit_service
api_gateway:B -- T:alert_service



%% Position: client = [440, 80]
%% Dimension: client = [1220, 760]
%% Position: web_app = [1040, 579]
%% Dimension: web_app = [180, 181]
%% Position: mobile_app = [840, 150]
%% Dimension: mobile_app = [180, 181]
%% Position: desktop_app = [1040, 0]
%% Dimension: desktop_app = [180, 173]
%% Position: api_client = [200, 150]
%% Dimension: api_client = [180, 181]
%% Position: auth = [2180, 80]
%% Dimension: auth = [900, 1120]
%% Position: api_gateway = [200, 150]
%% Dimension: api_gateway = [180, 181]
%% Position: login_service = [200, 510]
%% Dimension: login_service = [180, 181]
%% Position: token_service = [520, 870]
%% Dimension: token_service = [180, 181]
%% Position: otp_service = [200, 870]
%% Dimension: otp_service = [180, 181]
%% Position: db = [120, 1380]
%% Dimension: db = [1540, 400]
%% Position: user_db = [1160, 150]
%% Dimension: user_db = [180, 173]
%% Position: token_store = [840, 150]
%% Dimension: token_store = [180, 181]
%% Position: otp_store = [200, 150]
%% Dimension: otp_store = [180, 181]
%% Position: session_store = [520, 150]
%% Dimension: session_store = [180, 181]
%% Position: monitor = [1860, 1380]
%% Dimension: monitor = [1540, 400]
%% Position: log_service = [840, 150]
%% Dimension: log_service = [180, 181]
%% Position: audit_service = [520, 150]
%% Dimension: audit_service = [180, 181]
%% Position: alert_service = [200, 150]
%% Dimension: alert_service = [180, 181]
%% Position: metrics_service = [1160, 150]
%% Dimension: metrics_service = [180, 181]
`


// Helper: Find line index by ID
function findLineIndexById(lines, id) {
  return lines.findIndex((line) => {
    const groupMatch = line.match(/group\s+(\w+)\(/)
    const serviceMatch = line.match(/service\s+(\w+)\(/)
    const foundId =
      (groupMatch && groupMatch[1]) || (serviceMatch && serviceMatch[1])
    return foundId === id
  })
}

// Helper: Remove line by ID
function removeLineById(data, id) {
  const lines = data.split('\n')
  const index = findLineIndexById(lines, id)
  if (index !== -1) {
    lines.splice(index, 1)
  }
  return lines.join('\n')
}

// Helper: Get all service IDs in a group
function getServiceIdsInGroup(data, groupId) {
  const lines = data.split('\n')
  const serviceIds = []
  lines.forEach((line) => {
    const serviceMatch = line.match(/service\s+(\w+)\(\w+\)\[.+\]\s+in\s+(\w+)/)
    if (serviceMatch && serviceMatch[2] === groupId) {
      serviceIds.push(serviceMatch[1])
    }
  })
  return serviceIds
}

// Helper: Remove all services in a group
function removeServicesInGroup(data, groupId) {
  const lines = data.split('\n')
  const filtered = lines.filter((line) => {
    const serviceMatch = line.match(/service\s+\w+\(\w+\)\[.+\]\s+in\s+(\w+)/)
    return !serviceMatch || serviceMatch[1] !== groupId
  })
  return filtered.join('\n')
}

// Helper: Remove edges connected to an ID
function removeEdgesWithId(data, id) {
  const lines = data.split('\n')
  const filtered = lines.filter((line) => {
    const connectionMatch = line.match(
      /(\w+)(?::([LRTB]))?\s*--\s*(?:([LRTB]):)?(\w+)/
    )
    if (!connectionMatch) return true
    const [, sourceId, , , targetId] = connectionMatch
    return sourceId !== id && targetId !== id
  })
  return filtered.join('\n')
}

// Helper: Update line by ID
function updateLineById(data, id, updates) {
  const lines = data.split('\n')
  const index = findLineIndexById(lines, id)

  if (index !== -1) {
    const line = lines[index]

    // Check if it's a group
    const groupMatch = line.match(/group\s+(\w+)\((\w+)\)\[([^\]]+)\]/)
    if (groupMatch) {
      const [, gId, gType, gLabel] = groupMatch
      const newType = updates.type || gType
      const newLabel = updates.label || gLabel
      lines[index] = `group ${gId}(${newType})[${newLabel}]`
    }

    // Check if it's a service
    const serviceMatch = line.match(
      /service\s+(\w+)\((\w+)\)\[([^\]]+)\]\s+in\s+(\w+)/
    )
    if (serviceMatch) {
      const [, sId, sType, sLabel, sGroup] = serviceMatch
      const newType = updates.type || sType
      const newLabel = updates.label || sLabel
      const newGroup = updates.groupId || sGroup
      lines[index] = `service ${sId}(${newType})[${newLabel}] in ${newGroup}`
    }
  }

  return lines.join('\n')
}

// Helper: Insert line after section
function insertAfterSection(data, sectionType, newLine) {
  const lines = data.split('\n')
  let insertIndex = -1

  // Find last occurrence of the section type
  for (let i = lines.length - 1; i >= 0; i--) {
    if (sectionType === 'group' && lines[i].startsWith('group ')) {
      insertIndex = i + 1
      break
    } else if (sectionType === 'service' && lines[i].startsWith('service ')) {
      insertIndex = i + 1
      break
    }
  }

  // If no section found, insert after architecture-beta line
  if (insertIndex === -1) {
    const headerIndex = lines.findIndex((line) =>
      line.includes('architecture-beta')
    )
    insertIndex = headerIndex + 1
    // Add empty line before if this is the first group
    if (sectionType === 'group') {
      lines.splice(insertIndex, 0, '', newLine)
      return lines.join('\n')
    }
  }

  lines.splice(insertIndex, 0, newLine)
  return lines.join('\n')
}

export const useArchitectureStore = create(
  temporal(
    persist(
      (set, get) => ({
        architectureData: defaultArchitecture,

        // Group CRUD
        addGroup: (id, type, label) => {
          const current = get().architectureData
          const newLine = `group ${id}(${type})[${label}]`
          const updated = insertAfterSection(current, 'group', newLine)
          set({ architectureData: updated })
        },

        updateGroup: (id, updates) => {
          const current = get().architectureData
          const updated = updateLineById(current, id, updates)
          set({ architectureData: updated })
        },

        deleteGroup: (id) => {
          let current = get().architectureData
          // First get all service IDs in the group
          const serviceIds = getServiceIdsInGroup(current, id)
          // Remove edges connected to each service in the group
          for (const serviceId of serviceIds) {
            current = removeEdgesWithId(current, serviceId)
          }
          // Remove services in the group
          current = removeServicesInGroup(current, id)
          // Remove edges connected to the group itself
          current = removeEdgesWithId(current, id)
          // Remove the group itself
          current = removeLineById(current, id)
          set({ architectureData: current })
        },

        // Service CRUD
        addService: (id, type, label, groupId) => {
          const current = get().architectureData
          const newLine = `service ${id}(${type})[${label}] in ${groupId}`
          const updated = insertAfterSection(current, 'service', newLine)
          set({ architectureData: updated })
        },

        updateService: (id, updates) => {
          const current = get().architectureData
          const updated = updateLineById(current, id, updates)
          set({ architectureData: updated })
        },

        deleteService: (id) => {
          let current = get().architectureData
          // Remove edges connected to the service
          current = removeEdgesWithId(current, id)
          // Remove the service itself
          current = removeLineById(current, id)
          set({ architectureData: current })
        },

        // Edge CRUD
        addEdge: (sourceId, targetId, sourcePos = '', targetPos = '') => {
          const current = get().architectureData
          const lines = current.split('\n')

          // Find the connections section (lines that contain --)
          let insertIndex = lines.length
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('--')) {
              insertIndex = i + 1
              break
            }
          }

          const sourcePart = sourcePos ? `${sourceId}:${sourcePos}` : sourceId
          const targetPart = targetPos ? `${targetPos}:${targetId}` : targetId
          const newLine = `${sourcePart} -- ${targetPart}`

          lines.splice(insertIndex, 0, newLine)
          set({ architectureData: lines.join('\n') })
        },

        deleteEdge: (sourceId, targetId) => {
          const current = get().architectureData
          const lines = current.split('\n')
          const filtered = lines.filter((line) => {
            const match = line.match(
              /(\w+)(?::([LRTB]))?\s*--\s*(?:([LRTB]):)?(\w+)/
            )
            if (!match) return true
            const [, src, , , tgt] = match
            return !(src === sourceId && tgt === targetId)
          })
          set({ architectureData: filtered.join('\n') })
        },

        // Utility
        setArchitectureData: (data) => {
          set({ architectureData: data })
        },

        resetToDefault: () => {
          set({ architectureData: defaultArchitecture })
        },

        getArchitectureData: () => {
          return get().architectureData
        },
      }),
      {
        name: 'architecture-data-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    {
      limit: 50, // Keep last 50 states
      equality: (pastState, currentState) =>
        pastState.architectureData === currentState.architectureData,
    }
  )
)
