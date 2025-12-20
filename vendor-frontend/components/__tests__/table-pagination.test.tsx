import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TablePagination } from '../table-pagination';

describe('TablePagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  it('debe renderizar información de paginación', () => {
    render(<TablePagination {...defaultProps} />);

    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    expect(screen.getByText(/50/i)).toBeInTheDocument();
  });

  it('debe mostrar botones de navegación', () => {
    render(<TablePagination {...defaultProps} />);

    expect(screen.getByText(/Anterior/i)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente/i)).toBeInTheDocument();
  });

  it('debe deshabilitar botón anterior en primera página', () => {
    render(<TablePagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByText(/Anterior/i).closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('debe deshabilitar botón siguiente en última página', () => {
    render(<TablePagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByText(/Siguiente/i).closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('debe llamar onPageChange al hacer clic en siguiente', () => {
    const onPageChange = jest.fn();
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />);

    const nextButton = screen.getByText(/Siguiente/i).closest('button');
    fireEvent.click(nextButton!);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('no debe renderizar si hay una sola página', () => {
    const { container } = render(
      <TablePagination {...defaultProps} totalPages={1} />
    );

    expect(container.firstChild).toBeNull();
  });
});

