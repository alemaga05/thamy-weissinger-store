import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');

  if (token && role === 'admin') {
    return true; // Acesso permitido
  }

  // Se não for admin, redireciona para o login do admin
  router.navigate(['/admin/login']);
  return false;
};