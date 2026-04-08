// Service Worker para PWA - Chronos System
const CACHE_NAME = 'chronos-v1'
const OFFLINE_URL = '/offline'

// Recursos para cache
const STATIC_CACHE_URLS = [
  '/',
  '/employee',
  '/kiosk',
  '/offline',
  '/manifest.json',
  // Adicionar outros recursos estáticos importantes
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache aberto')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ Service Worker: Recursos em cache')
        return self.skipWaiting()
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker: Ativado')
      return self.clients.claim()
    })
  )
})

// Interceptar requisições (estratégia Network First com fallback para cache)
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorar requisições para APIs externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, clonar e armazenar no cache
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Se falhar, tentar buscar no cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            
            // Se não encontrar no cache, retornar página offline para navegação
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
            
            // Para outros recursos, retornar erro
            return new Response('Recurso não disponível offline', {
              status: 404,
              statusText: 'Not Found'
            })
          })
      })
  )
})

// Sincronização em background (para quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronização em background')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar lógica para sincronizar dados
      // quando o app voltar online
      syncOfflineData()
    )
  }
})

// Notificações push (futuro)
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Notificação push recebida')
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Chronos',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Chronos System', options)
  )
})

// Função para sincronizar dados offline (placeholder)
async function syncOfflineData() {
  try {
    // Implementar lógica de sincronização aqui
    console.log('📡 Sincronizando dados offline...')
    
    // Exemplo: enviar registros de ponto salvos offline
    const offlineRecords = await getOfflineRecords()
    
    for (const record of offlineRecords) {
      try {
        await fetch('/api/attendance/qr-unified', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record)
        })
        
        // Remover do armazenamento local após sincronizar
        await removeOfflineRecord(record.id)
      } catch (error) {
        console.error('Erro ao sincronizar registro:', error)
      }
    }
    
    console.log('✅ Sincronização concluída')
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
  }
}

// Funções auxiliares para armazenamento offline
async function getOfflineRecords() {
  // Implementar busca no IndexedDB ou localStorage
  return []
}

async function removeOfflineRecord(id) {
  // Implementar remoção do IndexedDB ou localStorage
  console.log('Removendo registro offline:', id)
}
