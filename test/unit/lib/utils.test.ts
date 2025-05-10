import { describe, it, expect } from 'vitest';
import { cn } from '../../../src/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      // Arrange
      const input1 = 'text-red-500';
      const input2 = 'bg-blue-300';
      
      // Act
      const result = cn(input1, input2);
      
      // Assert
      expect(result).toBe('text-red-500 bg-blue-300');
    });

    it('should handle conditional classes correctly', () => {
      // Arrange
      const isActive = true;
      const isPrimary = false;
      
      // Act
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isPrimary && 'primary-class'
      );
      
      // Assert
      expect(result).toBe('base-class active-class');
    });

    it('should handle array of classes correctly', () => {
      // Arrange
      const baseClasses = ['text-base', 'font-medium'];
      const conditionalClasses = {
        'text-red-500': true,
        'font-bold': false,
        'p-4': true
      };
      
      // Act
      const result = cn(baseClasses, conditionalClasses);
      
      // Assert
      expect(result).toBe('text-base font-medium text-red-500 p-4');
    });

    it('should handle tailwind conflicts with tailwind-merge', () => {
      // Arrange
      const baseStyle = 'text-gray-500 px-2 py-1';
      const overrideStyle = 'text-blue-500 px-4';
      
      // Act
      const result = cn(baseStyle, overrideStyle);
      
      // Assert
      // tailwind-merge should override conflicting classes (text-* and px-*)
      expect(result).toBe('py-1 text-blue-500 px-4');
    });

    it('should handle undefined and null inputs', () => {
      // Arrange
      const definedClass = 'text-base';
      const undefinedClass = undefined;
      const nullClass = null;
      
      // Act
      const result = cn(definedClass, undefinedClass, nullClass);
      
      // Assert
      expect(result).toBe('text-base');
    });
  });
});