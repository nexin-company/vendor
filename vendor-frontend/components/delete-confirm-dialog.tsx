'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface DeleteConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  trigger: ReactNode;
  itemName?: string;
}

/**
 * Componente reutilizable para confirmar eliminación de items
 * 
 * @param title - Título del diálogo (por defecto: "¿Estás seguro?")
 * @param description - Descripción del diálogo (por defecto: genérico)
 * @param onConfirm - Función a ejecutar al confirmar
 * @param trigger - Elemento que activa el diálogo (normalmente un Button)
 * @param itemName - Nombre del item a eliminar (para personalizar mensaje)
 */
export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
  itemName,
}: DeleteConfirmDialogProps) {
  const defaultTitle = title || '¿Estás seguro?';
  const defaultDescription =
    description ||
    `Esta acción no se puede deshacer. ${itemName ? `Se eliminará permanentemente "${itemName}".` : 'El elemento se eliminará permanentemente.'}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>{defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

