/**
 * Fallback Handler para RAG Chatbot
 * 
 * Clean Architecture: Domain Layer
 * 
 * Responsabilidad:
 * - Proporcionar respuestas inteligentes cuando RAG no encuentra contexto
 * - Detectar intención de consultas (pricing, features, implementation)
 * - Decidir cuándo escalar a humano (confidence < 50%)
 * - Generar sugerencias de acciones contextuales
 * - Tracking de estadísticas de fallback
 * - Personalización basada en usuario e historial
 * 
 * Fase 3 de optimización según ADR-003
 * docs/adr/006-rag-architecture-decision.md
 */

export interface FallbackContext {
  query: string;
  category: string;
  ragResults: unknown[];
  confidence: number;
  userName?: string;
  previousInteractions?: number;
}

export interface FallbackResponse {
  message: string;
  type: 'predefined' | 'contextual' | 'escalation';
  category: string;
  shouldEscalate: boolean;
  escalationReason?: string;
  actionSuggestions: string[];
  tone: 'formal' | 'familiar';
  confidence: number;
}

export interface FallbackStats {
  totalFallbacks: number;
  byCategory: Record<string, number>;
  totalEscalations: number;
  escalationRate: number;
  averageConfidence: number;
}

export class FallbackHandler {
  private stats: {
    totalFallbacks: number;
    byCategory: Map<string, number>;
    totalEscalations: number;
    confidenceSum: number;
  };

  constructor() {
    this.stats = this._getInitialStats();
  }

  /**
   * Get intelligent fallback response
   * 
   * @param context Context of the query and RAG results
   * @returns Fallback response with message and actions
   */
  async getFallback(context: FallbackContext): Promise<FallbackResponse> {
    // Normalize context
    const normalizedContext = this._normalizeContext(context);
    
    // Update statistics
    this._updateStats(normalizedContext);

    // Determine if escalation is needed
    const shouldEscalate = this._shouldEscalate(normalizedContext);
    const escalationReason = shouldEscalate ? this._getEscalationReason(normalizedContext) : undefined;

    // Generate appropriate message
    const message = shouldEscalate
      ? this._getEscalationMessage(normalizedContext)
      : this._getFallbackMessage(normalizedContext);

    // Generate action suggestions
    const actionSuggestions = this._getActionSuggestions(normalizedContext);

    // Determine tone
    const tone = this._determineTone(normalizedContext);

    return {
      message,
      type: shouldEscalate ? 'escalation' : this._getResponseType(normalizedContext),
      category: normalizedContext.category,
      shouldEscalate,
      escalationReason,
      actionSuggestions,
      tone,
      confidence: normalizedContext.confidence,
    };
  }

