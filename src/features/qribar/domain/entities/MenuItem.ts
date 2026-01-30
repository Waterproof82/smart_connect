/**
 * MenuItem Entity
 * @module features/qribar/domain/entities
 * 
 * Business rules:
 * - Name must be non-empty
 * - Price must be positive
 * - Description is optional
 */

export interface MenuItemProps {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export class MenuItem {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly category: string,
    public readonly imageUrl: string
  ) {}

  static create(props: MenuItemProps): MenuItem {
    // Business rule: Name cannot be empty
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('MenuItem name cannot be empty');
    }

    // Business rule: Price must be positive
    if (props.price <= 0) {
      throw new Error('MenuItem price must be positive');
    }

    return new MenuItem(
      props.id,
      props.name.trim(),
      props.description?.trim() || '',
      props.price,
      props.category || 'general',
      props.imageUrl || ''
    );
  }

  get formattedPrice(): string {
    return `${this.price.toFixed(2)}€`;
  }

  hasImage(): boolean {
    return this.imageUrl.length > 0;
  }
}
