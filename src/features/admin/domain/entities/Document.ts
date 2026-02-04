/**
 * Document Entity (Admin View)
 * 
 * Clean Architecture: Domain Layer
 * 
 * Representa un documento del sistema RAG desde la perspectiva del admin.
 */

export interface DocumentProps {
  id: string;
  content: string;
  source: string;
  category?: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}

export class Document {
  private constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly source: string,
    public readonly category: string,
    public readonly embedding: number[] | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
    public readonly metadata: Record<string, unknown>
  ) {
    this.validate();
  }

  /**
   * Factory method para crear un Document
   */
  static create(props: DocumentProps): Document {
    return new Document(
      props.id,
      props.content,
      props.source,
      props.category || 'general',
      props.embedding || null,
      props.createdAt,
      props.updatedAt || null,
      props.metadata || {}
    );
  }

  /**
   * Validación de reglas de negocio
   */
  private validate(): void {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Document content cannot be empty');
    }

    if (this.content.length > 10000) {
      throw new Error('Document content exceeds maximum length (10000 characters)');
    }

    if (!this.source || this.source.trim().length === 0) {
      throw new Error('Document source cannot be empty');
    }

    if (this.embedding && this.embedding.length !== 768) {
      throw new Error('Embedding must be 768 dimensions if provided');
    }
  }

  /**
   * Verifica si el documento tiene embedding
   */
  hasEmbedding(): boolean {
    return this.embedding !== null && this.embedding.length === 768;
  }

  /**
   * Obtiene un preview del contenido
   */
  getContentPreview(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  /**
   * Crea una copia del documento con contenido actualizado
   */
  withContent(newContent: string): Document {
    return new Document(
      this.id,
      newContent,
      this.source,
      this.category,
      this.embedding,
      this.createdAt,
      new Date(),
      this.metadata
    );
  }
}
