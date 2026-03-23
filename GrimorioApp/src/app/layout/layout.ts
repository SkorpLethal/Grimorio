import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {

  private sidebar: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;

  ngOnInit(): void {
    this.sidebar = document.getElementById('grimorio-sidebar');
    this.overlay = document.getElementById('gsb-overlay');

    const openBtn  = document.getElementById('gsb-open-btn');
    const closeBtn = document.getElementById('gsb-close-btn');

    openBtn?.addEventListener('click',  () => this.openSidebar());
    closeBtn?.addEventListener('click', () => this.closeSidebar());
    this.overlay?.addEventListener('click', () => this.closeSidebar());
  }

  ngOnDestroy(): void {
    this.closeSidebar();
  }

  openSidebar(): void {
    this.sidebar?.classList.add('gsb--open');
    this.overlay?.classList.add('gsb--visible');
    document.body.style.overflow = 'hidden';
  }

  closeSidebar(): void {
    this.sidebar?.classList.remove('gsb--open');
    this.overlay?.classList.remove('gsb--visible');
    document.body.style.overflow = '';
  }

  // Cerrar sidebar al cambiar de ruta en móvil
  @HostListener('document:click', ['$event'])
  onRouterLinkClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.gsb-link') && window.innerWidth < 1200) {
      this.closeSidebar();
    }
  }
}
