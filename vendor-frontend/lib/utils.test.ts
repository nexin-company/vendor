import { describe, it, expect } from 'jest';
import { cn } from './utils';

describe('cn utility', () => {
  it('debe combinar clases correctamente', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('debe manejar clases condicionales', () => {
    const result = cn('base', true && 'conditional');
    expect(result).toContain('base');
    expect(result).toContain('conditional');
  });

  it('debe filtrar valores falsy', () => {
    const result = cn('base', false && 'should-not-appear', null, undefined);
    expect(result).not.toContain('should-not-appear');
    expect(result).toContain('base');
  });
});