  /**
   * Get fallback statistics
   */
  getStats(): FallbackStats {
    const totalRequests = this.stats.totalFallbacks;
    const escalationRate = totalRequests > 0 
      ? this.stats.totalEscalations / totalRequests 
      : 0;
    const averageConfidence = totalRequests > 0 
      ? this.stats.confidenceSum / totalRequests 
      : 0;

    return {
      totalFallbacks: this.stats.totalFallbacks,
      byCategory: Object.fromEntries(this.stats.byCategory),
      totalEscalations: this.stats.totalEscalations,
      escalationRate,
      averageConfidence,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = this._getInitialStats();
  }

  /**
   * Get initial stats object (used by constructor and resetStats)
   */
  private _getInitialStats() {
    return {
      totalFallbacks: 0,
      byCategory: new Map<string, number>(),
      totalEscalations: 0,
      confidenceSum: 0,
    };
  }

  /**
   * Normalize context to handle edge cases
   */
  private _normalizeContext(context: FallbackContext): FallbackContext {
    return {
      query: context.query || '',
      category: context.category || 'general',
      ragResults: context.ragResults || [],
      confidence: Math.max(0, Math.min(1, context.confidence || 0)),
      userName: context.userName,
      previousInteractions: context.previousInteractions || 0,
    };
  }

  /**
   * Update statistics
   */
  private _updateStats(context: FallbackContext): void {
    this.stats.totalFallbacks++;
    
    const categoryCount = this.stats.byCategory.get(context.category) || 0;
    this.stats.byCategory.set(context.category, categoryCount + 1);
    
    this.stats.confidenceSum += context.confidence;
  }

  /**
   * Determine if human escalation is needed
   */
  private _shouldEscalate(context: FallbackContext): boolean {
    const query = context.query.toLowerCase();
    
    // Urgent or sensitive queries (priority over confidence)
    const urgentKeywords = ['urgente', 'problema', 'ayuda', 'error', 'fallo'];
    if (urgentKeywords.some(keyword => query.includes(keyword))) {
      this.stats.totalEscalations++;
      return true;
    }

    // Implementation queries (often need human consultation)
    const implementKeywords = ['implemento', 'implementar', 'integrar', 'instalar'];
    if (implementKeywords.some(keyword => query.includes(keyword))) {
      this.stats.totalEscalations++;
      return true;
    }

    // Low confidence threshold (critical check)
    if (context.confidence < 0.5) {
      this.stats.totalEscalations++;
      return true;
    }

    return false;
  }

  /**
   * Get escalation reason
   */
  private _getEscalationReason(context: FallbackContext): string {
    if (context.confidence < 0.5) {
      return 'low_confidence';
    }

    const query = context.query.toLowerCase();
    if (['urgente', 'problema', 'ayuda', 'error'].some(k => query.includes(k))) {
      return 'urgent';
    }

    if (['implemento', 'implementar'].some(k => query.includes(k))) {
      return 'sensitive';
    }

    return 'general';
  }

  /**
   * Get escalation message
   */
  private _getEscalationMessage(context: FallbackContext): string {
    const greeting = context.userName ? `${context.userName}, ` : '';
    
    return `${greeting}Entiendo que necesitas ayuda más específica. ¿Te gustaría conectarte con un miembro de nuestro equipo humano? Ellos podrán ayudarte mejor con tu consulta.`;
  }

  /**
   * Get fallback message based on category and query intent
   */
  private _getFallbackMessage(context: FallbackContext): string {
    const intent = this._detectIntent(context.query);
    const category = context.category;
    const greeting = context.userName ? `Hola ${context.userName}, ` : '';

    // Pricing queries
    if (intent === 'pricing') {
      return this._getPricingFallback(category, greeting);
    }

    // Feature queries
    if (intent === 'features') {
      return this._getFeaturesFallback(category, greeting);
    }

    // Implementation queries
    if (intent === 'implementation') {
      return this._getImplementationFallback(category, greeting);
    }

    // Success stories
    if (intent === 'success_stories') {
      return this._getSuccessStoriesFallback(category, greeting);
    }

    // Default category-based fallback
    return this._getCategoryFallback(category, greeting);
  }

  /**
   * Detect query intent
   */
  private _detectIntent(query: string): string {
    const q = query.toLowerCase();

    if (['cuánto', 'cuesta', 'precio', 'tarifa', 'costo', 'inversión'].some(k => q.includes(k))) {
      return 'pricing';
    }

    if (['características', 'funciones', 'features', 'qué hace', 'cómo funciona'].some(k => q.includes(k))) {
      return 'features';
    }

    if (['implemento', 'implementar', 'integrar', 'instalar'].some(k => q.includes(k))) {
      return 'implementation';
    }

    if (['casos de éxito', 'testimonios', 'clientes', 'ejemplos'].some(k => q.includes(k))) {
      return 'success_stories';
    }

    if (['demo', 'demostración', 'ver', 'mostrar'].some(k => q.includes(k))) {
      return 'demo';
    }

    return 'general';
  }

  /**
   * Get pricing fallback
   */
  private _getPricingFallback(category: string, greeting: string): string {
    if (category === 'qribar') {
      return `${greeting}QRIBAR ofrece planes flexibles adaptados a las necesidades de cada restaurante. La inversión depende del número de mesas y funcionalidades que necesites. ¿Te gustaría que te enviemos un presupuesto personalizado?`;
    }

    if (category === 'reviews') {
      return `${greeting}Nuestro servicio de gestión de reputación online tiene planes desde básicos hasta premium. El costo varía según la cantidad de plataformas y el nivel de gestión. ¿Te contactamos para darte más detalles?`;
    }

    return `${greeting}Nuestros servicios tienen precios competitivos adaptados a cada negocio. ¿Te gustaría que un asesor te contacte para darte información personalizada sobre costos?`;
  }

  /**
   * Get features fallback
   */
  private _getFeaturesFallback(category: string, greeting: string): string {
    if (category === 'qribar') {
      return `${greeting}QRIBAR es una carta digital innovadora que incluye: menú interactivo con QR, gestión de pedidos en mesa, pagos integrados, análisis de ventas en tiempo real, y actualizaciones instantáneas de productos y precios.`;
    }

    if (category === 'reviews') {
      return `${greeting}Nuestro sistema de gestión de reputación online incluye: monitoreo de Google Reviews e Instagram, respuestas automáticas a reseñas, análisis de sentimiento, campañas de captación de reviews, y reportes de desempeño.`;
    }

    return `${greeting}SmartConnect ofrece soluciones completas de digitalización: cartas digitales (QRIBAR), gestión de reputación online, automatizaciones de marketing, y chatbots con IA. Todo pensado para hacer crecer tu negocio.`;
  }

  /**
   * Get implementation fallback
   */
  private _getImplementationFallback(category: string, greeting: string): string {
    return `${greeting}La implementación es rápida y sin complicaciones. Nuestro equipo te acompaña en todo el proceso: configuración inicial, capacitación, y soporte continuo. ¿Te gustaría agendar una llamada para ver cómo podemos ayudarte?`;
  }

  /**
   * Get success stories fallback
   */
  private _getSuccessStoriesFallback(category: string, greeting: string): string {
    if (category === 'qribar') {
      return `${greeting}Restaurantes como La Taverna y El Asador han aumentado sus ventas en un 30% usando QRIBAR. Los clientes valoran la experiencia digital y la rapidez en los pedidos.`;
    }

    if (category === 'reviews') {
      return `${greeting}Negocios locales han mejorado su reputación online en un 40% en los primeros 3 meses. Más reviews positivas significa más clientes nuevos.`;
    }

    return `${greeting}Nuestros clientes han visto resultados increíbles: más ventas, mejor reputación online, y procesos automatizados que les ahorran tiempo. ¿Quieres ver casos específicos de tu industria?`;
  }

  /**
   * Get category-based fallback
   */
  private _getCategoryFallback(category: string, greeting: string): string {
    if (category === 'qribar') {
      return `${greeting}QRIBAR es nuestra solución de carta digital que revoluciona la experiencia en restaurantes y bares. Permite a los clientes ver el menú, hacer pedidos y pagar desde su móvil escaneando un QR.`;
    }

    if (category === 'reviews') {
      return `${greeting}Nuestro servicio de gestión de reputación online te ayuda a potenciar tus Google Reviews e Instagram. Más reviews positivas significa más visibilidad y más clientes.`;
    }

    return `${greeting}SmartConnect es una agencia-escuela que transforma negocios mediante soluciones técnicas: digitalización, automatización e IA. Nos enfocamos en aportar valor inmediato a cada proyecto.`;
  }

  /**
   * Get response type
   */
  private _getResponseType(context: FallbackContext): 'predefined' | 'contextual' {
    const intent = this._detectIntent(context.query);
    return intent === 'general' ? 'predefined' : 'contextual';
  }

  /**
   * Get action suggestions
   */
  private _getActionSuggestions(context: FallbackContext): string[] {
    const intent = this._detectIntent(context.query);
    const suggestions: string[] = [];

    if (intent === 'pricing' || intent === 'implementation') {
      suggestions.push('contact');
    }

    if (intent === 'features' || intent === 'general') {
      suggestions.push('documentation');
    }

    if (intent === 'demo' || context.query.toLowerCase().includes('ver')) {
      suggestions.push('demo');
    }

    if (intent === 'success_stories') {
      suggestions.push('testimonials');
    }

    // Always offer contact as fallback
    if (!suggestions.includes('contact')) {
      suggestions.push('contact');
    }

    return suggestions;
  }

  /**
   * Determine tone based on user history
   */
  private _determineTone(context: FallbackContext): 'formal' | 'familiar' {
    return (context.previousInteractions || 0) >= 3 ? 'familiar' : 'formal';
  }
}
