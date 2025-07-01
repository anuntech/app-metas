import { startDailyPDFScheduler } from './daily-pdf-scheduler';

// Flag to ensure scheduler is only started once
let schedulerStarted = false;

export function initializeScheduler() {
  if (schedulerStarted) {
    console.log('⚠️ Agendador já foi inicializado');
    return;
  }

  try {
    // Only start in production or when explicitly enabled
    const shouldStartScheduler = 
      process.env.NODE_ENV === 'production' || 
      process.env.ENABLE_PDF_SCHEDULER === 'true';

    if (shouldStartScheduler) {
      startDailyPDFScheduler();
      schedulerStarted = true;
      console.log('✅ Agendador de PDF diário inicializado');
    } else {
      console.log('⚠️ Agendador de PDF desabilitado (development mode)');
      console.log('💡 Para habilitar, defina ENABLE_PDF_SCHEDULER=true');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar agendador:', error);
  }
}

// Auto-initialize when this module is imported (in production)
if (typeof window === 'undefined') { // Server-side only
  initializeScheduler();
} 